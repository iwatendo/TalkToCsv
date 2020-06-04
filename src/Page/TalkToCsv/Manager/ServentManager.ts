import TalkToCsvController from "../TalkToCsvController";
import RoomManager from "./RoomManager";

export default class ServentManager {

    private _controller: TalkToCsvController;


    public get Controller(): TalkToCsvController {
        return this._controller;
    }


    /**
     * コンストラクタ
     * @param controller 
     * @param roomManager 
     */
    constructor(controller: TalkToCsvController, roomManager: RoomManager) {
        this._controller = controller;
    }


}