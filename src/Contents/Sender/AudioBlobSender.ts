import BinarySender from "../../Base/Container/BinarySender";


/**
 * 
 */
export default class AudioBlobSender extends BinarySender {

    public static ID = "AudioBlob";

    constructor() {
        super(AudioBlobSender.ID);
    }

    public mid: string;
}
