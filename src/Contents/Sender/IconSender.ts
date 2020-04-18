import * as Personal from "../../Contents/IndexedDB/Personal";
import Sender from "../../Base/Container/Sender";


/**
 * 
 */
export default class IconSender extends Sender {
    public static ID = "Icon";

    constructor() {
        super(IconSender.ID);
    }

    public icon: Personal.Icon;

}