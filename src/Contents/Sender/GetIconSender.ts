import Sender from "../../Base/Container/Sender";


/**
 * 
 */
export default class GetIconSender extends Sender {

    public static ID = "GetIcon";

    constructor() {
        super(GetIconSender.ID);
        this.iid = "";
    }

    public iid: string;
}