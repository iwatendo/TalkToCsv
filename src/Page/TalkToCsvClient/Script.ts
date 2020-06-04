
import * as Home from "../../Contents/IndexedDB/Home";

import StdUtil from "../../Base/Util/StdUtil";
import LinkUtil from "../../Base/Util/LinkUtil";

import TalkToCsvClientController from "./TalkToCsvClientController";
import SWPeer from "../../Base/WebRTC/SWPeer";


if (StdUtil.IsSupoortPlatform() && !StdUtil.IsMobile()) {

    let db = new Home.DB();

    db.Connect(() => {
        let server = new TalkToCsvClientController();
        server.SwPeer = new SWPeer(server, LinkUtil.GetPeerID(), null);
    });

}
else {
    document.getElementById("sbj-home-visitor").hidden = true;
    document.getElementById("sbj-home-browser-error").hidden = false;
}

