import GijiLockController from "../GijiLockController";
import RoomManager from "./RoomManager";

export default class ServentManager {

    private _controller: GijiLockController;


    public get Controller(): GijiLockController {
        return this._controller;
    }


    /**
     * コンストラクタ
     * @param controller 
     * @param roomManager 
     */
    constructor(controller: GijiLockController, roomManager: RoomManager) {
        this._controller = controller;
    }


}