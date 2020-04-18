import Sender from "../../Base/Container/Sender";
import ActorInfo from "../../Contents/Struct/ActorInfo";

/**
 * 
 */
export default class ChatMessageSender extends Sender {

    public static ID = "ChatMessage";

    constructor() {
        super(ChatMessageSender.ID);
        this.aid = "";
        this.peerid = "";
        this.iid = "";
        this.gid = "";
        this.name = "";
        this.text = "";
        this.isSpeech = false;
        this.isVoiceRecog = false;
    }

    public aid: string;

    public peerid: string;

    public iid: string;

    public gid: string;

    public name: string;

    public text: string;

    public isSpeech: boolean;

    public isVoiceRecog: boolean;
    
}
