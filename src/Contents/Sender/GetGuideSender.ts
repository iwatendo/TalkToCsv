import Sender from "../../Base/Container/Sender";


/**
 * 
 */
export default class GetGuideSender extends Sender {

    public static ID = "GetGuide";

    constructor() {
        super(GetGuideSender.ID);
    }
}