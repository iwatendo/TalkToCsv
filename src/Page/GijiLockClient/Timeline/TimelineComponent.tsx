import * as React from 'react';
import * as ReactDOM from 'react-dom';

import * as Timeline from "../../../Contents/IndexedDB/Timeline";

import GijiLockClientController from "../GijiLockClientController";
import { TimelineMsgItemComponent } from "./TimelineMsgItemComponent";
import ChatInfoSender from '../../../Contents/Sender/ChatInfoSender';
import { TimelineInputingItemComponent } from './TimelineInputingItemComponent';


/**
 *  メッセージプロパティ
 */
interface TimelineProp {
    controller: GijiLockClientController;
    messages: Array<Timeline.Message>;
    inputs: Array<ChatInfoSender>;
}


export class TimelineMsgGroup extends Array<Timeline.Message> {

    constructor(tlmsg: Timeline.Message) {
        super();
        this.aid = tlmsg.aid;
        this.iid = tlmsg.iid;
        this.push(tlmsg);
    }

    aid: string;
    iid: string;
}


/**
 *  
 */
export class TimelineComponent extends React.Component<TimelineProp, any>{

    /**
     *  描画処理
   　*/
    public render() {

        let preMsg: Timeline.Message;
        let group: TimelineMsgGroup;
        let groups = new Array<TimelineMsgGroup>();

        this.props.messages.forEach((tlmsg) => {

            // if (!tlmsg.visible)
            //     return;

            if (!this.IsIncludeBox(preMsg, tlmsg)) {
                group = new TimelineMsgGroup(tlmsg);
                groups.push(group);
                preMsg = tlmsg;
            }
            else {
                group.push(tlmsg);
            }
        });

        let msgList = groups.map((groups) => {
            let key = groups[0].mid;
            return (<TimelineMsgItemComponent key={key} controller={this.props.controller} MsgGroup={groups} />);
        });


        //  入力中の表示
        let ingList = this.props.inputs.map((ing) => {
            if (ing.isInputing) {
                let key = ing.aid;
                return (<TimelineInputingItemComponent key={key} controller={this.props.controller} chatInputing={ing} />);
            }
        });


        return (
            <div id='sbj-timeline'>
                {msgList}
                {ingList}
            </div>
        );
    }


    /**
     * 同一の発言ボックスに含めるか？
     * @param pre 
     * @param cur 
     */
    public IsIncludeBox(pre: Timeline.Message, cur: Timeline.Message) {

        if (pre && cur) {

            //  同一アクター かつ 同一アイコンである事
            if (pre.aid !== cur.aid) return false;
            if (pre.iid !== cur.iid) return false;

            //  名前が変更されていない事
            if (pre.name !== cur.name) return false;

            //  前回の発言から５分経過していない事
            //  5 * 60 * 1000 = 300000
            if ((pre.ctime + 300000) < (cur.ctime)) return false;

            return true;
        }
    }

}


