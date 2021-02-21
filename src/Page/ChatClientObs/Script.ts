
import * as Home from "../../Contents/IndexedDB/Home";

import LinkUtil from "../../Base/Util/LinkUtil";

import ChatClientController from "../ChatClient/ChatClientController";
import SWPeer from "../../Base/WebRTC/SWPeer";


let db = new Home.DB();

db.Connect(() => {
    let server = new ChatClientController(true);
    server.UseTwemoji = true;
    server.IsEveryTimeScrolling = true;
    server.SwPeer = new SWPeer(server, LinkUtil.GetPeerID(), null);
});


document.getElementById("sbj-home-visitor-main").onmouseleave = ()=>{
    document.getElementById("google_translate_element").hidden = true;
}

document.getElementById("sbj-home-visitor-main").onmouseenter = ()=>{
    document.getElementById("google_translate_element").hidden = false;
}