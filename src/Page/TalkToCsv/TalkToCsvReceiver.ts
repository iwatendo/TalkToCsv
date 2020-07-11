import AbstractServiceReceiver from "../../Base/AbstractServiceReceiver";
import Sender from "../../Base/Container/Sender";

import TalkToCsvController from "./TalkToCsvController";

import ClientBootSender from "../../Contents/Sender/ClientBootSender";
import GetRoomSender from "../../Contents/Sender/GetRoomSender";
import ConnInfoSender from "../../Contents/Sender/ConnInfoSender";
import UseActorSender from "../../Contents/Sender/UseActorSender";
import ChatMessageSender from "../../Contents/Sender/ChatMessageSender";
import GetTimelineSender from "../../Contents/Sender/GetTimelineSender";
import TimelineSender from "../../Contents/Sender/TimelineSender";
import UpdateTimelineSender from "../../Contents/Sender/UpdateTimelineSender";
import ChatInfoSender from "../../Contents/Sender/ChatInfoSender";
import AudioBlobSender from "../../Contents/Sender/AudioBlobSender";
import RecordingUtil from "../../Base/Util/RecordingUtil";


export default class TalkToCsvReceiver extends AbstractServiceReceiver<TalkToCsvController> {


    /**
     * 表示用ID
     * @param aid 
     * @param remoteId 
     */
    private ToDispID(aid: string, remoteId: string): string {

        let reuslt = "";

        //  Aidそのままだと長すぎるのでピックアップして表示
        for( let col of aid.split("-")){
            if(col){
                reuslt += col[0];
                reuslt += col[col.length-1];
            }
        }

        return `UserID:${reuslt}`;
    }

    /**
     * 
     */
    public Receive(conn: PeerJs.DataConnection, sender: Sender) {

        //  クライアントの起動通知
        if (sender.type === ClientBootSender.ID) {
            let ci = new ConnInfoSender();
            let mbc = this.IsMultiBoot(sender.uid, conn);
            ci.isBootCheck = !mbc;
            ci.isMultiBoot = mbc;
            this.Controller.SwPeer.SendTo(conn, ci);
            return;
        }

        //  ルームの要求
        if (sender.type === GetRoomSender.ID) {
            this.Controller.SendRoom(conn, sender as GetRoomSender);
        }

        //  使用アクター通知
        if (sender.type === UseActorSender.ID) {
            let useActor = sender as UseActorSender;
            this.Controller.Manager.Room.SetActor(conn, useActor);
        }

        //  チャットメッセージ通知
        if (sender.type === ChatMessageSender.ID) {
            let chatMessage = sender as ChatMessageSender;

            chatMessage.name = this.ToDispID(chatMessage.aid, conn.remoteId);

            this.Controller.Manager.Chat.SetMessage(chatMessage);
        }


        //  チャット入力中通知
        if (sender.type === ChatInfoSender.ID) {
            let cis = sender as ChatInfoSender;
            this.Controller.Manager.Chat.SetInfo(cis);
        }


        //  タイムラインの要求
        if (sender.type === GetTimelineSender.ID) {
            let gtl = sender as GetTimelineSender;
            let result = new TimelineSender();
            result.msgs = this.Controller.Manager.Chat.GetBeforeMessages(gtl.hid, gtl.count);
            this.Controller.SwPeer.SendTo(conn, result);
        }

        //  タイムラインの更新
        if (sender.type === UpdateTimelineSender.ID) {
            let utl = sender as UpdateTimelineSender;
            this.Controller.Manager.Chat.UpdateTimeline(utl.message);
        }


        if(sender.type === AudioBlobSender.ID){
            let abs = sender as AudioBlobSender;
            console.info(abs.mid);
            console.info(abs.binary.byteLength);
            var blob = new Blob([abs.binary]);

            //  RecordingUtil.download(blob);
        }
    }


    /**
     * ユーザーID毎の接続MAP
     */
    private _userConnMap = new Map<string, PeerJs.DataConnection>();


    /**
     * 
     * @param uid 
     * @param peerid 
     */
    private IsMultiBoot(uid: string, conn: PeerJs.DataConnection): boolean {

        if (this._userConnMap.has(uid)) {
            let preConn = this._userConnMap.get(uid);

            if (preConn.open) {
                if (preConn.remoteId === conn.remoteId) {
                    return false;
                }
                else {
                    return true;
                }
            }
            else {
                //  接続が切れていた場合は上書き
                this._userConnMap.set(uid, conn);
                return false;
            }
        }
        else {
            //  未登録だった場合
            this._userConnMap.set(uid, conn);
            return false;
        }
    }

}
