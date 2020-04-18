import Sender from "./Container/Sender";
import IServiceReceiver from "./IServiceReceiver";
import IServiceController from "./IServiceController";

/*
 *
 */
export default abstract class AbstractServiceReceiver<T extends IServiceController> implements IServiceReceiver {


    private _controller: T = null;


    /**
     * コンストラクタ
     * @param serviceController
     */
    constructor(serviceController: T) {
        this._controller = serviceController;
    }


    protected get Controller(): T {
        return this._controller;
    }


    /**
     * データ取得時処理
     * @param conn
     * @param sender
     */
    public abstract Receive(conn: PeerJs.DataConnection, sender: Sender);


    /**
     * Room(Mesh/SFU)のデータ受信処理
     * @param peerid 
     * @param sender 
     */
    public RoomRecive(peerid: string, sender: Sender) {
    }

}
