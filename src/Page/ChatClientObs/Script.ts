
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


document.body.onmouseleave = ()=>{
    document.getElementById("google_translate_element").hidden = true;
    for(let element of document.getElementsByClassName("goog-te-banner-frame")){
        let frame = element as HTMLIFrameElement;
        if(frame && frame.style){
            frame.style.display ="none";
        }
    }
}

document.body.onmouseenter = ()=>{
    document.getElementById("google_translate_element").hidden = false;
    for(let element of document.getElementsByClassName("goog-te-banner-frame")){
        let frame = element as HTMLIFrameElement;
        if(frame && frame.style){
            frame.style.display ="inherit";
        }
    }
}