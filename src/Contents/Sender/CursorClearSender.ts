import Sender from "../../Base/Container/Sender";

export default class CursorClearSender extends Sender {

    public static ID = "CursorClear";

    constructor() {
        super(CursorClearSender.ID);
    }

}