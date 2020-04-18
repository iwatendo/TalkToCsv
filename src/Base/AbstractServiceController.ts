import Sender from "./Container/Sender";
import LogUtil, { LogLevel } from "./Util/LogUtil";
import LinkUtil from "./Util/LinkUtil";
import ISWRoom from "./WebRTC/ISWRoom";
import SWPeer from "./WebRTC/SWPeer";
import SWRoom from "./WebRTC/SWRoom";
import IServiceController from "./IServiceController";
import IServiceReceiver from "./IServiceReceiver";
import IServiceView from "./IServiceView";
import IServiceModel from "./IServiceModel";
import LocalCache from "../Contents/Cache/LocalCache";
import CloseRequestSender from "./Container/CloseRequestSender";

/**
 * Peerサービスコントローラーの抽象化クラス
 */
export default abstract class AbstractServiceController<V extends IServiceView, M extends IServiceModel> implements IServiceController, ISWRoom {

    public View: V;
    public Model: M;
    public Receiver: IServiceReceiver;

    public SwPeer: SWPeer;
    public SwRoom: SWRoom;

    private _peer: PeerJs.Peer;

    public abstract ControllerName(): string;

    /**
     * 
     */
    constructor() {
        //  出力ログレベルの設定
        LogUtil.LogLevel = (LocalCache.DebugMode > 0 ? LogLevel.Info : LogLevel.Error);
    }


    /**
     *  Peer接続されているか？
     */
    public get IsOpen(): boolean {

        if (this._peer) {
            return this._peer.destroyed;
        }
        else {
            return false;
        }
    }


    private static _reload = false;

    /**
     * ページの再読込
     */
    public PageReLoad() {
        AbstractServiceController._reload = true;
        location.href = "";
    }


    /**
     * ページを閉じる
     * ※但しリロードが先に実行されていた場合、リロードを優先
     */
    public PageClose() {
        if (!AbstractServiceController._reload) {
            window.open('about:blank', '_self').close();
        }
    }


    /**
     * エラーログ出力
     * @param message
     * @param err
     */
    public LogError(message: string, err: Error) {

        let log = '';

        if (err.name && err.name.length > 0)
            log += err.name + ' : ';

        if (message && message.length > 0)
            log += message + '\n';

        if (err.message && err.message.length > 0)
            log += err.message;

        LogUtil.Error(this, log);
    }



    /**
     * 自身のPeer生成時イベント
     * @param peer
     */
    public OnPeerOpen(peer: PeerJs.Peer) {
        this._peer = peer;
    }


    /**
     * 自身のPeerエラー時イベント
     * @param err
     */
    public OnPeerError(err: Error) {
        this.LogError('this peer', err);
    }


    /**
     * 自身のPeerClose時イベント
     */
    public OnPeerClose() {
        this._peer = null;
    }


    /**
     * オーナーPeerの接続時イベント
     */
    public OnOwnerConnection() {
    }


    /**
     * オーナーPeerのエラー発生時イベント
     * @param err
     */
    public OnOwnerError(err: any) {
        this.LogError('owner peer', err);
    }


    /**
     * オーナーPeerの切断時イベント
     */
    public OnOwnerClose() {
    }


    /**
     * データコネクション接続時イベント
     * @param conn
     */
    public OnDataConnectionOpen(conn: PeerJs.DataConnection) {
    }


    /**
     * 子Peerのエラー発生時イベント
     * @param err
     */
    public OnDataConnectionError(err: Error) {
        this.LogError('child peer', err);
    }


    /**
     * 子Peerの切断時イベント
     * @param conn
     */
    public OnDataConnectionClose(conn: PeerJs.DataConnection) {
    }


    /**
     * データ取得時イベント
     * @param conn
     * @param recv
     */
    public Recv(conn: PeerJs.DataConnection, recv: any) {

        if (recv === null)
            return;

        let json = decodeURIComponent(recv);
        let sender: Sender = JSON.parse(json) as Sender;

        if (LogUtil.IsOutputSender(sender))
            LogUtil.Info(this, "recv : " + json);

        if (sender === null)
            return;

        if (sender.type === null)
            return;

        //  OneTimeKeyが一致しない場合はデータ送信しない
        if (sender.key !== LinkUtil.OneTimeKey)
            return;

        //  ページクローズ処理の場合
        if(sender.type === CloseRequestSender.ID){

            if(conn){
                let remoteId = conn.remoteId;
                if(remoteId){
                    if( remoteId === this.SwPeer.OwnerReomteId){
                        this.SwPeer.Close(conn.remoteId);
                        this.OnOwnerClose();
                    }
                    else{
                        this.SwPeer.Close(conn.remoteId);
                        this.OnDataConnectionClose(conn);
                    }
                }
            }
        }
        else{
            this.Receiver.Receive(conn, sender);
        }
    }

    /**
     * 
     */
    public OnBeforeUnload(){

    }


    //-------------------------------------------------------------------------
    //  以下、Room(Mesh/SFU)関連のイベントラッパー
    //-------------------------------------------------------------------------


    /**
     * 
     */
    public OnRoomOpen() {
    }


    /**
     * 
     * @param err 
     */
    public OnRoomError(err: any) {
    }


    /**
     * 
     */
    public OnRoomClose() {
    }


    /**
     * 
     * @param peerid 
     */
    public OnRoomPeerJoin(peerid: string) {
    }


    /**
     * 
     * @param peerid 
     */
    public OnRoomPeerLeave(peerid: string) {
    }


    /**
     * 
     * @param peerid 
     * @param recv 
     */
    public OnRoomRecv(peerid: string, recv: any) {

        if (recv === null)
            return;

        let sender: Sender = JSON.parse(recv) as Sender;

        if (LogUtil.IsOutputSender(sender))
            LogUtil.Info(this, "room recv : " + recv);

        if (sender === null)
            return;

        if (sender.type === null)
            return;

        this.Receiver.RoomRecive(peerid, sender);

    }


    /**
     * 
     * @param peerid 
     * @param stream 
     */
    public OnRoomStream(peerid: string, stream: MediaStream) {
    }


    /**
     * 
     * @param peerid 
     * @param stream 
     */
    public OnRoomRemoveStream(peerid: string, stream: MediaStream) {
    }


}


