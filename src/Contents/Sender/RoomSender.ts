import Sender from "../../Base/Container/Sender";
import * as Home from "../../Contents/IndexedDB/Home";

/**
 * ルーム情報通知
 */
export default class RoomSender extends Sender {

    public static ID = "Room";

    constructor() {
        super(RoomSender.ID);
    }

    room: Home.Room;
}