
import AbstractServiceView, { OnViewLoad } from "../../Base/AbstractServiceView";

import StdUtil from "../../Base/Util/StdUtil";
import LinkUtil from "../../Base/Util/LinkUtil";

import ChatOwnerController from "./ChatOwnerController";
import LocalCache from "../../Contents/Cache/LocalCache";
import ClearTimelineSender from "../../Contents/Sender/ClearTimelineSender";


export default class ChatOwnerView extends AbstractServiceView<ChatOwnerController> {

    /**
     * 初期化処理
     * @param callback 
     */
    protected Initialize(callback: OnViewLoad) {

        StdUtil.StopPropagation();

        document.getElementById('sbj-start-visitor').onclick = (e) => {
            this.StartVisitor();
        };

        let clipcopybtn = document.getElementById('sbj-start-linkcopy') as HTMLButtonElement;
        this.SetCopyLinkButton(clipcopybtn);

        //
        let linkurl = LinkUtil.CreateLink("../ChatClient/", LocalCache.BootChatOwnerPeerID);
        (document.getElementById("sbj-chat-client") as HTMLFrameElement).src = linkurl;

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
     * 
     */
    public GetLinkUrl(): string {

        let mode = (document as any).form.mode.value as string;

        switch (mode) {
            case "invite": return LinkUtil.CreateLink("../ChatClient/", LocalCache.BootChatOwnerPeerID);
            case "obs-default": return LinkUtil.CreateLink("../ChatClientObs/", LocalCache.BootChatOwnerPeerID);
            case "obs-invert": return LinkUtil.CreateLink("../ChatClientObs/invert.html", LocalCache.BootChatOwnerPeerID);
        }

    }


    /**
     * 
     * @param linkCopyBtn 
     */
    public SetCopyLinkButton(linkCopyBtn: HTMLButtonElement) {

        if (linkCopyBtn) {
            linkCopyBtn.onclick = (e) => {

                let link = this.GetLinkUrl();
                StdUtil.ClipBoardCopy(link);

                linkCopyBtn.textContent = " クリップボードにコピーしました ";

                linkCopyBtn.classList.remove('mdl-button--raised');
                linkCopyBtn.classList.remove('mdl-button--colored');
                linkCopyBtn.classList.add('mdl-button--accent');

                window.setTimeout(() => {
                    linkCopyBtn.textContent = "URLコピー";
                    linkCopyBtn.classList.remove('mdl-button--accent');
                    linkCopyBtn.classList.add('mdl-button--colored');
                    linkCopyBtn.classList.add('mdl-button--raised');
                }, 2500);

            };
        }

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
        let url = LinkUtil.CreateLink("../ChatClient/", LocalCache.BootChatOwnerPeerID);
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
