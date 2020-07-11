import IServiceController from "../IServiceController";
import LogUtil from "../Util/LogUtil";
import SWPeer from "./SWPeer";
import Sender from "../Container/Sender";
import SWMsgPack from "./SWMsgPack";


export default class SWConnection {

    public remoteId: string;

    private _swpeer: SWPeer
    private _service: IServiceController;
    private _conn: PeerJs.DataConnection;
    private _sendQueue = new Array<Uint8Array>();
    private _isOpen = false;
    private _isCreate = false;
    private _isClose = false;


    /**
     * 
     * @param service 
     * @param swpeer 
     * @param remoteId 
     */
    constructor(swpeer: SWPeer, remoteId: string) {
        this.remoteId = remoteId;
        this._swpeer = swpeer;
        this._service = swpeer.Service;
        this._conn = null;
    }


    /**
     * 
     * @param conn 
     */
    public Set(conn: PeerJs.DataConnection) {

        this._conn = conn;
        conn.on('open', () => { this.OnConnectionOpen(this._conn); });
        conn.on("data", (data) => { this._service.Recv(this._conn, data); });
        conn.on('error', (e) => { this._service.OnDataConnectionError(e); });
        conn.on("close", () => {
            if (!this._isClose) {
                this._isClose = true;
                this._service.OnDataConnectionClose(this._conn);
            }
        });
    }

    /**
     * データ送信
     * @param sender 
     */
    public Send(dataType: string, sender: Sender) {

        let data = SWMsgPack.Encode(sender);

        //  接続済みの場合は即送信
        if (this._isOpen) {
            if (this._conn.open) {
                this._conn.send(data);
            }
        }
        else {
            if (!this._isCreate) {
                this._isCreate = true;
                this.Set(this._swpeer.Peer.connect(this.remoteId));
            }

            this._sendQueue.push(data);
        }

        if (LogUtil.IsOutputSender(sender)) {
            let msg = `send(${dataType}) : ${JSON.stringify(sender)}`;
            LogUtil.Info(this._service, msg);
        }
    }


    /**
     * 
     * @param conn 
     */
    private OnConnectionOpen(conn: PeerJs.DataConnection) {
        this._isOpen = true;
        LogUtil.Info(this._service, "data connection [" + this._swpeer.PeerId + "] <-> [" + conn.remoteId + "]");
        this._sendQueue.forEach((data) => { conn.send(data); });
        this._sendQueue = new Array<any>();
        this._service.OnDataConnectionOpen(conn);
    }


    /**
     * 終了処理
     */
    public Close() {
        if (this._conn === null)
            return;

        if (this._conn.open) {
            this._conn.close();
        }
    }


    /**
     * 
     */
    public IsAlive() {
        if (this._conn === null) return false;
        return this._conn.open;
    }


    /**
     * 
     */
    public CheckAlive() {
        if (this._conn) {
            if (this._conn.open) {
                return true;
            }
            else {
                //  想定外の切断が発生した場合、DataConnectionのCloseイベントが発生しないケースがある
                //  Closeイベントが発生しない状態で切断を検知した場合、ServiceControllerのCloseイベントを呼ぶ
                if (!this._isClose) {
                    this._isClose = true;
                    this._service.OnDataConnectionClose(this._conn);
                }
                return false;
            }
        }
        else {
            return false;
        }
    }

}
