import Sender from "../../Base/Container/Sender";


/**
 * サーバントの終了通知
 */
export default class ServentCloseSender extends Sender {

    public static ID = "ServentClose";

    constructor() {
        super(ServentCloseSender.ID);

        this.serventPeerId = "";
        this.ownerPeerid = "";
    }

    public serventPeerId: string;

    public ownerPeerid: string;
}
