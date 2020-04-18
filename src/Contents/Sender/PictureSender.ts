import Sender from "../../Base/Container/Sender";


/**
 * 
 */
export default class PictureSender extends Sender {
    public static ID = "Picture";

    constructor(src: string) {
        super(PictureSender.ID);
        this.src = src;
    }

    public src: string;

}