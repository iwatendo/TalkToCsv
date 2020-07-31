import StdUtil from "../../Base/Util/StdUtil";
import SWPeer from "../../Base/WebRTC/SWPeer";
import LocalCache from "../../Contents/Cache/LocalCache";
import ChatOwnerController from "./ChatOwnerController";

if (StdUtil.IsSupoortPlatform() && !StdUtil.IsMobile()) {

    let bootid = LocalCache.BootChatOwnerPeerID;

    if (bootid && bootid.length > 0) {

        //  instanceIDが設定されていた場合は多重起動と判定する
        MultiBootError();

        //  強制起動
        document.getElementById('sbj-home-instance-force-boot').onclick = () => {
            LocalCache.BootChatOwnerPeerID = "";
            location.reload();
        }
    }
    else {

        let isBoot = false;

        //  接続時のタイムアウト処理
        window.setTimeout(() => {
            //  5秒経過してもピア接続が完了しなかった場合、接続できなかったと判断。
            if (!isBoot) {
                BootTimeout();
            }
        }, 5000);

        //  通常起動
        let server = new ChatOwnerController();
        server.SwPeer = new SWPeer(server, null, () => {
            isBoot = true;
            BootSucceed();
        });
    }
}
else {
    BrowerError();
}

/**
 * 選択ブラウザのエラー
 */
function BrowerError() {
    document.getElementById('sbj-home-instance-boot').hidden = true;
    document.getElementById("sbj-home-browser-error").hidden = false;
}

/**
 * Peer接続に成功した場合、表示を切替える
 */
function BootSucceed() {
    document.getElementById('sbj-home-instance-boot').hidden = true;
    document.getElementById('sbj-home-instance-header').hidden = false;
    document.getElementById('sbj-home-instance-main').hidden = false;
}

function BootTimeout() {
    document.getElementById('sbj-home-instance-boot').hidden = true;
    document.getElementById('sbj-home-instance-timeout').hidden = false;
}

function MultiBootError() {
    document.getElementById('sbj-home-instance-boot').hidden = true;
    document.getElementById('sbj-home-instance-header').hidden = true;
    document.getElementById('sbj-home-instance-main').hidden = true;
    document.getElementById('sbj-home-instance-mulitboot-error').hidden = false;
}
