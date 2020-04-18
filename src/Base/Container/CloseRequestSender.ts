import Sender from "./Sender";


/**
 *  接続のクローズ要求
 */
export default class CloseRequestSender extends Sender {

    public static ID = "CloseRequest";

    constructor() {
        super(CloseRequestSender.ID)
    }

}


