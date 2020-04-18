import * as React from 'react';
import * as ReactDOM from 'react-dom';

import StdUtil from "../../../Base/Util/StdUtil";
import LinkUtil from "../../../Base/Util/LinkUtil";
import SpeechUtil from "../../../Base/Util/SpeechUtil";
import StreamUtil from '../../../Base/Util/StreamUtil';

import LocalCache from '../../../Contents/Cache/LocalCache';
import * as Timeline from "../../../Contents/IndexedDB/Timeline";

import HomeVisitorController from "../HomeVisitorController";
import RoomComponent, { RoomUnread } from "./RoomComponent";
import { VoiceSfuRoomMemberComponent } from './VoiceSfuRoomMemberComponent';
import ChatMessageSender from '../../../Contents/Sender/ChatMessageSender';
import VoiceChatMemberListSender from '../../../Contents/Sender/VoiceChatMemberListSender';
import ChatInfoSender from '../../../Contents/Sender/ChatInfoSender';
import StyleCache from '../../../Contents/Cache/StyleCache';
import ProfileChangeSender from '../../../Contents/Sender/ProfileChangeSender';
import IntervalSend from '../../../Base/Util/IntervalSend';

export default class InputPaneController {

    private _actorNameElement = document.getElementById('sbj-inputpanel-actor-name');
    private _actorIconElement = document.getElementById('sbj-inputpanel-actor-icon');
    private _textareaElement = document.getElementById('sbj-inputpanel-text') as HTMLInputElement;
    private _selectActorButton = document.getElementById('sbj-inputpanel-select-actor-button');
    private _sendMessageButton = document.getElementById('sbj-inputpanel-send-message-button') as HTMLInputElement;

    private _voiceSpeech = document.getElementById('sbj-inputpanel-speech');
    private _voiceSpeechOn = document.getElementById('sbj-inputpanel-speech-on');
    private _voiceSpeechOff = document.getElementById('sbj-inputpanel-speech-off');

    private _voiceRecognition = document.getElementById('sbj-inputpanel-send-message-recognition');
    private _voiceRecognitionOn = document.getElementById('sbj-inputpanel-send-message-recognition-on');
    private _voiceRecognitionOff = document.getElementById('sbj-inputpanel-send-message-recognition-off');

    private _voiceChat = document.getElementById('sbj-inputpanel-voicechat') as HTMLInputElement;
    private _voiceMic = document.getElementById('sbj-inputpanel-voicechatmic') as HTMLInputElement;
    private _voiceMicOn = document.getElementById('sbj-inputpanel-voicechatmic-on');
    private _voiceMicOff = document.getElementById('sbj-inputpanel-voicechatmic-off');

    private _unreadElement = document.getElementById('sbj-unread-count');
    private _voiceChatMenber = document.getElementById('sbj-inpupanel-voicechat-member');
    private _otherRoomList = document.getElementById('sbj-inputpanel-other-room-list');
    private _otherRoomButton = document.getElementById('sbj-inputpanel-other-room-button');
    private _otherRoomCount = document.getElementById('sbj-inputpanel-noread-other-room-count');

    private _profileFrame = document.getElementById('sbj-profile-frame') as HTMLFrameElement;

    private _controller: HomeVisitorController;
    private _unreadMap: Map<string, number>;
    private _lastTlmCtime: number;

    private _isVoiceSpeech: boolean;
    private _isVoiceRecognition: boolean;
    private _isVoiceChat: boolean;
    private _isMicMute: boolean = true;
    private _voiceChatStream: MediaStream;

    private _audioDevice: string;


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
        this._actorIconElement.onclick = (e) => { this.MoveSelectionIcon(1); };
        this._selectActorButton.onclick = (e) => { this.DoShowActorSelectPanel(); };
        this._sendMessageButton.onclick = (e) => { this.SendInputMessage(); };

        this._voiceSpeech.onclick = (e) => {
            this.ChangeVoiceSpeech();
        }

        this._voiceRecognition.onclick = (e) => {
            this.ChangeVoiceRecognition();
        }

        this._isMicMute = true;
        this._voiceMic.hidden = true;
        this.DisplayActor();
        this.UserSettingChange();
        this.ClearText();
    }


    /**
     * 
     */
    public DisplayActor() {

        let actor = this._controller.CurrentActor;
        //  選択しているアクターの名称表示
        this._actorNameElement.textContent = (actor ? actor.name : "");

        let iid = actor.dispIid;
        let iconElement = document.getElementById('sbj-inputpanel-actor-icon');

        StyleCache.SetIconStyleElement(iconElement, iid);

        if (iid) {
            this._controller.IconCache.GetIcon(this._controller.PeerId, iid);
            this._controller.Model.GetIcon(iid, (icon) => {
                if (icon) {
                    this._controller.VoiceCode = icon.voicecode;
                }
            });
        }
        else {
            this._controller.VoiceCode = "";
        }
        this._textareaElement.focus();
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

            switch (e.keyCode) {
                case 37: // [←]
                    this.MoveSelectionIcon(-1);
                    e.preventDefault();
                    return;
                case 39: // [→]
                    this.MoveSelectionIcon(1);
                    e.preventDefault();
                    return;
                case 38: // [↑]
                    this.MoveSelectionActor(-1);
                    e.preventDefault();
                    return;
                case 40: // [↓]
                    this.MoveSelectionActor(1);
                    e.preventDefault();
                    return;
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

        //  最終発言をサーバント側に通知
        let actorType = this._controller.CurrentActor.actorType;
        this._controller.PostChatStatus(actorType, text);
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
     * ショートカットキーでのアクター変更
     * @param value 
     */
    private MoveSelectionActor(value: number) {

        let useActors = this._controller.UseActors;
        let actorCount = useActors.length;
        let selActor = this._controller.CurrentAid;

        let sel = -1;
        let pos = 0;

        useActors.map((ap) => {
            if (ap.aid === this._controller.CurrentAid) sel = pos;
            pos++;
        });

        if (sel >= 0) {
            sel = (sel + value + actorCount) % actorCount;
            this.ChangeSelectionActorIcon(useActors[sel].aid);
        }

    }


    /**
     * 
     * @param aid 
     */
    public ChangeSelectionActorIcon(aid: string) {

        this._controller.ChangeCurrentActor(aid);

        //  アクター情報を取得
        this._controller.Model.GetActor(aid, (actor) => {

            let iid = actor.dispIid;
            if (iid === "" && actor.iconIds.length > 0) {
                iid = actor.iconIds[0];
            }

            this._controller.View.MoveLastTimeline();
        });
    }


    /**
     * 選択アイコンの変更
     * @param iid 
     */
    public ChangeSelectionIcon(iid: string) {
        let controller = this._controller;
        let aid = controller.CurrentAid;
        controller.PostChatStatus();
        this.DisplayActor();
    }


    /**
     * 選択アイコンのショートカットでの変更
     * @param value 
     */
    private MoveSelectionIcon(value: number) {

        let actor = this._controller.CurrentActor;

        if (actor.iconIds.length === 0) {
            return;
        }

        let sel = actor.iconIds.indexOf(actor.dispIid);
        if (sel >= 0) {
            let iconCount = actor.iconIds.length;

            sel = (sel + value + iconCount) % iconCount;
            actor.dispIid = actor.iconIds[sel];

            this._controller.Model.UpdateActor(actor, () => {
                this.ChangeSelectionIcon(actor.dispIid);
            });
        }

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
     * 
     */
    public DisplayUnreadCount() {

        let list = new Array<RoomUnread>();
        let totalCount = 0;

        let rooms = this._controller.RoomCache.GetRooms();

        rooms.forEach((room) => {
            let hid = room.hid;
            let count = 0;
            if (this._unreadMap.has(hid)) {
                count = this._unreadMap.get(hid);
            }

            list.push(new RoomUnread(room, count));
            totalCount += count;
        });

        let disp = this.ToDispCount(totalCount);

        if (disp.length === 0) {
            this._otherRoomCount.removeAttribute('data-badge');
        }
        else {
            this._otherRoomCount.setAttribute("data-badge", disp);
        }

        let key = StdUtil.CreateUuid();
        ReactDOM.render(<RoomComponent key={key} controller={this._controller} roomUnreads={list} />, this._otherRoomList);
    }


    /**
     * 表示用の件数
     * @param value 
     */
    private ToDispCount(value: number): string {
        if (!value) return "";
        if (value === 0) return "";
        if (value > 99) return "99+";
        return value.toString();
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


    /**
     * マイクのミュート設定
     */
    private get IsMicMute(): boolean {
        return this._isMicMute;
    }


    /**
     * マイクのミュート設定
     */
    private set IsMicMute(value) {
        this._isMicMute = value;
        this._voiceMicOn.hidden = value;
        this._voiceMicOff.hidden = !value;
        StreamUtil.SetMute(this._voiceChatStream, value);
    }


    /**
     * 通話メンバーの変更通知（Streamの通知メンバー)
     * @param memberPeerList 
     */
    public ChangeVoiceChatStreamMember(memberPeerList: Array<string>) {
        //  こちら側はSFURoomにJoinしないと通知が来ない（通話状態じゃないと通知が来ない）為、現状未使用
        //  表示の不整合等が発生した場合の調査用として残します。
    }


    /**
     * 通話メンバーが変更された場合の処理
     * @param meberList 
     */
    public ChangeVoiceChatMember(meberList: VoiceChatMemberListSender) {

        let key = StdUtil.CreateUuid();

        ReactDOM.render(<VoiceSfuRoomMemberComponent key={key} controller={this._controller} memberList={meberList} />, this._voiceChatMenber, () => {
            meberList.Members.forEach((vcm) => {
                this._controller.IconCache.GetIcon(vcm.peerid, vcm.iid);
            });
        });

    }


    /**
     * デバイス変更時処理
     */
    public ChnageDevice() {
        let options = LocalCache.VoiceChatOptions;
        this._voiceChat.disabled = !(options.SelectMic ? true : false);
    }


    /**
     * プロフィール変更通知時処理
     * @param pcs 
     */
    public ProfileChange(pcs: ProfileChangeSender) {
        if (pcs) {

            //  プロフィール更新画面からの通知
            if (pcs.updateAid) {
                this._controller.ChagneActorInfo(pcs.updateAid);
                this.ChangeSelectionActorIcon(pcs.updateAid);
            }

            //  アクター選択画面からの通知
            if (pcs.selectAid) {
                this._controller.ChangeCurrentActor(pcs.selectAid);
            }

            //  プロフィール更新画面を閉じる
            if (pcs.isClose) {
                this._profileFrame.hidden = true;
                this._textareaElement.focus();
            }
        }
    }


    /**
     * 
     */
    public UserSettingChange() {
        this._selectActorButton.hidden = (!LocalCache.UseActors);
    }

}