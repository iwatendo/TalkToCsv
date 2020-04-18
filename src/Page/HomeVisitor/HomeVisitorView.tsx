import * as React from 'react';
import * as ReactDOM from 'react-dom';

import * as Home from "../../Contents/IndexedDB/Home";
import { Icon } from "../../Contents/IndexedDB/Personal";
import * as Timeline from "../../Contents/IndexedDB/Timeline";

import AbstractServiceView, { OnViewLoad } from "../../Base/AbstractServiceView";
import ImageInfo from "../../Base/Container/ImageInfo";

import { TimelineComponent } from "./Timeline/TimelineComponent";
import HomeVisitorController from "./HomeVisitorController";
import InputPaneController from "./InputPane/InputPaneController";
import LinkUtil from '../../Base/Util/LinkUtil';
import ChatInfoSender from '../../Contents/Sender/ChatInfoSender';
import StyleCache from '../../Contents/Cache/StyleCache';
import MdlUtil from '../../Contents/Util/MdlUtil';


export default class HomeVisitorView extends AbstractServiceView<HomeVisitorController> {

    private _isBooting: boolean = true;
    private _bootElement = document.getElementById('sbj-home-visitor');
    private _mainElement = document.getElementById('sbj-home-visitor-main');
    private _disconnectElement = document.getElementById('sbj-home-visitor-disconnect');
    private _timelineElement = document.getElementById('sbj-home-visitor-timeline-component');
    private _headElement = document.getElementById('sbj-home-visitor-header');
    private _headTitleElement = document.getElementById('sbj-home-visitor-title');
    private _headTitleAccountCountElement = document.getElementById('sbj-home-visitor-account-count');
    private _headRoomMemberElement = document.getElementById('sbj-home-visitor-room-member');

    public InputPane: InputPaneController;

    /**
     * 
     */
    protected Initialize(callback: OnViewLoad) {

        this.SetSplitPane();

        document.getElementById('sbj-home-visitor-timeline-component').onscroll = (e) => {
            this.OnTimelineScroll();
        };

        //  「ユーザー設定」のタブを開く
        document.getElementById('sbj-user-settings').onclick = (e) => {
            window.open("../usersettings/");
        };

        //  「接続URLのコピー」
        let linkurl = LinkUtil.CreateLink("../HomeVisitor/", LinkUtil.GetPeerID());
        let clipcopybtn = document.getElementById('sbj-home-visitor-linkcopy') as HTMLButtonElement;
        MdlUtil.SetCopyLinkButton(linkurl, "接続URL", clipcopybtn);

        //  切断時の「再接続」ボタン
        document.getElementById('sbj-home-visitor-disconnect-retry').onclick = (e) => {
            location.reload();
        };

        //  接続時のタイムアウト処理
        window.setTimeout(() => {
            if (this._isBooting) {
                //  接続ページの表示が10秒経過してもブート処理が完了していなかった場合
                //  接続できなかったと判断して、エラーメッセージを表示する
                document.getElementById('sbj-home-visitor-connection-timeout').hidden = false;
                this.Controller.HasError = true;
                this._isBooting = false;
            }
        }, 10000);

        this.SetServiceListEvent(this.Controller.SwPeer.PeerId);

        //  カーソルのCSSキャッシュエレメント指定
        StyleCache.SetCacheElement(document.getElementById('sbj-home-visitor-main'));

        //  
        callback();
    }


    /**
     * 連動サービスの選択時イベント設定
     * @param peerid 
     */
    public SetServiceListEvent(peerid: string) {

        let clickevent = (url: string) => {
            let link = LinkUtil.CreateLink(url, peerid);
            window.open(link, "_blank");
        }

        document.getElementById('sbj-service-castinstance').onclick = (e) => { clickevent("../CastInstance/"); }
        document.getElementById('sbj-service-castinstance-screenshare').onclick = (e) => { clickevent("../CastInstanceScreenShare/"); }
        document.getElementById('sbj-service-castinstance-mobile').onclick = (e) => { clickevent("../CastInstanceMobileQR/"); }
        document.getElementById('sbj-service-gadgetinstance-youtube').onclick = (e) => { clickevent("../GadgetInstance/"); }
        document.getElementById('sbj-service-livehtml').onclick = (e) => { clickevent("../LiveHTMLInstance/"); }
    }


    /**
     * 多重起動エラー
     */
    public MutilBootError() {
        document.getElementById('sbj-home-visitor-connection-timeout').hidden = true;
        document.getElementById('sbj-home-visitor-multi-boot').hidden = false;
        this._isBooting = false;
    }


    /**
     * スプリットパネルの「仕切り」の移動をスムーズにさせる為の制御
     * ※移動中に他パネルにフォーカスが行かないように一時的InnerDivの幅を広げる
     */
    public SetSplitPane() {
        //  スプリットパネルのスライド時に
        //  他フレームにフォーカスが当たらないようにする
        let splitDivider = document.getElementById('sbj-home-visitor-divider');
        splitDivider.onmousedown = (e) => {
            let elements = document.getElementsByClassName("split-pane-divider-inner");
            if (elements.item.length > 0) {
                let ele = elements.item(0) as HTMLElement;
                ele.style.width = "2048px";
                ele.style.left = "-1048px";
            }
        };

        splitDivider.onmouseup = (e) => {
            let elements = document.getElementsByClassName("split-pane-divider-inner");
            if (elements.item.length > 0) {
                let ele = elements.item(0) as HTMLElement;
                ele.style.width = "10px";
                ele.style.left = "-5px";
            }
        };
    }


    /**
     *  親インスタンスが閉じられた場合やネットワークが切断した場合の処理
     */
    public DisConnect() {
        if (!this._isBooting && !this.Controller.HasError) {
            this._mainElement.hidden = true;
            this._headElement.hidden = true;
            this._bootElement.hidden = true;
            this._disconnectElement.hidden = false;
        }
    }


    /**
     * 部屋の表示
     * @param room 
     */
    public SetRoomInfo(room: Home.Room) {

        if (this._isBooting) {
            this._bootElement.hidden = true;
            this._headElement.hidden = false;
            this._mainElement.hidden = false;
            this.InputPane = new InputPaneController(this.Controller);
            this._isBooting = false;
        }

        if (this.Controller.CurrentHid === room.hid) {
            this.RefreshTimeline();
        }
        else {
            //  ルームの変更があった場合は
            //  変更先のルーム情報の取得と再描画
            this.Controller.CurrentHid = room.hid;
            this.SetRoomDisplay(room);
            this.Controller.GetTimeline(room.hid);
        }
    }


    /**
     * 部屋の表示変更
     * @param room 
     */
    public SetRoomDisplay(room: Home.Room) {

        //  上部タイトル変更
        let title = room.name;
        this._headTitleElement.textContent = title;

        //  部屋の背景画像変更
        ImageInfo.SetCss("sbj-home-visitor-main", room.background);
    }


    /**
     * タイムラインの再描画
     */
    public RefreshTimeline() {
        this.SetTimeline(new Array<Timeline.Message>(), new Array<ChatInfoSender>());
    }


    /**
     * タイムラインの更新
     */
    public SetTimeline(tlms: Array<Timeline.Message>, ings: Array<ChatInfoSender>) {

        let controller = this.Controller;

        //  キャッシュ化
        controller.TimelineCache.SetMessages(tlms);

        //  タイムラインの描画処理
        controller.RoomCache.GetRoomByActorId(this.Controller.CurrentAid, (room) => {

            let dispTlmsgs = controller.TimelineCache.GetMessages(room.hid);

            let te = this._timelineElement;
            let isScrollMax = (te.scrollHeight <= (te.scrollTop + te.offsetHeight) + 72);

            ReactDOM.render(<TimelineComponent key={"timeline"} controller={this.Controller} messages={dispTlmsgs} inputs={ings} />, this._timelineElement, () => {

                this.InputPane.SetUnreadCount(tlms);

                if (isScrollMax) {
                    this.MoveLastTimeline();
                }
            });
        });
    }


    /**
     * タイムラインのスクロールイベント
     */
    public OnTimelineScroll() {
        let te = this._timelineElement;
        if (te.scrollHeight <= (te.scrollTop + te.offsetHeight)) {
            this.MoveLastTimeline();
        }
    }

    /**
     * タイムラインを最終行の位置に移動する
     */
    public MoveLastTimeline() {
        this._timelineElement.scrollTop = 4294967295;
        if (this.InputPane) {
            this.InputPane.ClearUnreadCount();
        }
    }


    /**
     * 
     */
    public ClearTimeline() {
        this.Controller.TimelineCache.Clear();
        this.SetTimeline(new Array<Timeline.Message>(), new Array<ChatInfoSender>());
    }


    /**
     * アイコン画像のCSS設定
     * @param icon 
     */
    public SetIconCss(icon: Icon) {

        if (icon) {
            //  チャットの文字色 / 背景色設定
            StyleCache.SetTimelineMsgStyle(icon.iid, icon);
            //  アイコン設定
            if (icon.img) {
                StyleCache.SetIconStyle(icon.iid, icon.img);
            }
        }
    }

}
