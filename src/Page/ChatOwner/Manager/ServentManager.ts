import ChatOwnerController from "../ChatOwnerController";
import RoomManager from "./RoomManager";

export default class ServentManager {

    private _controller: ChatOwnerController;


    public get Controller(): ChatOwnerController {
        return this._controller;
    }


    /**
     * コンストラクタ
     * @param controller 
     * @param roomManager 
     */
    constructor(controller: ChatOwnerController, roomManager: RoomManager) {
        this._controller = controller;
    }


}