import Sender from "../../Base/Container/Sender";
import VoiceChatMemberSender from "./VoiceChatMemberSender";

/**
 * 
 */
export default class VoiceChatMemberListSender extends Sender {
    public static ID = "VoiceChatMemberList";

    constructor() {
        super(VoiceChatMemberListSender.ID);
        this.Members = null;
    }

    public Members: Array<VoiceChatMemberSender>;
}