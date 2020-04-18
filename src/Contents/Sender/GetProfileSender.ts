import Sender from "../../Base/Container/Sender";


/**
 * ユーザープロフィール要求
 */
export default class GetProfileSender extends Sender {

    public static ID = "GetProfile";

    constructor() {
        super(GetProfileSender.ID);
    }
}
