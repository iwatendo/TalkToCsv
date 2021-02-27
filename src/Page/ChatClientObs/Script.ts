
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

function hasGoolgeTranslateBanner(): boolean{
    let elements = document.getElementsByClassName("goog-te-banner-frame");
    return (elements && elements.length > 0);
}

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

let banner_check_times = 10;

let interval = setInterval(()=>{
    if(hasGoolgeTranslateBanner()){
        displayGoogleTranslate(false);
        clearInterval(interval);
    }
    banner_check_times --;
    if(banner_check_times <=0){
        clearInterval(interval);
    }
},200);