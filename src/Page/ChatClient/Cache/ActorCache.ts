import ActorInfo from "../../../Contents/Struct/ActorInfo";

import ChatClientController from "../ChatClientController";
import GetActorSender from "../../../Contents/Sender/GetActorSender";

import StdUtil from "../../../Base/Util/StdUtil";



interface ActorFunc { (actor: ActorInfo): void }


export default class ActorCache {

    //
    private _controller: ChatClientController;
    //  PeerID / Aid / Actor
    private _actorCache = new Map<string, Map<string, ActorInfo>>();
    //  function queue
    private _queue = new Map<string, Array<ActorFunc>>();


    /**
     * コンストラクタ
     * @param controller 
     */
    public constructor(controller: ChatClientController) {
        this._controller = controller;
    }


    /**
     * 処理キューの登録
     * @param key 
     * @param callback 
     */
    private PushQueue(key: string, callback: ActorFunc) {
        if (this._queue.has(key)) {
            this._queue.get(key).push(callback);
        }
        else {
            let fa = new Array<ActorFunc>();
            fa.push(callback);
            this._queue.set(key, fa);
        }
    }


    /**
     * 処理キューが設定されていた場合、実行する
     * @param key 
     */
    private ExecQueue(key: string, actor: ActorInfo) {
        if (this._queue.has(key)) {
            let queues = this._queue.get(key);
            while (queues.length > 0) {
                let queue = queues.pop();
                queue(actor);
            }
        }
    }


    /**
     * アクター情報の取得
     * @param peerid 
     * @param aid 
     * @param callback 
     */
    public GetActor(peerid: string, aid: string, callback: ActorFunc) {

        //  キャッシュ済みの場合はキャッシュから取得
        if (this._actorCache.has(peerid)) {
            let map = this._actorCache.get(peerid);
            if (map.has(aid)) {
                let actorinfo = map.get(aid);
                callback(actorinfo);
                return;
            }
        }

        if (this._controller.PeerId === peerid) {
            this._controller.Model.GetActor(aid, (actor) => {
                callback(new ActorInfo(this._controller.PeerId, StdUtil.UserID, actor));
            });
        }
        else {
            let key = peerid + aid;
            this.PushQueue(key, callback);

            let sender = new GetActorSender();
            sender.aid = aid;
            this._controller.SwPeer.SendTo(peerid, sender);
        }

    }


    /**
     * アクター情報をキャッシュ
     * @param peerid 
     * @param actor 
     */
    public SetActor(peerid: string, actor: ActorInfo) {
        if (!this._actorCache.has(peerid)) {
            this._actorCache.set(peerid, new Map<string, ActorInfo>());
        }
        let map = this._actorCache.get(peerid);
        map.set(actor.aid, actor);

        let key = peerid + actor.aid;
        this.ExecQueue(key, actor);
    }

}
