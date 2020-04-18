import Sender from "../../Base/Container/Sender";

/**
 * LiveHTML情報要求
 */
export default class GetLiveHTMLSender extends Sender {

    public static ID = "GetLiveHTML";

    constructor() {
        super(GetLiveHTMLSender.ID);
    }

}