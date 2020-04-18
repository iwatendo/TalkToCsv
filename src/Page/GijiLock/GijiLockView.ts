
import AbstractServiceView, { OnViewLoad } from "../../Base/AbstractServiceView";

import StdUtil from "../../Base/Util/StdUtil";
import LinkUtil from "../../Base/Util/LinkUtil";

import GijiLockController from "./GijiLockController";
import LocalCache from "../../Contents/Cache/LocalCache";
import ClearTimelineSender from "../../Contents/Sender/ClearTimelineSender";
import MdlUtil from "../../Contents/Util/MdlUtil";


export default class GijiLockView extends AbstractServiceView<GijiLockController> {

    private _roomFrame = document.getElementById('sbj-room-frame') as HTMLFrameElement;


    /**
     * 初期化処理
     * @param callback 
     */
    protected Initialize(callback: OnViewLoad) {

        StdUtil.StopPropagation();

        document.getElementById('sbj-start-visitor').onclick = (e) => {
            this.StartVisitor();
        };

        let linkurl = LinkUtil.CreateLink("../HomeVisitor/", LocalCache.BootGijiLockPeerID);
        let clipcopybtn = document.getElementById('sbj-start-linkcopy') as HTMLButtonElement;

        //  「接続URLのコピー」
        MdlUtil.SetCopyLinkButton(linkurl, "接続URL", clipcopybtn);

        document.getElementById('sbj-clear-timeline').onclick = (e) => {
            this.ClearTimeline();
        };

        this.Controller.Model.GetRooms((rooms) => {
            if (rooms && rooms.length > 0) {
                callback();
            }
            else {
                //  ルーム情報が存在しない場合、デフォルトデータをセットして表示
                this.Controller.Model.CreateDefaultData(() => {
                    this.Controller.Model.GetRooms((rooms) => {
                        callback();
                    });
                });
            }
        });
    }


    /**
     * 接続URLの表示
     * @param peerid ホームインスタンスのPeerID
     */
    public SetInviteUrl(peerid: string) {
        let url: string = LinkUtil.CreateLink("../", peerid);
        let element: HTMLInputElement = document.getElementById('sbj-invite-url') as HTMLInputElement;
        element.value = url;
    }


    /**
     * 接続peer数の表示
     * @param count 
     */
    public SetPeerCount(count: number) {
        document.getElementById("sbj-home-instance-account-count").setAttribute("data-badge", count.toString());
    }


    /**
     * 
     */
    public StartVisitor() {
        let url = LinkUtil.CreateLink("../HomeVisitor/", LocalCache.BootGijiLockPeerID);
        window.open(url, '_blank');
    }



    /**
     * タイムラインのクリア処理
     */
    public ClearTimeline() {
        this.Controller.Model.ClearTimeline(() => {
            this.Controller.Manager.Chat.AllClear();
            this.Controller.SwPeer.SendAll(new ClearTimelineSender());
        });
    }

    /**
     * プロフィール編集ダイアログの表示
     * @param hid 
     */
    public DoShowRoomEditDialog(hid: string) {

        let src = LinkUtil.CreateLink("../Room/") + "?hid=" + hid;

        this._roomFrame.src = null;
        this._roomFrame.onload = () => {
            this._roomFrame.hidden = false;
            this._roomFrame.onload = null;
            this._roomFrame.contentDocument.getElementById('sbj-room-cancel').focus();
        }
        this._roomFrame.src = src;
    }

}
