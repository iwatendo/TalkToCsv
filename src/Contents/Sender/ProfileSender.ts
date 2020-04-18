import * as Personal from "../../Contents/IndexedDB/Personal";
import Sender from "../../Base/Container/Sender";


/**
 * 
 */
export default class ProfileSender extends Sender {

    public static ID = "Profile";

    constructor() {
        super(ProfileSender.ID);
    }

    public profile: Personal.Actor;
}
