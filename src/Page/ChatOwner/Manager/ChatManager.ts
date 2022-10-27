import * as Timeline from "../../../Contents/IndexedDB/Timeline";

import ChatOwnerController from "../ChatOwnerController";
import RoomManager from "./RoomManager";
import ChatMessageSender from "../../../Contents/Sender/ChatMessageSender";
import TimelineSender from "../../../Contents/Sender/TimelineSender";
import ChatInfoSender from "../../../Contents/Sender/ChatInfoSender";


export default class ChatManager {

    private _controller: ChatOwnerController;
    private _roomManager: RoomManager;
    private _tlmsgs: Array<Timeline.Message>;
    private _inputMap: Map<string, ChatInfoSender>;

    /**
     * コンストラクタ
     * @param controller 
     */
    constructor(controller: ChatOwnerController, roomManager: RoomManager, callback) {

        this._controller = controller;
        this._roomManager = roomManager;

        controller.Model.GetTimelineAll((tlmsgs) => {
            //  時間順でソート
            tlmsgs.sort((a, b) => (a.ctime - b.ctime));
            this._tlmsgs = tlmsgs;
            this._inputMap = new Map<string, ChatInfoSender>();
            callback();
        });
    }


    /**
     * 
     * @param chm 
     */
    public SetMessage(chm: ChatMessageSender) {

        if (!chm) {
            return;
        }


        //  事前の登録メッセージ取得
        this._controller.Model.GetTimeline(chm.mid,(preMsg)=>{

            let tlmsg = this.ToTimelineMessage(chm);

            //  CTIMEは変更しない
            if(preMsg){
                tlmsg.ctime = preMsg.ctime;
            }

            //  DB登録
            this._controller.Model.UpdateTimelineMessage(tlmsg, () => {
    
                //  各Visitorへの通知処理
                this.SendMessage(tlmsg);
    
                //  キャッシュ
                this._tlmsgs.push(tlmsg);
            });

        });

    }


    /**
     * 
     * @param cis 
     */
    public SetInfo(cis: ChatInfoSender) {

        if (!cis) {
            return;
        }

        cis.hid = this._roomManager.GetRoomId(cis.peerid, cis.aid);

        if (cis.isInputing) {
            this._inputMap.set(cis.peerid, cis);
        }
        else {
            if (this._inputMap.has(cis.peerid)) {
                this._inputMap.delete(cis.peerid);
            }
        }

        this.SendInputing(cis);
    }


    /**
     * 同一ルーム内の各Visitorに通知
     * @param tlmsg 
     */
    private SendInputing(cis: ChatInfoSender) {

        let sender = new TimelineSender();
        this._inputMap.forEach((value, key) => {
            if (cis.hid === value.hid) {
                sender.ings.push(value);
            }
        });

        this._roomManager.GetRoomInPeers(cis.hid).forEach((peerid) => {
            this._controller.SwPeer.SendTo(peerid, sender);
        });
    }



    /**
     * タイムラインの更新処理
     * @param tlmsg 
     */
    public UpdateTimeline(utlmsg: Timeline.Message) {

        utlmsg.utime = Date.now();

        //  DBへの登録
        this._controller.Model.UpdateTimelineMessage(utlmsg, () => {

            //  キャッシュしてあるメッセージの差替え
            for (let pos: number = this._tlmsgs.length - 1; pos >= 0; pos--) {
                let tlmsg = this._tlmsgs[pos];
                if (tlmsg.mid == utlmsg.mid) {
                    this._tlmsgs[pos] = utlmsg;
                    break;
                }
            }

            //  各Visitorへの通知
            this.SendMessage(utlmsg);
        });

    }


    /**
     * フォーマット変換
     * @param chm 
     */
    private ToTimelineMessage(chm: ChatMessageSender): Timeline.Message {
        let tlmsg = new Timeline.Message();
        let ctime = Date.now();
        tlmsg.mid = chm.mid;
        tlmsg.hid = this._roomManager.GetRoomId(chm.peerid, chm.aid);
        tlmsg.peerid = chm.peerid;
        tlmsg.aid = chm.aid;
        tlmsg.iid = chm.iid;
        tlmsg.gid = chm.gid;
        tlmsg.name = chm.name;
        tlmsg.chatBgColor = chm.chatBgColor;
        tlmsg.text = chm.text;
        tlmsg.ctime = ctime;
        tlmsg.utime = ctime;
        tlmsg.visible = true;
        tlmsg.speech = chm.isSpeech;
        tlmsg.voiceRecog = chm.isVoiceRecog;
        return tlmsg;
    }


    /**
     * 同一ルーム内の各Visitorに通知
     * @param tlmsg 
     */
    private SendMessage(tlmsg: Timeline.Message) {

        let sender = new TimelineSender();
        sender.msgs.push(tlmsg);

        this._roomManager.GetRoomInPeers(tlmsg.hid).forEach((peerid) => {
            this._controller.SwPeer.SendTo(peerid, sender);
        });
    }


    /**
     * メッセージの取得
     * @param hid 
     * @param count 
     */
    public GetBeforeMessages(hid: string, count: number): Array<Timeline.Message> {

        let list = this._tlmsgs.filter(tlm => tlm.hid === hid);

        let end = list.length;
        let start = end - count;
        if (start < 0) start = 0;

        return list.slice(start, end);
    }


    /**
     * メッセージキャッシュの全クリア
     */
    public AllClear() {
        this._tlmsgs = new Array<Timeline.Message>();
    }


    /**
     * 指定PeerIdの除外
     * @param peerid 
     */
    public RemoveConnection(peerid: string) {
        if (this._inputMap.has(peerid)) {
            this._inputMap.delete(peerid);
        }
    }

}