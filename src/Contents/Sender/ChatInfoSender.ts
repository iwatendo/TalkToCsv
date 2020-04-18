import Sender from "../../Base/Container/Sender";
import ActorInfo from "../../Contents/Struct/ActorInfo";

/**
 * 
 */
export default class ChatInfoSender extends Sender {

    public static ID = "ChatInputing";

    constructor() {
        super(ChatInfoSender.ID);
        this.aid = "";
        this.peerid = "";
        this.iid = "";
        this.gid = "";
        this.hid = "";
        this.name = "";
        this.isInputing = false;
    }

    public aid: string;

    public peerid: string;

    public iid: string;

    public gid: string;

    public hid: string;

    public name: string;

    public isInputing: boolean;


    public static Equals(item1: ChatInfoSender, item2: ChatInfoSender): boolean {
        if (item1 && item2) {
            if (item1.aid === item2.aid
                && item1.peerid === item2.peerid
                && item1.iid === item2.iid
                && item1.gid === item2.gid
                && item1.hid === item2.hid
                && item1.name === item2.name
                && item1.isInputing === item2.isInputing) {
                return true;
            }
            else {
                return false;
            }
        }
        else {
            return false;
        }
    }

}
