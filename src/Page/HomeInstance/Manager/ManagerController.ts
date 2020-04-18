import HomeInstanceController from "../HomeInstanceController";
import RoomManager from "./RoomManager";
import ServentManager from "./ServentManager";
import ChatManager from "./ChatManager";


export default class ManagerController {

    public Room: RoomManager;
    public Chat: ChatManager;


    /**
     * コンストラクタ
     * @param controller 
     */
    constructor(controller: HomeInstanceController, callback) {

        this.Room = new RoomManager(controller);
        this.Chat = new ChatManager(controller, this.Room, callback);
    }

}