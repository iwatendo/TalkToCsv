import Sender from "../../Base/Container/Sender";

/**
 * 接続情報
 */
export default class ConnInfoSender extends Sender {
    public static ID = "ConnInfo";

    constructor() {
        super(ConnInfoSender.ID);
        this.starttime = Date.now();
        this.isBootCheck = false;
        this.isMultiBoot = false;
    }

    starttime: number;
    isBootCheck: boolean;
    isMultiBoot: boolean;
}
