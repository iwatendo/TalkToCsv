import HomeInstanceController from "../HomeInstanceController";
import RoomManager from "./RoomManager";

export default class ServentManager {

    private _controller: HomeInstanceController;


    public get Controller(): HomeInstanceController {
        return this._controller;
    }


    /**
     * コンストラクタ
     * @param controller 
     * @param roomManager 
     */
    constructor(controller: HomeInstanceController, roomManager: RoomManager) {
        this._controller = controller;
    }


}