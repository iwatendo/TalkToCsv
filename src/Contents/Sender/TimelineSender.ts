import Sender from "../../Base/Container/Sender";
import * as Timeline from "../../Contents/IndexedDB/Timeline";
import ChatMessageSender from "./ChatMessageSender";
import ChatInfoSender from "./ChatInfoSender";


/**
 * タイムライン通知
 */
export default class TimelineSender extends Sender {

    public static ID = "Timeline";

    constructor() {
        super(TimelineSender.ID);

        this.msgs = new Array<Timeline.Message>();
        this.ings = new Array<ChatInfoSender>();
    }

    msgs: Array<Timeline.Message>;
    ings: Array<ChatInfoSender>;
}