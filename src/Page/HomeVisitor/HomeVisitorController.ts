
import * as Timeline from "../../Contents/IndexedDB/Timeline";
import * as Personal from "../../Contents/IndexedDB/Personal";

import AbstractServiceController from "../../Base/AbstractServiceController";
import LogUtil from "../../Base/Util/LogUtil";
import { OnRead } from "../../Base/AbstractServiceModel";
import { Order } from "../../Base/Container/Order";

import TimelineCache from "./Cache/TimelineCache";
import ActorCache from "./Cache/ActorCache";
import RoomCache from "./Cache/RoomCache";
import HomeVisitorReceiver from "./HomeVisitorReceiver";
import HomeVisitorView from "./HomeVisitorView";
import HomeVisitorModel from "./HomeVisitorModel";
import LogController from "./Log/LogController";

import ActorInfo from "../../Contents/Struct/ActorInfo";
import ClientBootSender from "../../Contents/Sender/ClientBootSender";
import ServentCloseSender from "../../Contents/Sender/ServentCloseSender";
import UseActorSender from "../../Contents/Sender/UseActorSender";
import ChatMessageSender from "../../Contents/Sender/ChatMessageSender";
import GetTimelineSender from "../../Contents/Sender/GetTimelineSender";
import UpdateTimelineSender from "../../Contents/Sender/UpdateTimelineSender";

/**
 * 
 */
export default class HomeVisitorController extends AbstractServiceController<HomeVisitorView, HomeVisitorModel> {

    public ControllerName(): string { return "HomeVisitor"; }

    public PeerId: string;
    public ConnStartTime: number;
    public ActorCache: ActorCache;
    public RoomCache: RoomCache;
    public TimelineCache: TimelineCache;
    public Log: LogController;

    public UseActors: Array<Personal.Actor>;

    private _currentActor: Personal.Actor;

    public get CurrentAid(): string {
        return (this._currentActor ? this._currentActor.aid : "");
    }
    public get CurrentActor(): Personal.Actor { return this._currentActor; }
    public VoiceCode: string;
    public CurrentHid: string;
    public HasError: boolean;

    public IsFirstBoot: boolean;

    /**
     *
     */
    constructor() {
        super();
        this.HasError = false;
        this.Log = new LogController(this);
        this.Receiver = new HomeVisitorReceiver(this);
        this.ActorCache = new ActorCache(this);
        this.RoomCache = new RoomCache(this);
        this.TimelineCache = new TimelineCache(this);
    };


    /**
     * 自身のPeer生成時イベント
     * ※サーバー用のPeerID取得時イベント
     * @param peer
     */
    public OnPeerOpen(peer: PeerJs.Peer) {

        //  
        this.PeerId = peer.id;
        this.UseActors = new Array<Personal.Actor>();

        //  DB接続
        this.Model = new HomeVisitorModel(this, () => {
            //  UI初期化
            this.View = new HomeVisitorView(this, () => {

            });
        });

    }


    /**
     * 
     */
    public OnOwnerConnection() {
        //  多重起動の確認の為に、UserIDを送信
        this.SwPeer.SendToOwner(new ClientBootSender());
    }


    /**
     * 
     */
    public OnOwnerClose() {
        this.View.DisConnect();
    }


    /**
     * 
     * @param err
     */
    public OnPeerError(err: Error) {

        if ((err as any).type === "peer-unavailable") {
            LogUtil.Warning(this, err.message);
            let peerid = err.message.replace("Could not connect to peer ", "").replace("'", "");
        }
        else {
            this.View.DisConnect();
            LogUtil.Error(this, 'peer error');
            LogUtil.Error(this, err.message);
            LogUtil.FatalError(err.message);
        }
    }


    /**
     * 
     * @param conn 
     */
    public OnDataConnectionOpen(conn: PeerJs.DataConnection) {
        super.OnDataConnectionOpen(conn);
    }


    /**
     * 
     * @param conn 
     */
    public OnDataConnectionClose(conn: PeerJs.DataConnection) {

        let sender = new ServentCloseSender();
        sender.serventPeerId = conn.remoteId;
        sender.ownerPeerid = this.PeerId;
        this.SwPeer.SendToOwner(sender);

    }

    /**
     * 
     * @param callback 
     */
    public GetUseActors(callback: OnRead<Array<Personal.Actor>>) {

        let func = (actors) => {
            Order.Sort(actors);
            let result = new Array<Personal.Actor>();
            actors.forEach((actor) => {
                if (actor.isUserProfile || actor.isUsing) {
                    result.push(actor);
                }
            });
            callback(result);
        };

        this.Model.GetActors((actors) => {
            if (actors && actors.length > 0) {
                this.IsFirstBoot = false;
                func(actors);
            }
            else {
                this.Model.CreateDefaultData(() => {
                    this.Model.GetActors((actors) => {
                        this.IsFirstBoot = true;
                        func(actors);
                    });
                });
            }
        });
    }

    /**
     * 使用アクターの初期値設定
     * @param ua 
     */
    public InitializeUseActors(ua: Array<Personal.Actor>) {
        let aid = ua[0].aid;
        this.Model.GetActor(aid, (actor) => {
            this._currentActor = actor;
            this.SetUseActors(ua);
        });
    }

    /**
     * 
     */
    public SetUseActors(useActors: Array<Personal.Actor>) {
        this.UseActors = useActors;

        let sender = new UseActorSender();
        let peerid = this.PeerId;
        let uid = sender.uid;

        useActors.forEach((a) => {
            sender.ActorInfos.push(new ActorInfo(peerid, uid, a));
        });

        this.SwPeer.SendToOwner(sender);
    }


    /**
     * アクター情報及び使用アクターに変更があった場合に
     * 変更内容をホームインスタンスに通知
     * @param aid 
     */
    public ChagneActorInfo(aid: string) {

        let useActor = this.UseActors;
        let peerId = this.PeerId;

        this.Model.GetActor(aid, (newActor) => {

            let preUsing = false;
            let newList = new Array<Personal.Actor>();

            //  アクターデータの差替え
            useActor.forEach((pre) => {
                if (pre.aid === aid) {
                    preUsing = true;
                    if (newActor.isUserProfile || newActor.isUsing) {
                        newList.push(newActor);
                    }
                }
                else {
                    newList.push(pre);
                }
            });

            //  新しく配置されたアクターの場合
            if (!preUsing && newActor.isUsing) {
                newList.push(newActor);
            }

            this.SetUseActors(newList);
        });

    }


    /**
     * 
     * @param chatMessage 
     */
    public SendChatMessage(chatMessage: ChatMessageSender) {
        this.SwPeer.SendToOwner(chatMessage);
    }


    /**
     * タイムライン情報の取得
     * @param hid 
     */
    public GetTimeline(hid: string) {
        let sender = new GetTimelineSender();
        sender.hid = hid;
        sender.count = 256;
        this.SwPeer.SendToOwner(sender);
    }


    /**
     * タイムラインの修正処理
     * @param tml 
     */
    public UpdateTimeline(tml: Timeline.Message) {
        let sender = new UpdateTimelineSender();
        sender.message = tml;
        this.SwPeer.SendToOwner(sender);
    }

};
