import Sender from "../../Base/Container/Sender";

/**
 * 強制終了通知
 */
export default class ForcedTerminationSender extends Sender {

    public static ID = "ForcedTermination";

    constructor() {
        super(ForcedTerminationSender.ID);
    }
}
