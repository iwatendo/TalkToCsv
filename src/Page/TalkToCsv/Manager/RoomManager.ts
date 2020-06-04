import LogUtil from "../../../Base/Util/LogUtil";
import { OnRead } from "../../../Base/AbstractServiceModel";

import HomeInstanceController from "../TalkToCsvController";
import ActorInfo from "../../../Contents/Struct/ActorInfo";
import UseActorSender from "../../../Contents/Sender/UseActorSender";
import RoomActorMemberSender from "../../../Contents/Sender/RoomActorMemberSender";


export class RoomActor {

    constructor(hid: string, uid: string, actorInfo: ActorInfo) {
        this.hid = hid;
        this.uid = uid;
        this.actorInfo = actorInfo;
        this.date = new Date();
    }

    hid: string;
    uid: string;
    actorInfo: ActorInfo;
    date: Date;
}


export default class RoomManager {

    private _controller: HomeInstanceController;
    private _defaultRoomId: string;
    private _peerRoomActorMap = new Map<string, Array<RoomActor>>();    /* MAP : PeerID / Array<RoomActor> */


    /**
     * コンストラクタ
     * @param model 
     */
    constructor(controller: HomeInstanceController) {
        this._controller = controller;
    }


    /**
     * 使用アクター情報のセット
     * @param conn 
     * @param useActor 
     */
    public SetActor(conn: PeerJs.DataConnection, useActor: UseActorSender) {

        if (!conn || !useActor) {
            return;
        }

        this.GetDefaultRoomID((defaultRoomId) => {
            //  ルームアクター情報の更新
            this.RoomActorMerge(conn.remoteId, useActor, defaultRoomId);
        });
    }


    /**
     * 指定したアクターが所属するルームIDの取得
     * @param peerid 
     * @param aid 
     */
    public GetRoomId(peerid: string, aid: string): string {

        let list = this._peerRoomActorMap.get(peerid);

        let result: string = null;

        if (list) {
            list.forEach((ra) => {
                if (ra.actorInfo.aid === aid) {
                    result = ra.hid;
                }
            });
        }

        return result;
    }


    /**
     * 指定したルームIDに所属するアクターの一覧を取得
     * @param hid 
     */
    public GetRoomInActors(hid: string): Array<ActorInfo> {

        let result = new Array<ActorInfo>();

        this._peerRoomActorMap.forEach((ral, peerid) => {
            ral.forEach((ra) => {
                if (ra.hid === hid) {
                    result.push(ra.actorInfo);
                }
            });
        });

        return result;
    }


    /**
     * 指定ルームIDに所属する、アクターのPeerId一覧を取得
     * @param hid 
     */
    public GetRoomInPeers(hid: string): Array<string> {

        let result = new Array<string>();

        this._peerRoomActorMap.forEach((ral, peerid) => {
            ral.forEach((ra) => {
                if (ra.hid === hid) {
                    if (result.filter(p => (p === peerid)).length === 0) {
                        result.push(peerid);
                    }
                }
            });
        });

        return result;
    }



    /**
     * 指定PeerIdの除外
     * @param peerid 
     */
    public RemoveConnection(peerid: string) {

        if (this._peerRoomActorMap.has(peerid)) {

            let map = new Map<string, string>();
            this._peerRoomActorMap.get(peerid).forEach((ap) => {
                map.set(ap.hid, ap.hid);
            });
            this._peerRoomActorMap.delete(peerid);

            //  変更が発生した部屋情報を接続メンバーに通知
            map.forEach((value, key) => {
                this.SendRoomInfo(key, this.GetRoomInActors(key));
            });
        }
    }


    /**
     * デフォルトルームIDの取得
     */
    private GetDefaultRoomID(callback: OnRead<string>) {
        if (!this._defaultRoomId) {
            this._controller.Model.GetRooms((rooms) => {

                let defaultRooms = rooms.filter(n => n.isDefault);

                if (defaultRooms.length > 0) {
                    this._defaultRoomId = defaultRooms[0].hid;
                    callback(this._defaultRoomId);
                }
                else {
                    LogUtil.Error(this._controller, "Default room not found.");
                }
            });
        }
        else {
            callback(this._defaultRoomId)
        }
    }


    /**
     * 指定ルームのメンバーデータを生成
     * @param hid 
     */
    private CreateRoomActorMember(hid: string): RoomActorMemberSender {

        let actorInfos = new Map<string, ActorInfo>();
        this._peerRoomActorMap.forEach((roomActors, peerid) => {
            roomActors.forEach((ra) => {
                if (ra.hid === hid) {
                    actorInfos.set(ra.actorInfo.aid, ra.actorInfo);
                }
            });
        });

        //  通知データの作成
        let result = new RoomActorMemberSender();
        result.hid = hid;
        result.members = new Array<ActorInfo>();
        actorInfos.forEach((actorInfo, aid) => {
            result.members.push(actorInfo);
        });

        return result;
    }


    /**
     * メンバーに変更があった部屋を、参加メンバーに通知
     * @param hid 
     * @param aps 
     */
    private SendRoomInfo(hid: string, aps: Array<ActorInfo>) {

        //  送信先のPeerIDの一覧を生成（重複除去）
        let sendPeers = new Array<string>();
        aps.forEach((ap) => {
            if (sendPeers.filter(n => (n === ap.peerid)).length == 0) {
                sendPeers.push(ap.peerid);
            }
        });


        //  送信データの作成
        let rmi = this.CreateRoomActorMember(hid);

        //  通知処理
        sendPeers.forEach((peerid) => {
            //  各ユーザーへ通知
            this._controller.SwPeer.SendTo(peerid, rmi);
        });
    }

    /**
     * ルーム/アクター情報の更新
     * @param peerid 
     * @param useActor 
     * @param defaultRoomId 
     */
    private RoomActorMerge(peerid: string, useActor: UseActorSender, defaultRoomId: string) {

        let changeRoomMap = new Map<string, Array<ActorInfo>>();

        let preArray = this.GetRoomActors(peerid);
        let newArray = new Array<RoomActor>();

        useActor.ActorInfos.forEach((ai) => {

            //  登録済みデータの取出し（取り出されたデータはpreArrayから削除）
            let pre = this.Take(preArray, ai.aid);

            if (pre) {

                //  登録済みアクターの部屋はそのまま

                //  ただし、ダッシュボードでアクター情報の変更があった場合は通知する
                if (ActorInfo.IsChange(pre.actorInfo, ai)) {
                    pre.actorInfo = ai;
                    changeRoomMap.set(pre.hid, this.GetRoomInActors(pre.hid));
                }

                newArray.push(pre);
            }
            else {
                //  未登録アクターはデフォルトルームへ追加
                newArray.push(new RoomActor(defaultRoomId, ai.uid, ai));

                //  ルームメンバーの変更をセット
                changeRoomMap.set(defaultRoomId, this.GetRoomInActors(defaultRoomId));
            }
        });

        //  この段階でpreArrayに残っているデータは、削除されたアクター
        preArray.forEach((ra) => {
            //  更新前のルームメンバーに削除を通知
            changeRoomMap.set(ra.hid, this.GetRoomInActors(ra.hid));
        });


        //  データ変更
        this._peerRoomActorMap.set(peerid, newArray);


        //  デフォルトルームに変更があった場合は、更新後メンバーにも通知
        if (changeRoomMap.has(defaultRoomId)) {
            let actorList = changeRoomMap.get(defaultRoomId);
            this.GetRoomInActors(defaultRoomId).forEach((p) => actorList.push(p));
        }

        //  変更が発生した部屋のメンバーに、現状のルームメンバーを通知
        let result = new Array<string>();
        changeRoomMap.forEach((actorList, hid) => {
            this.SendRoomInfo(hid, actorList);
        });

    }


    /**
     * 
     * @param peerid 
     */
    private GetRoomActors(peerid: string): Array<RoomActor> {

        if (this._peerRoomActorMap.has(peerid)) {
            return this._peerRoomActorMap.get(peerid);
        }
        else {
            return new Array<RoomActor>();
        }
    }


    /**
     * 指定aidのデータを取得。※取出したデータは配列から除去されます。
     * @param preArray 
     * @param aid 
     */
    private Take(preArray: Array<RoomActor>, aid: string): RoomActor {

        for (let i = 0; i < preArray.length; i++) {
            if (preArray[i].actorInfo.aid === aid) {
                let result = preArray[i];
                preArray.splice(i, 1);
                return result;
            }
        }
        return null;
    }


    /**
     * 部屋変更
     * @param peerid 
     * @param aid 
     * @param newHid 
     * @param preHid 
     */
    public MoveRoom(peerid: string, aid: string, newHid: string, preHid: string) {

        if (this._peerRoomActorMap.has(peerid)) {

            //  データ変更前のルーム内アクターリスト
            let preMemberList = this.GetRoomInActors(preHid);

            this._peerRoomActorMap.get(peerid).forEach((ra) => {
                if (aid === ra.actorInfo.aid) {
                    ra.hid = newHid;
                }
            });

            //  データ変更後のルーム内アクターリスト
            let newMemberList = this.GetRoomInActors(newHid);

            //  ルームメンバーの移動が発生した場合、ルーム内のメンバーに通知する
            if (preHid !== newHid) {
                this.SendRoomInfo(preHid, preMemberList);
                this.SendRoomInfo(newHid, newMemberList);
            }

        }

    }

}