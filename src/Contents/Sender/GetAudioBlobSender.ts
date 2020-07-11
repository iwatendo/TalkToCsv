import Sender from "../../Base/Container/Sender";


/**
 * 
 */
export default class GetAudioBlobSender extends Sender {

    public static ID = "GetAudioBlob";

    constructor() {
        super(GetAudioBlobSender.ID);
    }

    public mid: string;
}
