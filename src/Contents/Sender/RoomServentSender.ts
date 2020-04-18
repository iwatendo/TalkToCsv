import Sender from "../../Base/Container/Sender";
import ServentSender from "./ServentSender";


/**
 * ルーム内のサーバント一覧の通知
 */
export default class RoomServentSender extends Sender {

    public static ID = "RoomServent";

    constructor() {
        super(RoomServentSender.ID);

        this.hid = "";
        this.servents = new Array<ServentSender>();
    }

    public hid: string;

    public servents: Array<ServentSender>;

}
