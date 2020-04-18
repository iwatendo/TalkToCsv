
import SWConnection from "./SWConnection";
import IServiceController from "../IServiceController";
import Sender from "../Container/Sender";
import LogUtil from "../Util/LogUtil";
import SWPeer from "./SWPeer";


/**
 * データコネクション管理クラス
 */
export default class SWConnectionCache {

    private _owner: SWConnection;
    private _swpeer: SWPeer;
    private _service: IServiceController;
    private _map = new Map<string, SWConnection>();

    /**
     * コンストラクタ
     * @param service サービスコントローラー
     */
    constructor(swpeer: SWPeer) {
        this._swpeer = swpeer;
        this._service = swpeer.Service;
    }


    /**
     * コネクションキャッシュ
     * @param conn 
     */
    public Set(conn: PeerJs.DataConnection) {
        let pp = this.GetConnection(conn.remoteId);
        pp.Set(conn);
    }

    
    /**
     * 
     * @param conn 
     */
    public SetOwner(conn: PeerJs.DataConnection) {
        this._owner = new SWConnection(this._swpeer, conn.remoteId);
    }


    /**
     * 
     * @param data 
     */
    public SendToOwner(sender: Sender) {
        if (this._owner) {
            let data = JSON.stringify(sender);
            this._owner.Send(data);
            if (LogUtil.IsOutputSender(sender)) {
                LogUtil.Info(this._service, "send(owner) : " + data.toString());
            }
        }
    }


    /**
     * 子の接続先にデータ送信
     */
    public Send(peerid: string, sender: Sender) {
        let data = JSON.stringify(sender);
        let pp = this.GetConnection(peerid);
        pp.Send(data);

        if (LogUtil.IsOutputSender(sender)) {
            LogUtil.Info(this._service, "send : " + data.toString());
        }
    }


    /**
     * 全ての接続クライアントへ通知
     */
    public SendAll(sender: Sender) {
        let data = JSON.stringify(sender);
        this._map.forEach((peerPair, key) => {
            peerPair.Send(data);
        });

        if (LogUtil.IsOutputSender(sender)) {
            LogUtil.Info(this._service, "send(all) : " + data.toString());
        }
    }


    /**
     * 接続クライアントの接続有無確認
     */
    public CheckAlive() {

        if (this._owner) {
            if (!this._owner.IsAlive()) {
                this._service.OnOwnerClose();
            }
        }

        this._map.forEach((peerPair, key) => {
            if (!peerPair.CheckAlive()) {
                this._map.delete(key);
            }
        });
    }


    /**
     * 全接続クローズ
     */
    public CloseAll() {
        this._map.forEach((peerPair, key) => {
            if (peerPair.IsAlive()) {
                peerPair.Close();
            }
        });
    }


    /**
     * 有効な接続件数の取得
     */
    public AliveConnectionCount(): number {
        let result: number = 0;

        this._map.forEach((peerPair, key) => {
            if (peerPair.IsAlive()) {
                result++;
            }
        });

        return result;
    }


    /**
     * 接続情報を取得
     * @param peerid 
     */
    private GetConnection(remoteId: string): SWConnection {

        let map = this._map;

        if (map.has(remoteId)) {
            return map.get(remoteId);
        }
        else {
            if (this._owner) {
                if (this._owner.remoteId === remoteId) {
                    return this._owner;
                }
            }

            let pp = new SWConnection(this._swpeer, remoteId);
            map.set(remoteId, pp);
            return pp;
        }
    }

    /**
     * オーナーIDか？
     * @param remoteId 
     */
    public IsOwnerRemoveId(remoteId: string): boolean {
        if (this._owner) {
            if (this._owner.remoteId === remoteId) {
                return true;
            }
        }
        return false;
    }

    /**
     * 
     */
    public CloseOwner() {
        if (this._owner) {
            this._owner.Close();
            this._owner = null;
        }
    }

    /**
     * 接続情報を取得
     * @param remoteId 
     */
    public Close(remoteId: string) {

        let map = this._map;

        if (map.has(remoteId)) {
            let conn = map.get(remoteId);
            conn.Close();
            map.delete(remoteId);
        }
    }

}
