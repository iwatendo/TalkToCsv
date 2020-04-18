import * as Personal from "../../Contents/IndexedDB/Personal";
import Sender from "../../Base/Container/Sender";

/**
 * 
 */
export default class GuideSender extends Sender {
    public static ID = "Guide";

    constructor() {
        super(GuideSender.ID);
    }

    public guide: Personal.Guide;

}