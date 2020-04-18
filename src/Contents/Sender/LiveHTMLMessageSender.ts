import Sender from "../../Base/Container/Sender";
import IconCursorSender from "./IconCursorSender";

/**
 * 
 */
export default class LiveHTMLMessageSender extends Sender {

    public static ID = "LiveHTMLMessage";

    constructor() {
        super(LiveHTMLMessageSender.ID);
        this.text = "";
        this.peerid = "";
        this.iconCurosr = null;
    }

    public text: string;
    public peerid: string;
    public iconCurosr: IconCursorSender;

}
