
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

function displayGoogleTranslate(isDisplay: boolean) {
    document.getElementById("google_translate_element").hidden = !isDisplay;
    for (let element of document.getElementsByClassName("goog-te-banner-frame")) {
        let frame = element as HTMLIFrameElement;
        if (frame && frame.style) {
            frame.style.display = isDisplay ? "inherit" : "none";
        }
    }
}


document.body.onmouseenter = () => { displayGoogleTranslate(true); }
document.body.onmouseleave = () => { displayGoogleTranslate(false); }
displayGoogleTranslate(false);
