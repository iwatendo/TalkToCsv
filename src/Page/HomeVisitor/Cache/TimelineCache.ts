
import * as Home from "../../../Contents/IndexedDB/Home";
import * as Timeline from "../../../Contents/IndexedDB/Timeline";

import HomeVisitorController from "../HomeVisitorController";
import ChatInfoSender from "../../../Contents/Sender/ChatInfoSender";


export default class TimelineCache {

    //
    private MAX_DISP_MESSAGE = 512;

    //
    private _controller: HomeVisitorController;

    //  タイムラインメッセージMAP
    private _tlmsgMap = new Map<string, Map<string, Timeline.Message>>();


    /**
     * コンストラクタ
     * @param controller 
     */
    public constructor(controller: HomeVisitorController) {
        this._controller = controller;
    }


    /**
     * メッセージの登録
     * @param tlms 
     */
    public SetMessages(tlms: Array<Timeline.Message>) {
        if (!tlms) {
            return;
        }

        tlms.forEach((tlm) => {
            let hid = tlm.hid;
            let mid = tlm.mid;
            if (!this._tlmsgMap.has(hid)) {
                this._tlmsgMap.set(hid, new Map<string, Timeline.Message>());
            }
            let msgMap = this._tlmsgMap.get(tlm.hid);
            msgMap.set(mid, tlm);
        });
    }


    /**
     * 
     */
    public GetMessages(hid: string): Array<Timeline.Message> {

        let result = new Array<Timeline.Message>();

        if (this._tlmsgMap.has(hid)) {
            let map = this._tlmsgMap.get(hid);

            map.forEach((tlmsg, mid) => {
                result.push(tlmsg);
            });
            result.sort((a, b) => (a.ctime > b.ctime ? 1 : -1));

            let endpos = result.length;
            let start = result.length - this.MAX_DISP_MESSAGE;
            if (start < 0) start = 0;

            return result.slice(start, endpos);
        }
        else {
            return result;
        }

    }


    /**
     * 
     * @param tlmsgs 
     * @param ings 
     */
    public SetTimelineIcon(tlmsgs: Array<Timeline.Message>) {

        let iidmap = new Map<string, Array<string>>();

        tlmsgs.forEach((tlm) => {
            if (!iidmap.has(tlm.peerid)) {
                iidmap.set(tlm.peerid, new Array<string>());
            }
            let iids = iidmap.get(tlm.peerid);
            if (iids.indexOf(tlm.iid) < 0) {
                iids.push(tlm.iid);
            }
        });

        iidmap.forEach((iids, peerid) => {
            this._controller.IconCache.GetIcons(peerid, iids);
        });
    }


    /**
     * キャッシュのクリア処理
     */
    public Clear() {
        this._tlmsgMap = new Map<string, Map<string, Timeline.Message>>();
    }

}
