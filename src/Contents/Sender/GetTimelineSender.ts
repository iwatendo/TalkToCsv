import Sender from "../../Base/Container/Sender";
import ActorInfo from "../../Contents/Struct/ActorInfo";

/**
 * 
 */
export default class GetTimelineSender extends Sender {

    public static ID = "GetTimeline";

    constructor() {
        super(GetTimelineSender.ID);
        this.hid = "";
        this.count = 0;
    }

    public hid: string;
    public count: number;

}
