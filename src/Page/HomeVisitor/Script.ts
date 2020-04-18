
import * as Home from "../../Contents/IndexedDB/Home";

import StdUtil from "../../Base/Util/StdUtil";
import LinkUtil from "../../Base/Util/LinkUtil";

import HomeVisitorController from "./HomeVisitorController";
import SWPeer from "../../Base/WebRTC/SWPeer";


if (StdUtil.IsSupoortPlatform()) {

    let db = new Home.DB();

    db.Connect(() => {
        let server = new HomeVisitorController();
        server.SwPeer = new SWPeer(server, LinkUtil.GetPeerID(), null);
    });

}
