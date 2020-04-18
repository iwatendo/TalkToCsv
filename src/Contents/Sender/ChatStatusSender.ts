import Sender from "../../Base/Container/Sender";
import { ActorType } from "../IndexedDB/Personal";

/**
 * チャットクライアントからサーバント側にチャット情報を送る為のクラス
 */
export default class ChatStatusSender extends Sender {

    public static ID = "CursorInfo";

    constructor() {
        super(ChatStatusSender.ID);
        this.peerid = "";
        this.aid = "";
        this.iid = "";
        this.actorType = ActorType.Default;
        this.message = "";
    }

    peerid: string;
    aid: string;
    iid: string;
    actorType: ActorType;
    message: string;
}