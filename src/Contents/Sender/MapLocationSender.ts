import Sender from "../../Base/Container/Sender";
import { MapPos } from "../Util/GMapsUtil";


export default class MapLocationSender extends Sender {

    public static ID = "MapLocation";

    constructor() {
        super(MapLocationSender.ID);
        this.Location = null;
    }

    public Location: MapPos;

}