
import HomeVisitorController from "../HomeVisitorController";
import CastStatusSender from "../../../Base/Container/CastStatusSender";
import ServentSender from "../../../Contents/Sender/ServentSender";
import RoomServentSender from "../../../Contents/Sender/RoomServentSender";

interface OnGetServentSender { (sender: ServentSender): void }
interface OnGetRoomServentSender { (sender: RoomServentSender): void }

export default class ServentCache {

    //
    private _controller: HomeVisitorController;
    //  serventPid / ServentSender
    private _myServentCache = new Map<string, ServentSender>();
    //  hid / RoomServentSender
    private _roomServentCache = new Map<string, RoomServentSender>();

    /**
     * コンストラクタ
     * @param controller 
     */
    public constructor(controller: HomeVisitorController) {
        this._controller = controller;
    }

    /**
     * 
     * @param serventPid 
     * @param cib 
     * @param callback 
     */
    public GetMyServent(serventPid: string, cib: CastStatusSender, callback: OnGetServentSender) {

        let cache = this._myServentCache;

        if (cache.has(serventPid)) {
            let servent = cache.get(serventPid);
            servent.isCasting = cib.isCasting;
            servent.clientUrl = cib.clientUrl;  //  クライアントURLも、オプションが変更される可能性があるため差替える
            callback(servent);
        }
        else {

            let selectAid = this._controller.CurrentAid;

            this._controller.Model.GetUserProfile((profile) => {

                this._controller.RoomCache.GetRoomByActorId(selectAid, (room) => {
                    let servent = new ServentSender();
                    servent.serventPeerId = serventPid;
                    servent.ownerPeerid = this._controller.PeerId;
                    servent.ownerAid = profile.aid;
                    servent.ownerIid = profile.dispIid;
                    servent.hid = room.hid;
                    servent.clientUrl = cib.clientUrl;
                    servent.castType = cib.castType;
                    servent.instanceUrl = cib.instanceUrl;
                    servent.isCasting = cib.isCasting;
                    callback(servent);

                    cache.set(serventPid, servent);
                });
            });
        }
    }


    /**
     * 
     * @param servent 
     */
    public SetRoomServent(servent: RoomServentSender) {

        //  
        this._roomServentCache.set(servent.hid, servent);

    }


    /**
     * 
     * @param hid 
     */
    public GetRoomServent(hid: string, callback: OnGetRoomServentSender) {

        let result: RoomServentSender;

        //
        if (this._roomServentCache.has(hid)) {
            result = this._roomServentCache.get(hid);
        }
        else {
            result = new RoomServentSender();
        }

        callback(result);
    }

}