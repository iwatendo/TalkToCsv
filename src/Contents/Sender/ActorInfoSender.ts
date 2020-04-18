import Sender from "../../Base/Container/Sender";
import ActorInfo from "../../Contents/Struct/ActorInfo";


/**
 * 
 */
export default class ActorInfoSender extends Sender {

    public static ID = "ActorInfo";

    constructor() {
        super(ActorInfoSender.ID);
    }

    public actorInfo: ActorInfo;
}