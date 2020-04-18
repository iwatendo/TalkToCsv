import Sender from "../../Base/Container/Sender";
import { CastTypeEnum } from "../../Base/Container/CastStatusSender";

/**
 * サーバントの起動通知
 */
export default class ServentSender extends Sender {

    public static ID = "Servent";

    constructor() {
        super(ServentSender.ID);

        this.serventPeerId = "";
        this.ownerPeerid = "";
        this.ownerAid = "";
        this.ownerIid = "";
        this.hid = "";
        this.clientUrl = "";
        this.instanceUrl = "";
        this.castType = CastTypeEnum.None;
        this.isCasting = false;
    }

    public serventPeerId: string;

    public ownerPeerid: string;

    public ownerAid: string;

    public ownerIid: string;

    public hid: string;

    public clientUrl: string;

    public instanceUrl: string;

    public castType: CastTypeEnum;

    /**
     * 配信有無
     * インスタンスが起動していても、以下のフラグがTrueになっていない場合配信されない事に注意
     */
    public isCasting: boolean;
}
