import Sender from "../../Base/Container/Sender";


/**
 * 端末情報
 */
export default class TerminalInfoSender extends Sender {

    public static ID = "TerminalInfo";

    constructor() {
        super(TerminalInfoSender.ID);

        this.platform = "";
        this.userAgent = "";
        this.appVersion = "";

    }

    public platform: string;
    public userAgent: string;
    public appVersion: string;

}