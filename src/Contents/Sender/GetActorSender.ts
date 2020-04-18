import Sender from "../../Base/Container/Sender";

/**
 * アクター情報要求
 */
export default class GetActorSender extends Sender {

    public static ID = "GetActor";

    constructor() {
        super(GetActorSender.ID);
        this.aid = "";
    }

    public aid: string;
}