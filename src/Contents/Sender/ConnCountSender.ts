import Sender from "../../Base/Container/Sender";

/**
 * 接続情報
 */
export default class ConnCountSender extends Sender {
    public static ID = "ConnCount";

    constructor() {
        super(ConnCountSender.ID);
        this.count = 0;
    }

    count: number;
}
