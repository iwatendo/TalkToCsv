
import * as Timeline from "../../../Contents/IndexedDB/Timeline";

import TalkToCsvClientController from "../TalkToCsvClientController";


export default class TimelineCache {

    //
    private MAX_DISP_MESSAGE = 512;

    //
    private _controller: TalkToCsvClientController;

    //  タイムラインメッセージMAP
    private _tlmsgMap = new Map<string, Map<string, Timeline.Message>>();


    /**
     * コンストラクタ
     * @param controller 
     */
    public constructor(controller: TalkToCsvClientController) {
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
     * キャッシュのクリア処理
     */
    public Clear() {
        this._tlmsgMap = new Map<string, Map<string, Timeline.Message>>();
    }

}
