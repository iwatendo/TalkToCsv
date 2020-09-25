import LocalCache from '../../../Contents/Cache/LocalCache';
import ChatClientController from "../ChatClientController";
import ChatMessageSender from '../../../Contents/Sender/ChatMessageSender';
import ChatInfoSender from '../../../Contents/Sender/ChatInfoSender';
import IntervalSend from '../../../Base/Util/IntervalSend';
import RecognitionUtil from "../../../Base/Util/RecognitionUtil";
import RecordingUtil from "../../../Base/Util/RecordingUtil";
import StdUtil from "../../../Base/Util/StdUtil";
import AudioBlobSender from '../../../Contents/Sender/AudioBlobSender';
import SWMsgPack from '../../../Base/WebRTC/SWMsgPack';
import ReactDOM = require('react-dom');
import React = require('react');
import { ColorComponent } from './ColorComponent';

export default class InputPaneController {

    private _textareaElement = document.getElementById('sbj-inputpanel-text') as HTMLInputElement;
    private _sendMessageButton = document.getElementById('sbj-inputpanel-send-message-button') as HTMLInputElement;

    private _voiceRecordingSwitch = document.getElementById('sbj-check-recording-label');
    private _controller: ChatClientController;


    private _isVoiceSpeech: boolean;
    private _selectLang: string;

    /**
     * コンストラクタ
     * @param controller 
     */
    constructor(controller: ChatClientController) {

        this._controller = controller;
        this._voiceRecordingSwitch.hidden = true;

        document.onkeydown = this.OnOtherKeyPress;

        //  イベント設定
        this._textareaElement.onkeydown = (e) => { this.OnKeyDown(e); };
        this._sendMessageButton.onclick = (e) => { this.SendInputMessage(); };

        const selectElement = document.querySelector('#select-lang');

        if(selectElement){
            selectElement.addEventListener('change', (event) => {
                let lang = this.GetLang();
                this.ChangeVoiceRecognition(lang);
            });
        }

        let element: HTMLElement = document.getElementById('sbj-chatmessage-color');

        let actor = controller.CurrentActor;
        ReactDOM.render(<ColorComponent controller={controller} actor={actor} />, element, () => { });

        this.ClearText();
    }


    /**
     * 録音機能を有効にするか？
     */
    private get IsRecording(): boolean {
        return (document.getElementById('sbj-check-recording') as HTMLInputElement).checked;
    }


    /**
     * テキストエリア以外でエンターキーが押された場合に、テキストエリアにフォーカスを設定を移す
     * @param e 
     */
    public OnOtherKeyPress(e: KeyboardEvent) {
        if (e.key === 'Enter') {
            //  廃止
            //  document.getElementById('sbj-inputpanel-text').focus();
        }
        //  エスケープキーは入力中の文字をクリアして終了
        if (e.key === 'Escape') {
            e.returnValue = false;
            RecognitionUtil.Cancel();
            return;
        }
    }

    /**
     * テキストエリアのキーイベント
     * @param e 
     */
    private OnKeyDown(e: KeyboardEvent) {

        //  エスケープキーは入力中の文字をクリアして終了
        if (e.key === 'Escape') {
            e.returnValue = false;
            this.ClearText();
            return;
        }

        //  エンターキーは設定によって動作を変える
        if (e.key === 'Enter') {

            let isSend = false;

            //  CTRLキー押下時は、設定に関わらず送信
            if (e.ctrlKey) {
                isSend = true;
            }
            else {
                //  それ以外の場合は設定によって動作を変える
                isSend = (LocalCache.ChatEnterMode === 0);
                if (e.shiftKey || e.altKey) isSend = !isSend;
            }

            if (isSend) {
                e.preventDefault();
                if (this.IsInput()) {
                    //  入力がされている場合は送信する
                    this.SendInputMessage();
                }
            }
            return;
        }

    }


    /**
     * 入力されているか？
     */
    private IsInput(): boolean {
        let text = this._textareaElement.value;
        return (text.replace(/\s/g, "").length > 0);
    }


    /**
     * メッセージ送信
     * @param e 
     */
    private SendInputMessage() {

        let text = this._textareaElement.value;

        if (text && text.length > 0) {
            this.SendChatMessage(text, false);
            this.ClearText();
        }
    }


    /**
     * テキストエリアのクリア処理
     */
    private ClearText() {
        this._textareaElement.value = "";
    }


    /**
     * 音声認識のテキスト処理
     * @param text 
     */
    private SendVoiceText(text): ChatMessageSender | undefined {

        let sendVoiceType = 1;

        switch (sendVoiceType) {
            case 0:
                //  チャットのテキストエリアにセット
                let start = this._textareaElement.value.length;
                let end = text.length;
                this._textareaElement.value = this._textareaElement.value + text;
                this._textareaElement.selectionStart = start;
                this._textareaElement.selectionEnd = start + end;
                break;
            case 1:
                //  直接チャットメッセージとして送信
                return this.SendChatMessage(text, this.IsRecording);
        }
    }


    private CreateChatMessage(text: string, isVoiceRecognition: boolean): ChatMessageSender {
        let chm = new ChatMessageSender();
        let actor = this._controller.CurrentActor;
        chm.mid = StdUtil.CreateUuid();
        chm.peerid = this._controller.PeerId;
        chm.aid = actor.aid;
        chm.name = actor.name;
        chm.chatBgColor = actor.chatBgColor;
        chm.iid = actor.dispIid;
        chm.text = text;
        chm.isVoiceRecog = isVoiceRecognition;
        chm.isSpeech = this._isVoiceSpeech;
        return chm;
    }


    /**
     * メッセージ送信
     * @param text 
     */
    private SendChatMessage(text: string, isVoiceRecognition: boolean): ChatMessageSender {

        let chm = this.CreateChatMessage(text, isVoiceRecognition);
        this._controller.SendChatMessage(chm);
        return chm;
    }


    private _intervalSend = new IntervalSend<ChatInfoSender>(200);


    /**
     * 選択されている言語を取得
     */
    private GetLang(): string {
        return (document as any).form.lang.value;
    }


    /**
     * 音声認識によるチャットメッセージ入力
     */
    private async ChangeVoiceRecognition(lang: string) {

        RecordingUtil.initilize((audioBlob) => {
            SWMsgPack.BlobToArray(audioBlob).then((value) => {
                if (RecordingUtil.Mid) {
                    let sender = new AudioBlobSender();
                    sender.mid = RecordingUtil.Mid;
                    sender.binary = value as ArrayBuffer;
                    this._controller.SwPeer.SendToOwner(sender);
                    RecordingUtil.Mid = "";
                }
            });
        });

        //  音声入力がOFFまたは選択されている言語が変更された場合、音声入力を止める
        if (lang.length === 0 || lang !== this._selectLang) {
            RecognitionUtil.Stop();
            this._textareaElement.disabled = false;
            this._voiceRecordingSwitch.hidden = true;
            await StdUtil.Sleep(200);
        }
        this._selectLang = lang;

        if (this._selectLang.length > 0) {
            this._voiceRecordingSwitch.hidden = false;
            RecognitionUtil.InitSpeechRecognition(
                this._controller,
                (text, isFinal) => {
                    if (text) {
                        if (isFinal) {
                            let chm = this.SendVoiceText(text);
                            RecordingUtil.Mid = chm.mid;
                            this._textareaElement.value = "";
                        }
                        else {
                            this._textareaElement.value = text;
                        }
                    }
                    else {
                        this._textareaElement.value = "";
                    }

                }
                , () => {
                    if (this.IsRecording) {
                        RecordingUtil.start();
                    }
                    this._textareaElement.disabled = true;
                }
                , () => {
                    RecordingUtil.stop();
                    this._textareaElement.disabled = false;
                    //  this._textareaElement.focus();
                }
            );

            RecognitionUtil.Start(lang);

        }

    }

}