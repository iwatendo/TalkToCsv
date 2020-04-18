import Sender from "../../Base/Container/Sender";

/**
 * クライアントの起動通知
 */
export default class ClientBootSender extends Sender {

    public static ID = "ClientBoot";

    constructor() {
        super(ClientBootSender.ID);
    }
}