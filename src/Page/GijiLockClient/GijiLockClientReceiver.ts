import AbstractServiceReceiver from "../../Base/AbstractServiceReceiver";
import LogUtil from "../../Base/Util/LogUtil";
import SpeechUtil from "../../Base/Util/SpeechUtil";
import StdUtil from "../../Base/Util/StdUtil";

import Sender from "../../Base/Container/Sender";
import ActorInfo from "../../Contents/Struct/ActorInfo";

import GijiLockClientController from "./GijiLockClientController";

import ConnInfoSender from "../../Contents/Sender/ConnInfoSender";
import RoomSender from "../../Contents/Sender/RoomSender";
import RoomActorMemberSender from "../../Contents/Sender/RoomActorMemberSender";
import TimelineSender from "../../Contents/Sender/TimelineSender";
import ClearTimelineSender from "../../Contents/Sender/ClearTimelineSender";
import GetProfileSender from "../../Contents/Sender/GetProfileSender";
import GetActorSender from "../../Contents/Sender/GetActorSender";
import ActorInfoSender from "../../Contents/Sender/ActorInfoSender";
import ProfileSender from "../../Contents/Sender/ProfileSender";


export default class GijiLockClientReceiver extends AbstractServiceReceiver<GijiLockClientController> {

    /**
     * 
     * @param conn 
     * @param sender 
     */
    public Receive(conn: PeerJs.DataConnection, sender: Sender) {

        //  ホームインスタンスからの接続情報の通知
        if (sender.type === ConnInfoSender.ID) {

            let ci = (sender as ConnInfoSender);

            if (ci.isBootCheck) {
                //  起動チェックに成功した場合、使用アクター情報を送信して画面を切替える
                this.Controller.ConnStartTime = (sender as ConnInfoSender).starttime;
                this.Controller.GetUseActors((ua) => { this.Controller.InitializeUseActors(ua); });
                LogUtil.RemoveListener();
                SpeechUtil.SetStartTime(ci.starttime);
            }
            else if (ci.isMultiBoot) {
                //  多重起動が検出された場合はエラー表示して終了
                this.Controller.HasError = true;
                this.Controller.View.MutilBootError();
                this.Controller.SwPeer.AllCloseRequest();
                //  this.Controller.SwPeer.CloseAll();
            }
            return;
        }

        //  ルーム変更
        if (sender.type === RoomSender.ID) {
            let room = (sender as RoomSender).room;
            this.Controller.RoomCache.Set(room);
        }

        //  ルーム内のアクターの変更
        if (sender.type === RoomActorMemberSender.ID) {
            let ram = (sender as RoomActorMemberSender);

            this.Controller.RoomCache.SetMember(ram);
            ram.members.forEach((ai) => { this.Controller.ActorCache.SetActor(ai.peerid, ai); });

            let aid = this.Controller.CurrentAid;

            this.Controller.RoomCache.GetRoomByActorId(aid, (room) => {
                if (ram.hid === room.hid) {
                    this.Controller.View.SetRoomInfo(room);
                }
            });
        }

        //  タイムライン情報
        if (sender.type === TimelineSender.ID) {
            let tl = (sender as TimelineSender);
            this.Controller.View.SetTimeline(tl.msgs, tl.ings);
        }


        //  タイムライン情報
        if (sender.type === ClearTimelineSender.ID) {
            this.Controller.View.ClearTimeline();
        }

        //  プロフィール要求
        if (sender.type === GetProfileSender.ID) {
            this.GetProfile(conn);
        }

        //  アクター要求
        if (sender.type === GetActorSender.ID) {
            this.GetActor(conn, sender as GetActorSender);
        }

        //  アクター取得
        if (sender.type === ActorInfoSender.ID) {
            this.Controller.ActorCache.SetActor(conn.remoteId, (sender as ActorInfoSender).actorInfo);
        }
    }

    /**
     * プロフィール情報の要求
     * @param conn 
     */
    public GetProfile(conn: PeerJs.DataConnection) {
        this.Controller.Model.GetUserProfile((profile) => {
            let result = new ProfileSender();
            result.profile = profile;
            this.Controller.SwPeer.SendTo(conn, result);
        });
    }


    /**
     * アクター情報の要求
     * @param conn 
     * @param sender 
     */
    public GetActor(conn: PeerJs.DataConnection, sender: GetActorSender) {
        this.Controller.Model.GetActor(sender.aid, (actor) => {
            let result = new ActorInfoSender();
            result.actorInfo = new ActorInfo(this.Controller.PeerId, StdUtil.UserID, actor);
            this.Controller.SwPeer.SendTo(conn, result);
        });
    }

}
