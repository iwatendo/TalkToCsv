import Sender from "../../Base/Container/Sender";
import * as Timeline from "../../Contents/IndexedDB/Timeline";


/**
 * タイムラインの更新用
 */
export default class UpdateTimelineSender extends Sender {

    public static ID = "UpdateTimeline";

    constructor() {
        super(UpdateTimelineSender.ID);
    }

    public message: Timeline.Message;
}