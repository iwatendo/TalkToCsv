import Sender from "../../Base/Container/Sender";

/**
 * 
 */
export default class IconCursorSender extends Sender {

    public static ID = "IconCursor";

    constructor() {
        super(IconCursorSender.ID)
        this.visitorPeerId = "";
        this.homePeerId = "";
        this.aid = "";
        this.iid = "";
        this.posRx = 0;
        this.posRy = 0;
        this.isDisp = false;
    }

    /**
     *  ライブキャストやガジェットキャストの配信先のPeerID 
     */
    visitorPeerId: string;
    /**
     * 上記のキャストを表示している「HomeVisitor」のPeerID
     * カーソルのアイコン画像をリクエストする時に使用
     */
    homePeerId: string;
    aid: string;
    iid: string;
    posRx: number;
    posRy: number;
    isDisp: boolean;
}
