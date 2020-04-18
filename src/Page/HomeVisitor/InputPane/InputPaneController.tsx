import StdUtil from "../../../Base/Util/StdUtil";
import LinkUtil from "../../../Base/Util/LinkUtil";
import SpeechUtil from "../../../Base/Util/SpeechUtil";

import LocalCache from '../../../Contents/Cache/LocalCache';
import * as Timeline from "../../../Contents/IndexedDB/Timeline";

import HomeVisitorController from "../HomeVisitorController";
import ChatMessageSender from '../../../Contents/Sender/ChatMessageSender';
import ChatInfoSender from '../../../Contents/Sender/ChatInfoSender';
import IntervalSend from '../../../Base/Util/IntervalSend';

export default class InputPaneController {

    private _textareaElement = document.getElementById('sbj-inputpanel-text') as HTMLInputElement;
    private _selectActorButton = document.getElementById('sbj-inputpanel-select-actor-button');
    private _sendMessageButton = document.getElementById('sbj-inputpanel-send-message-button') as HTMLInputElement;

    private _voiceSpeech = document.getElementById('sbj-inputpanel-speech');
    private _voiceSpeechOn = document.getElementById('sbj-inputpanel-speech-on');
    private _voiceSpeechOff = document.getElementById('sbj-inputpanel-speech-off');

    private _voiceRecognition = document.getElementById('sbj-inputpanel-send-message-recognition');
    private _voiceRecognitionOn = document.getElementById('sbj-inputpanel-send-message-recognition-on');
    private _voiceRecognitionOff = document.getElementById('sbj-inputpanel-send-message-recognition-off');

    private _voiceMic = document.getElementById('sbj-inputpanel-voicechatmic') as HTMLInputElement;
    private _profileFrame = document.getElementById('sbj-profile-frame') as HTMLFrameElement;

    private _controller: HomeVisitorController;
    private _unreadMap: Map<string, number>;
    private _lastTlmCtime: number;

    private _isVoiceSpeech: boolean;
    private _isVoiceRecognition: boolean;


    /**
     * コンストラクタ
     * @param controller 
     */
    constructor(controller: HomeVisitorController) {
        this._controller = controller;
        this._unreadMap = new Map<string, number>();
        this._lastTlmCtime = 0;

        document.onkeyup = this.OnOtherKeyPress;

        //  イベント設定
        this._textareaElement.onkeydown = (e) => { this.OnKeyDown(e); };
        //  this._textareaElement.onkeyup = (e) => { this.OnTextChange(); }
        this._textareaElement.oninput = (e) => { this.OnTextChange(); }
        this._selectActorButton.onclick = (e) => { this.DoShowActorSelectPanel(); };
        this._sendMessageButton.onclick = (e) => { this.SendInputMessage(); };

        this._voiceSpeech.onclick = (e) => {
            this.ChangeVoiceSpeech();
        }

        this._voiceRecognition.onclick = (e) => {
            this.ChangeVoiceRecognition();
        }

        this._voiceMic.hidden = true;
        this.ClearText();
    }


    /**
     * テキストエリア以外でエンターキーが押された場合に、テキストエリアにフォーカスを設定を移す
     * @param e 
     */
    public OnOtherKeyPress(e: KeyboardEvent) {
        if (e.keyCode === 13) {
            document.getElementById('sbj-inputpanel-text').focus();
        }
    }


    /**
     * テキストエリアのキーイベント
     * @param e 
     */
    private OnKeyDown(e: KeyboardEvent) {

        //  エスケープキーは入力中の文字をクリアして終了
        if (e.keyCode === 27) {
            e.returnValue = false;
            this.ClearText();
            return;
        }

        //  エンターキーは設定によって動作を変える
        if (e.keyCode === 13) {

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

        //  
        let isCtrlAltShift = e.ctrlKey || e.altKey || e.shiftKey;

        if (isCtrlAltShift) {

            if (LocalCache.ActorChangeKeyMode === 1) {
                if (!e.altKey || !e.shiftKey) return;
            }
            else {
                if (!e.ctrlKey) return;
            }

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
        this.OnTextChange();
    }


    /**
     * 音声認識のテキスト処理
     * @param text 
     */
    private SendVoiceText(text) {
        switch (LocalCache.VoiceRecognitionMode) {
            case 0:
                //  チャットのテキストエリアにセット
                let start = this._textareaElement.value.length;
                let end = text.length;
                this._textareaElement.value = this._textareaElement.value + text;
                this._textareaElement.selectionStart = start;
                this._textareaElement.selectionEnd = start + end;
                this.OnTextChange();
                break;
            case 1:
                //  直接チャットメッセージとして送信
                this.SendChatMessage(text, true);
                break;
        }
    }


    private CreateChatMessage(text: string, isVoiceRecognition: boolean): ChatMessageSender {
        let chm = new ChatMessageSender();
        let actor = this._controller.CurrentActor;
        chm.peerid = this._controller.PeerId;
        chm.aid = actor.aid;
        chm.name = actor.name;
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
    private SendChatMessage(text: string, isVoiceRecognition: boolean) {

        let chm = this.CreateChatMessage(text, isVoiceRecognition);
        this._controller.SendChatMessage(chm);

        switch (LocalCache.ChatMessageCopyMode) {
            case 1:
                StdUtil.ClipBoardCopy(text);
                break;
            case 2:
                try {
                    if (this._controller.VoiceCode.length > 0) {
                        let json = JSON.parse(this._controller.VoiceCode);
                        json.Message = text;
                        JSON.stringify(json)
                        StdUtil.ClipBoardCopy(JSON.stringify(json));
                    }
                    break;
                }
                catch (e) {
                    let msg = "VoiceCode Error\n" + e.toString();
                    alert(msg);
                }
        }
    }


    private _intervalSend = new IntervalSend<ChatInfoSender>(200);

    /**
     * 入力途中有無
     * @param isInputing 
     */
    private OnTextChange() {

        let isInput = this.IsInput();
        this._sendMessageButton.hidden = !isInput;

        let chm = new ChatInfoSender();
        let actor = this._controller.CurrentActor;
        chm.peerid = this._controller.PeerId;
        chm.aid = actor.aid;
        chm.name = actor.name;
        chm.iid = actor.dispIid;
        chm.isInputing = isInput;
        this._intervalSend.Send(chm, (s) => { this._controller.SwPeer.SendToOwner(s); });
    }


    /**
     * アクター選択パネルの表示
     */
    private DoShowActorSelectPanel() {

        let controller = this._controller;
        let useActors = controller.UseActors;
        let aid = controller.CurrentAid;

        let src = LinkUtil.CreateLink("../SelectActor/") + "?aid=" + aid;

        this._profileFrame.src = null;
        this._profileFrame.onload = () => {
            this._profileFrame.hidden = false;
            this._profileFrame.onload = null;
        }
        this._profileFrame.src = src;
    }


    /**
     * 未読メッセージ数の表示
     * @param tlms 
     */
    public SetUnreadCount(tlms: Array<Timeline.Message>) {

        if (!tlms) {
            return;
        }

        let map = this._unreadMap;
        tlms.forEach((tlm) => {

            if (this._lastTlmCtime < tlm.ctime) {
                //  新規発言データのみを対象とする（訂正データは対象外）
                if (tlm.ctime === tlm.utime) {
                    let hid = tlm.hid;
                    let count = (map.has(hid) ? map.get(hid) + 1 : 1);
                    map.set(hid, count);
                    this._lastTlmCtime = tlm.ctime;
                }
            }
        });
    }


    /**
     * 
     */
    public ClearUnreadCount() {
        this._unreadMap.set(this._controller.CurrentHid, 0);
    }


    /**
     * チャットのテキスト読上げ有無
     */
    private ChangeVoiceSpeech() {
        this._isVoiceSpeech = !this._isVoiceSpeech;
        this._voiceSpeechOn.hidden = !this._isVoiceSpeech;
        this._voiceSpeechOff.hidden = this._isVoiceSpeech;
    }


    /**
     * 音声認識によるチャットメッセージ入力
     */
    private ChangeVoiceRecognition() {
        this._isVoiceRecognition = !this._isVoiceRecognition;

        if (this._isVoiceRecognition) {
            this._voiceRecognition.classList.add("mdl-button--colored");
        }
        else {
            this._voiceRecognition.classList.remove("mdl-button--colored");
        }
        this._voiceRecognitionOn.hidden = !this._isVoiceRecognition;
        this._voiceRecognitionOff.hidden = this._isVoiceRecognition;
        if (this._isVoiceRecognition) {
            SpeechUtil.InitSpeechRecognition(
                this._controller,
                (text) => {
                    if (text) this.SendVoiceText(text);
                }
                , () => {
                    this._voiceRecognitionOn.classList.remove("mdl-button--colored");
                    this._voiceRecognitionOn.classList.add("mdl-button--accent");
                    this._textareaElement.disabled = true;
                }
                , () => {
                    this._voiceRecognitionOn.classList.remove("mdl-button--accent");
                    this._voiceRecognitionOn.classList.add("mdl-button--colored");
                    this._textareaElement.disabled = false;
                    this._textareaElement.focus();
                }
            );
            SpeechUtil.StartSpeechRecognition();
        }
        else {
            SpeechUtil.StopSpeechRecognition();
            this._textareaElement.disabled = false;
        }
    }


}