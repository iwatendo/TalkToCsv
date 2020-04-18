
import Sender from "../../Base/Container/Sender";


export default class SettingsChangeSender extends Sender {

    public static ID = "SettingsChange";

    constructor() {
        super(SettingsChangeSender.ID);

        this.updateAid = "";
        this.selectAid = "";
        this.isClose = false;
        }

    public updateAid: string;
    public selectAid: string;
    public isClose : boolean;
}

