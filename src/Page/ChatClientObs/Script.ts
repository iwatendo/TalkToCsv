
import * as Home from "../../Contents/IndexedDB/Home";

import LinkUtil from "../../Base/Util/LinkUtil";

import ChatClientController from "../ChatClient/ChatClientController";
import SWPeer from "../../Base/WebRTC/SWPeer";


let db = new Home.DB();

db.Connect(() => {
    let server = new ChatClientController();
    server.SwPeer = new SWPeer(server, LinkUtil.GetPeerID(), null);
});