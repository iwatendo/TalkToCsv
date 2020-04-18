
import Sender from "../../Base/Container/Sender";


export default class ProfileChangeSender extends Sender {

    public static ID = "ProfileChange";

    constructor() {
        super(ProfileChangeSender.ID);

        this.updateAid = "";
        this.selectAid = "";
        this.isClose = false;
        }

    public updateAid: string;
    public selectAid: string;
    public isClose : boolean;
}

