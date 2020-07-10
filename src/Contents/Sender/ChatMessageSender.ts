import Sender from "../../Base/Container/Sender";

/**
 * 
 */
export default class ChatMessageSender extends Sender {

    public static ID = "ChatMessage";

    constructor() {
        super(ChatMessageSender.ID);
        this.mid = "";
        this.aid = "";
        this.peerid = "";
        this.iid = "";
        this.gid = "";
        this.name = "";
        this.text = "";
        this.isSpeech = false;
        this.isVoiceRecog = false;
    }

    /**
     * メッセージID
     */
    public mid: string;

    public aid: string;

    public peerid: string;

    public iid: string;

    public gid: string;

    public name: string;

    public text: string;

    public isSpeech: boolean;

    public isVoiceRecog: boolean;

}
