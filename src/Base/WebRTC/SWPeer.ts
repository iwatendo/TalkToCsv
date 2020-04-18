import Sender from "../Container/Sender";
import LogUtil from "../Util/LogUtil";
import SWConnectionCache from "./SWConnectionCache";
import IServiceController from "../IServiceController";
import LocalCache from "../../Contents/Cache/LocalCache";
import CloseRequestSender from "../Container/CloseRequestSender";


interface OnSWPeerOpen { (): void }

export default class SWPeer {

    private _peer: any;
    private _ownerId: string;
    private _connCache: SWConnectionCache;
    private _service: IServiceController;
    private _opencb: OnSWPeerOpen


    public get Peer(): any {
        return this._peer;
    }

    /**
     * 
     */
    public get PeerId(): string {
        return (this._peer ? this._peer.id : "");
    }


    /**
     * 
     */
    public get OwnerReomteId(): string {
        return this._ownerId;
    }


    /**
     * 
     */
    public get Service(): IServiceController {
        return this._service;
    }


    /**
     * コンストラクタ
     * @param service 
     * @param ownerId 
     */
    constructor(service: IServiceController, ownerId: string, opencb: OnSWPeerOpen) {

        //  ストリーミング用設定
        navigator.getUserMedia = navigator.getUserMedia || (navigator as any).webkitGetUserMedia || (navigator as any).mozGetUserMedia;

        //
        this._service = service;
        this._ownerId = ownerId;
        this._connCache = new SWConnectionCache(this);
        this._opencb = opencb;

        //
        window.onoffline = (e) => { this.CheckPeer(); };
        window.document.addEventListener("visibilitychange", () => { this.CheckPeer(); });

        SWPeer.GetApiKey((apikey) => {

            let debugMode = (LocalCache.DebugMode > 1 ? 3 : 1);
            let peer = new Peer({ key: apikey, debug: debugMode });

            //  
            this.PeerSetting(service, peer, ownerId);

            //
            this._peer = peer;
        });

        //  ページが閉じられた場合の通知処理
        window.onbeforeunload = (event: BeforeUnloadEvent) => {
            this._service.OnBeforeUnload();
            this.AllCloseRequest();
        };

    }


    /**
     * SkyWayのAPIキーが記述されたファイルを読み込みます
     */
    public static GetApiKey(callback) {

        let xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = () => {
            if (xmlhttp.readyState == 4) {
                if (xmlhttp.status == 200) {
                    try {
                        let apikey = JSON.parse(xmlhttp.responseText);
                        callback(apikey.skyway);
                        return;
                    }
                    catch (e) {
                        let errMsg = "apikey.json\n" + e.toString();
                        alert(errMsg);
                    }
                }
                else {
                    alert("apikey.json not found.");
                }
            }
        }
        xmlhttp.open("GET", "/apikey.json", true);
        xmlhttp.send();
    }


    /**
     * 自身のPeer設定
     * @param service 自身のサービスコントローラー
     * @param peer 自身のPeer接続
     */
    private PeerSetting(service: IServiceController, peer: PeerJs.Peer, ownerid: string) {

        peer.on('open', () => {

            LogUtil.Info(service, "peer opened");
            service.OnPeerOpen(peer);

            if (ownerid != null && ownerid.length > 0) {
                let owner = this._peer.connect(ownerid, { reliable: true });
                this._connCache.SetOwner(owner);
                this.OwnerPeerSetting(service, owner, ownerid);
            }

            if (this._opencb) {
                this._opencb();
            }
        });

        peer.on('connection', (conn) => {
            this._connCache.Set(conn);
        });

        peer.on('error', (e) => {
            service.OnPeerError(e);
            this.CheckPeer();
        });

        peer.on('close', () => {
            service.OnPeerClose();
        });

        peer.on('call', (call) => {
            //  
        });

    }


    /**
     * 呼出元の接続設定
     * @param service 自身のサービスコントローラー
     * @param owner 呼出元の接続情報
     */
    private OwnerPeerSetting(service: IServiceController, owner: PeerJs.DataConnection, onownerid: string) {

        owner.on("open", () => {
            LogUtil.Info(service, "peer connected to [" + onownerid + "]");
            service.OnOwnerConnection();
        });

        owner.on("error", (e) => {
            service.OnOwnerError(e);
        });

        owner.on("close", () => {
            service.OnOwnerClose();
        });

        owner.on("data", (data) => {
            if (owner.peerConnection)
                service.Recv(owner.peerConnection, data);
        });

        return owner;
    }


    /**
     * 
     */
    public CheckPeer() {
        if (this._service) {
            setTimeout(() => {
                this._connCache.CheckAlive();
            }, 2000);
        }
    }


    /**
     *  WebRTCServiceの停止
     *  全てクライアントとの接続を切断します
     */
    public CloseAll() {
        this._connCache.CloseAll();
        this._peer.destroy();
    }


    /**
     * 全ての接続先に、切断を要求する
     * ※切断はリトライ処理が行われ、切断が検出されるまでにタイムラグが発生する為
     */
    public AllCloseRequest() {
        if (this._peer && !this._peer.destroyed) {
            const sender = new CloseRequestSender();
            this.SendToOwner(sender);
            this.SendAll(sender);
            this._peer.close();
        }
    }


    /**
     * 指定されたIDとの接続を閉じる
     * @param remoteId 
     */
    public Close(remoteId: string) {
        if (this._connCache) {
            if (this._connCache.IsOwnerRemoveId(remoteId)) {
                this._connCache.CloseOwner();
            }
            else {
                this._connCache.Close(remoteId);
            }
        }
    }


    /**
     * オーナーへの送信
     * @param data
     */
    public SendToOwner(data: Sender) {
        this._connCache.SendToOwner(data);
    }


    /**
     * 指定クライアントへの送信
     * @param peer
     * @param data
     */
    public SendTo(peer: string | PeerJs.DataConnection, data: Sender) {

        let peerid = "";
        let dc = peer as PeerJs.DataConnection;
        if (dc) { peerid = dc.remoteId; }
        if (!peerid) { peerid = peer.toString(); }

        this._connCache.Send(peerid, data);
    }


    /**
     * 全接続クライアントへの送信
     * @param data
     */
    public SendAll(data: Sender) {
        this._connCache.SendAll(data);
    }


    /**
     * 有効なPeer接続件数の取得
     */
    public GetAliveConnectionCount(): number {
        return this._connCache.AliveConnectionCount();
    }


    /**
     * オーナーが設定されているか？
     */
    public HasOwner() {
        return (this._ownerId && this._ownerId.length > 0);
    }

}
