import * as Personal from "../IndexedDB/Personal";
import Sender from "../../Base/Container/Sender";


/**
 * 
 */
export default class AudioBlobSender extends Sender {

    public static ID = "AudioBlob";

    constructor() {
        super(AudioBlobSender.ID);
    }

    public mid: string;

    public blob: Blob;
}
