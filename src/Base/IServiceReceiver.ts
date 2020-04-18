import Sender from "./Container/Sender";

/*
 *  ServiceReciver
 */
export default interface IServiceReceiver {

    Receive(conn: PeerJs.DataConnection, sender: Sender);

    RoomRecive(peerid: string, sender: Sender);

}