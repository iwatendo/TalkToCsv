import SpeechUtil from "../../../Base/Util/SpeechUtil";
import LocalCache from '../../../Contents/Cache/LocalCache';
import GijiLockClientController from "../GijiLockClientController";
import ChatMessageSender from '../../../Contents/Sender/ChatMessageSender';
import ChatInfoSender from '../../../Contents/Sender/ChatInfoSender';
import IntervalSend from '../../../Base/Util/IntervalSend';
import RecognitionUtil from "../../../Base/Util/RecognitionUtil";

export default class InputPaneController {

    private _textareaElement = document.getElementById('sbj-inputpanel-text') as HTMLInputElement;
    private _sendMessageButton = document.getElementById('sbj-inputpanel-send-message-button') as HTMLInputElement;

    private _voiceRecognition = document.getElementById('sbj-inputpanel-send-message-recognition');
    private _voiceRecognitionOn = document.getElementById('sbj-inputpanel-send-message-recognition-on');
    private _voiceRecognitionOff = document.getElementById('sbj-inputpanel-send-message-recognition-off');
    private _controller: GijiLockClientController;

    private _isVoiceSpeech: boolean;
    private _isVoiceRecognition: boolean;

    /**
     * コンストラクタ
     * @param controller 
     */
    constructor(controller: GijiLockClientController) {

        this._controller = controller;

        document.onkeydown = this.OnOtherKeyPress;

        //  イベント設定
        this._textareaElement.onkeydown = (e) => { this.OnKeyDown(e); };
        this._sendMessageButton.onclick = (e) => { this.SendInputMessage(); };

        this._voiceRecognition.onclick = (e) => {
            this.ChangeVoiceRecognition();
        }

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
        //  エスケープキーは入力中の文字をクリアして終了
        if (e.keyCode === 27) {
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
    private SendVoiceText(text) {

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
    }


    private _intervalSend = new IntervalSend<ChatInfoSender>(200);


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
            RecognitionUtil.InitSpeechRecognition(
                this._controller,
                (text, isFinal) => {
                    if (text) {
                        if (isFinal) {
                            this.SendVoiceText(text);
                            this._textareaElement.value = "";
                        }
                        else {
                            this._textareaElement.value = text;
                        }
                    }
                    else{
                        this._textareaElement.value = "";
                    }

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
            RecognitionUtil.Start();
        }
        else {
            RecognitionUtil.Stop();
            this._textareaElement.disabled = false;
        }
    }

}