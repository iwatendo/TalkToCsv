import SWPeer from "./WebRTC/SWPeer";
import SWRoom from "./WebRTC/SWRoom";

/**
 * サービスコントローラー
 */
export default interface IServiceController {

    //
    SwPeer: SWPeer;

    //
    SwRoom: SWRoom;

    //  
    ControllerName(): string;

    //  自身のPeer生成時イベント
    OnPeerOpen(peer: PeerJs.Peer);

    //  自身のPeer生成時エラー
    OnPeerError(err: Error);

    //  自身の終了時イベント
    OnPeerClose();

    //  オーナーPeerの接続イベント
    OnOwnerConnection();

    //  オーナーPeerのエラー
    OnOwnerError(err: Error);

    //  オーナーPeerの切断時イベント
    OnOwnerClose();

    //  データコネクション接続時のイベント
    OnDataConnectionOpen(conn: PeerJs.DataConnection);

    //  データコネクションエラー
    OnDataConnectionError(err: Error);

    //  データコネクション接続解除時のイベント
    OnDataConnectionClose(conn: PeerJs.DataConnection);

    //  データ取得時イベント
    Recv(conn: PeerJs.DataConnection, recv);

    //  ページクローズ時イベント
    OnBeforeUnload();

}
