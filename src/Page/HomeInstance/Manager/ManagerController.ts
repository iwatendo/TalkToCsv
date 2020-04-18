import HomeInstanceController from "../HomeInstanceController";
import RoomManager from "./RoomManager";
import ServentManager from "./ServentManager";
import ChatManager from "./ChatManager";
import VoiceChatManager from "./VoiceChatManager";


export default class ManagerController {

    public Room: RoomManager;
    public Chat: ChatManager;
    public Servent: ServentManager;
    public VoiceChat: VoiceChatManager;


    /**
     * コンストラクタ
     * @param controller 
     */
    constructor(controller: HomeInstanceController, callback) {

        this.Room = new RoomManager(controller);
        this.Chat = new ChatManager(controller, this.Room, callback);
        this.Servent = new ServentManager(controller, this.Room);
        this.VoiceChat = new VoiceChatManager(controller);
    }

}