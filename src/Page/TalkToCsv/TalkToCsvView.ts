
import AbstractServiceView, { OnViewLoad } from "../../Base/AbstractServiceView";

import StdUtil from "../../Base/Util/StdUtil";
import LinkUtil from "../../Base/Util/LinkUtil";

import TalkToCsvController from "./TalkToCsvController";
import LocalCache from "../../Contents/Cache/LocalCache";
import ClearTimelineSender from "../../Contents/Sender/ClearTimelineSender";
import MdlUtil from "../../Contents/Util/MdlUtil";


export default class TalkToCsvView extends AbstractServiceView<TalkToCsvController> {

    /**
     * 初期化処理
     * @param callback 
     */
    protected Initialize(callback: OnViewLoad) {

        StdUtil.StopPropagation();

        document.getElementById('sbj-start-visitor').onclick = (e) => {
            this.StartVisitor();
        };

        let linkurl = LinkUtil.CreateLink("../TalkToCsvClient/", LocalCache.BootTalkToCsvPeerID);
        let clipcopybtn = document.getElementById('sbj-start-linkcopy') as HTMLButtonElement;

        //  「接続URLのコピー」
        MdlUtil.SetCopyLinkButton(linkurl, "招待URL", clipcopybtn);

        //
        (document.getElementById("sbj-gjilock-client") as HTMLFrameElement).src = linkurl;

        document.getElementById('sbj-clear-timeline').onclick = (e) => {
            this.ClearTimeline();
        };

        document.getElementById('sbj-export-timeline-csv').onclick = (e) => {
            this.ExportTimeline();
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
        let url = LinkUtil.CreateLink("../TalkToCsvClient/", LocalCache.BootTalkToCsvPeerID);
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
     * タイムラインの出力
     */
    public ExportTimeline() {
        this.Controller.Model.ExportTimeline();
    }

}
