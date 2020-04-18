import Sender from "../../Base/Container/Sender";
import ActorInfo from "../../Contents/Struct/ActorInfo";

/**
 * 使用アクター情報
 */
export default class UseActorSender extends Sender {

    public static ID = "UseActor";

    constructor() {
        super(UseActorSender.ID);
        this.ActorInfos = new Array<ActorInfo>();
    }

    /**
     * 使用アクター
     */
    public ActorInfos: Array<ActorInfo>;

}
