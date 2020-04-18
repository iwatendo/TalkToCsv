import Sender from "../../Base/Container/Sender";


/**
 * ルーム情報の要求通知
 */
export default class GetRoomSender extends Sender {

    public static ID = "GetRoom";

    constructor(hid: string) {
        super(GetRoomSender.ID)
        this.hid = hid;
    }

    hid: string;
}