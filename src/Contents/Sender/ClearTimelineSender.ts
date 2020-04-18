import Sender from "../../Base/Container/Sender";


/**
 * タイムラインのクリア通知
 */
export default class ClearTimelineSender extends Sender {

    public static ID = "ClearTimeline";

    constructor() {
        super(ClearTimelineSender.ID);
    }
}