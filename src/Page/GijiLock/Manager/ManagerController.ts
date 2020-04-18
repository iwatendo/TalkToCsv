import GijiLockController from "../GijiLockController";
import RoomManager from "./RoomManager";
import ChatManager from "./ChatManager";


export default class ManagerController {

    public Room: RoomManager;
    public Chat: ChatManager;


    /**
     * コンストラクタ
     * @param controller 
     */
    constructor(controller: GijiLockController, callback) {

        this.Room = new RoomManager(controller);
        this.Chat = new ChatManager(controller, this.Room, callback);
    }

}