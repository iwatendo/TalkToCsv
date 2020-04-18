import StdUtil from "../Util/StdUtil";
import LinkUtil from "../Util/LinkUtil";

export default abstract class Sender {

    constructor(type: string) {
        this.type = type;
        this.uid = StdUtil.UserID;
        this.key = LinkUtil.OneTimeKey;
    }

    type: string;
    uid: string;
    key: string;

}