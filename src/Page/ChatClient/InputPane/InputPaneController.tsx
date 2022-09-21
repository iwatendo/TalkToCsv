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
    private _latestSppechMid: string;

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

        if (selectElement) {
            selectElement.addEventListener('change', (event) => {
                let lang = this.GetLang();
                this.ChangeVoiceRecognition(lang);
            });
        }

        let element: HTMLElement = document.getElementById('sbj-chatmessage-color');

        let actor = controller.CurrentActor;
        ReactDOM.render(<ColorComponent controller={controller} actor={actor} />, element, () => { });


        //  録音機能をON時、録音処理の初期化処理を実行
        (document.getElementById('sbj-check-recording') as HTMLInputElement).onchange = (e) => {

            if (this.IsRecording) {
                this.RecordingInitilize();
            }
        };

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
            let mid = StdUtil.CreateUuid();
            this.SendChatMessage(mid,text, false);
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
    private SendVoiceText(mid: string, text:string, isRec: boolean): ChatMessageSender | undefined {

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
                return this.SendChatMessage(mid, text, isRec);
        }
    }


    /**
     * @param mid メッセージID
     * @param text テキスト
     * @param isRec 録音有無
     */
    private CreateChatMessage(mis:string, text: string, isRec: boolean): ChatMessageSender {
        let chm = new ChatMessageSender();
        let actor = this._controller.CurrentActor;
        chm.mid = mis;
        chm.peerid = this._controller.PeerId;
        chm.aid = actor.aid;
        chm.name = actor.name;
        chm.chatBgColor = actor.chatBgColor;
        chm.iid = actor.dispIid;
        chm.text = text;
        chm.isVoiceRecog = isRec;
        chm.isSpeech = this._isVoiceSpeech;
        return chm;
    }


    /**
     * 
     * @param mid メッセージID
     * @param text テキスト
     * @param isRec 
     * @returns 
     */
    private SendChatMessage(mid:string,text: string, isRec: boolean): ChatMessageSender {

        let chm = this.CreateChatMessage(mid,text, isRec);
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
     * 録音機能の初期化
     */
     private RecordingInitilize() {
        RecordingUtil.initilize((audioBlob) => {
                SWMsgPack.BlobToArray(audioBlob).then((value) => {
                    if (this._latestSppechMid && RecordingUtil.IsRecorded) {
                        let sender = new AudioBlobSender();
                        sender.mid = this._latestSppechMid;
                        sender.binary = value as ArrayBuffer;
                        this._controller.SwPeer.SendToOwner(sender);
                        this._latestSppechMid = "";
                        RecordingUtil.IsRecorded = false;
                    }
                });
            });
    }


    /**
     * 音声認識によるチャットメッセージ入力
     */
    private async ChangeVoiceRecognition(lang: string) {

        //  音声入力がOFFまたは選択されている言語が変更された場合、音声入力を止める
        if (lang.length === 0 || lang !== this._selectLang) {
            RecognitionUtil.Stop();
            this._textareaElement.disabled = false;
            this._voiceRecordingSwitch.hidden = true;
            await StdUtil.Sleep(200);
        }
        this._selectLang = lang;

        let isFirst = true;
        let mid = StdUtil.CreateUuid();

        if (this._selectLang.length > 0) {
            this._voiceRecordingSwitch.hidden = false;
            RecognitionUtil.InitSpeechRecognition(
                this._controller,
                (text, isFinal) => {
                    if (text) {

                        if(isFirst){
                            isFirst = false;
                            mid = StdUtil.CreateUuid();
                        }

                        if (isFinal) {
                            let chm = this.SendVoiceText(mid,text, RecordingUtil.IsRecorded);
                            this._textareaElement.value = "";
                            this._latestSppechMid = chm.mid;
                            isFirst = true;
                        }
                        else {
                            this.SendVoiceText(mid,text, false);
                            this._textareaElement.value = text;
                        }
                    }
                    else {
                        this._textareaElement.value = "";
                    }

                }
                , () => {
                    if (this.IsRecording && RecordingUtil.IsInit) {
                        RecordingUtil.start();
                    }
                    this._textareaElement.disabled = true;
                }
                , () => {
                    RecordingUtil.stop();
                    this._textareaElement.disabled = false;
                }
            );

            RecognitionUtil.Start(lang);

        }

    }

}