import * as React from 'react';
import * as ReactDOM from 'react-dom';

import * as Home from "../../Contents/IndexedDB/Home";
import * as Timeline from "../../Contents/IndexedDB/Timeline";

import AbstractServiceView, { OnViewLoad } from "../../Base/AbstractServiceView";

import { TimelineComponent } from "./Timeline/TimelineComponent";
import CatClientController from "./ChatClientController";
import InputPaneController from "./InputPane/InputPaneController";
import ChatInfoSender from '../../Contents/Sender/ChatInfoSender';
import { Actor } from '../../Contents/IndexedDB/Personal';
import MdlUtil from '../../Contents/Util/MdlUtil';


export default class CatClientView extends AbstractServiceView<CatClientController> {

    private _isBooting: boolean = true;
    private _bootElement = document.getElementById('sbj-home-visitor');
    private _mainElement = document.getElementById('sbj-home-visitor-main');
    private _disconnectElement = document.getElementById('sbj-home-visitor-disconnect');
    private _timelineElement = document.getElementById('sbj-home-visitor-timeline-component');
    private _headElement = document.getElementById('sbj-home-visitor-header');

    public InputPane: InputPaneController;

    /**
     * 
     */
    protected Initialize(callback: OnViewLoad) {

        document.getElementById('sbj-home-visitor-timeline-component').onscroll = (e) => {
            this.OnTimelineScroll();
        };

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

        //  
        callback();
    }

    /**
     * プロフィールの初期表示と変更時イベント設定
     */
    public InitializeActorEvent(actor: Actor) {

        MdlUtil.SetTextField('sbj-profile-name', 'sbj-profile-name-field', actor.name, true);

        let element = document.getElementById('sbj-profile-name') as HTMLInputElement;
        element.onchange = (ev) => {
            actor.name = element.value;
            this.Controller.Model.UpdateActor(actor, () => { });
        };
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
            //  this._headElement.hidden = false;
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
            this.Controller.GetTimeline(room.hid);
        }
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
    }


    /**
     * 
     */
    public ClearTimeline() {
        this.Controller.TimelineCache.Clear();
        this.SetTimeline(new Array<Timeline.Message>(), new Array<ChatInfoSender>());
    }


}
