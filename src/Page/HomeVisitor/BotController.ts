
import * as Home from "../../Contents/IndexedDB/Home";
import * as Personal from "../../Contents/IndexedDB/Personal";
import * as Timeline from "../../Contents/IndexedDB/Timeline";

import BotUtil from "../../Base/Util/BotUtil";

import RoomCache from "./Cache/RoomCache";
import HomeVisitorController from "./HomeVisitorController";
import { CastTypeEnum } from "../../Base/Container/CastStatusSender";
import ChatMessageSender from "../../Contents/Sender/ChatMessageSender";
import GuideSender from "../../Contents/Sender/GuideSender";


export default class BotController {

    private Controller: HomeVisitorController = null;

    private _lastTime: number = 0;

    private _guideQuere: Personal.Guide;

    /**
     * コンストラクタ
     * @param serviceController
     */
    public constructor(controller: HomeVisitorController) {
        this.Controller = controller;
        this._lastTime = 0;
    }


    /**
     * チェックタイムライン
     * @param tlmsgs 
     */
    public CheckTimeline(tlmsgs: Array<Timeline.Message>) {

        if (!this.Controller.ConnStartTime)
            return;

        //  古いメッセージが来るケースもある為
        //  BOT判定済みの最終発言メッセージの時間を保持しておく
        tlmsgs.forEach(tlmsg => {
            if (this._lastTime < tlmsg.ctime && this.Controller.ConnStartTime < tlmsg.ctime) {
                this._lastTime = tlmsg.ctime;
                this.CheckTimeLine(tlmsg);
            }
        });
    }


    /**
     * 
     * @param tlmsg 
     */
    public CheckTimeLine(tlmsg: Timeline.Message) {

        let controller = this.Controller;

        controller.UseActors.map((actor) => {

            controller.RoomCache.GetRoomByActorId(actor.aid, (room) => {
                if (room.hid === tlmsg.hid) {
                    this.CheckGuideList(actor, tlmsg);
                }
            });
        });

    }


    /**
     * 
     * @param actor 
     * @param tlmsg 
     */
    public CheckGuideList(actor: Personal.Actor, tlmsg: Timeline.Message) {

        //  UIの仕様が確定するまで隠し機能とする
        if (actor.tag === "dicebot") {
            this.DiceBotCheckMessage(actor, tlmsg);
        }

        if (!actor.guideIds || actor.guideIds.length === 0) {
            return;
        }

        actor.guideIds.forEach((gid) => {
            this.Controller.Model.GetGuide(gid, (guide) => {
                this.CheckGuide(actor, tlmsg, guide);
            });
        });

    }



    /**
     * ガイドチェック
     * @param actor 
     * @param tlmsg 
     * @param guide 
     */
    public CheckGuide(actor: Personal.Actor, tlmsg: Timeline.Message, guide: Personal.Guide) {

        //  自身のガイドBOTのメッセージはチェック対象外とする
        if (guide.gid === tlmsg.gid) {
            return;
        }

        let isMatch = false;
        switch (guide.matchoption) {
            case 0: isMatch = (tlmsg.text.indexOf(guide.keyword) >= 0); break;  //  「部分一致」
            case 1: isMatch = (tlmsg.text === guide.keyword); break;            //  「完全一致」
        }

        let isResCheck = false;
        switch (guide.rescheckoption) {
            case 0: isResCheck = true; break;                         //  「全て」
            case 1: isResCheck = (tlmsg.aid === guide.aid); break;    //  「自分のみ」
            case 2: isResCheck = (tlmsg.aid !== guide.aid); break;    //  「自分以外」
        }

        if (isMatch && isResCheck) {
            let sender = new ChatMessageSender();

            //  ガイドメッセージ表示
            this.Controller.Model.GetActor(guide.aid, (actor) => {
                sender.aid = guide.aid;
                sender.iid = actor.dispIid;
                sender.gid = guide.gid;
                sender.name = actor.name;
                sender.text = guide.note;
                sender.peerid = this.Controller.PeerId;

                if (sender.text.length > 0) {
                    this.Controller.SwPeer.SendToOwner(sender);
                }

            });

        }

    }


    /**
     * 
     */
    public GetGuideQueue(): Personal.Guide {
        let queue = this._guideQuere;
        this._guideQuere = null;
        return queue;
    }


    /**
     * Diceボット
     * @param dicebot 
     * @param tlmsgs 
     */
    public DiceBotCheckMessage(actor: Personal.Actor, tlmsg: Timeline.Message) {

        if (tlmsg.aid !== actor.aid) {
            let result = BotUtil.Dice(tlmsg.text);
            if (result) {
                let sender = new ChatMessageSender();
                sender.aid = actor.aid;
                sender.iid = actor.dispIid;
                sender.gid = "dicebot";
                sender.name = actor.name;
                sender.text = result;
                sender.peerid = this.Controller.PeerId;
                this.Controller.SwPeer.SendToOwner(sender);
            }
        }
    }

}