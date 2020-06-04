import * as React from 'react';

import TalkToCsvClientController from "../TalkToCsvClientController";
import ChatInfoSender from '../../../Contents/Sender/ChatInfoSender';


/**
 *  
 */
interface TimelineInputingItemProp {
    controller: TalkToCsvClientController;
    chatInputing: ChatInfoSender;
}


export class TimelineInputingItemComponent extends React.Component<TimelineInputingItemProp, any> {


    /**
     *  描画処理
   　*/
    public render() {

        let aid = this.props.chatInputing.aid;
        let iid = this.props.chatInputing.iid;
        let isMine = this.IsMyChatMessage();

        //
        let image_div = (<div></div>);

        //
        let msg_div = (
            <div className='sbj-timline-message-box'>
                {this.CreateNameTimeElement(this.props.chatInputing, isMine)}
            </div>
        );

        if (isMine) {
            return (<div key="left" className='sbj-timeline-flex-left'>{image_div}{msg_div}</div>);
        }
        else {
            return (<div key="right" className='sbj-timeline-flex-right'>{msg_div}{image_div}</div>);
        }

    }


    /**
     * 名前と発言時間のエレメントを生成
     * @param name 
     * @param datetime 
     * @param isMine 
     */
    public CreateNameTimeElement(cis: ChatInfoSender, isMine: boolean): JSX.Element {

        let name = this.props.chatInputing.name;
        let inputingLabel = " 入力中 ";

        let namestyle: React.CSSProperties = { float: (isMine ? "left" : "right") };

        if (isMine) {
            return (
                <div style={namestyle}>
                    <label className='sbj-timeline-name'>
                        {name}
                    </label>
                    <label>
                        {inputingLabel}
                    </label>
                </div>
            );
        }
        else {
            return (
                <div style={namestyle}>
                    <label>
                        {inputingLabel}
                    </label>
                    <label className='sbj-timeline-name'>
                        {name}
                    </label>
                </div>
            );
        }
    }


    /**
     * 
     */
    public IsMyChatMessage(): boolean {
        return (this.props.chatInputing.aid === this.props.controller.CurrentAid);
    }

}