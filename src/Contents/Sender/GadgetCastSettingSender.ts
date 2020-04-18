import Sender from "../../Base/Container/Sender";
import * as Personal from "../../Contents/IndexedDB/Personal";
import YouTubeStatusSender from "./YouTubeStatusSender";

/**
 * 
 */
export default class GadgetCastSettingSender extends Sender {

    public static ID = "GadgetCastSetting";

    constructor() {
        super(GadgetCastSettingSender.ID);
        this.dispUserCursor = false;
        this.guide = null;
    }
    dispUserCursor: boolean;
    guide: Personal.Guide;
    status: YouTubeStatusSender;
}
