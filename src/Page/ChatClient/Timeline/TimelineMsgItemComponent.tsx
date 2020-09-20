import * as React from 'react';
import * as ReactDOM from 'react-dom';

import * as Timeline from "../../../Contents/IndexedDB/Timeline";

import StdUtil from "../../../Base/Util/StdUtil";
import MessageUtil from '../../../Base/Util/MessageUtil';

import ChatClientController from "../ChatClientController";
import { TimelineMsgGroup } from "./TimelineComponent";
import SpeechUtil from '../../../Base/Util/SpeechUtil';
import ImageInfo from '../../../Base/Container/ImageInfo';
import StyleCache from '../../../Contents/Cache/StyleCache';
import GetAudioBlobSender from '../../../Contents/Sender/GetAudioBlobSender';


/**
 *  
 */
interface TimelineMsgItemProp {
    controller: ChatClientController;
    MsgGroup: TimelineMsgGroup;
}


export class TimelineMsgItemComponent extends React.Component<TimelineMsgItemProp, any> {


    /**
     *  描画処理
   　*/
    public render() {

        let aid = this.props.MsgGroup.aid;
        let iid = this.props.MsgGroup.iid;
        let isMine = this.IsMyChatMessage();

        let msgtext = this.props.MsgGroup.map((tlmsg) => {

            if (tlmsg.speech) {
                SpeechUtil.TimelineSpeech(tlmsg.ctime, tlmsg.text);
            }

            let mid = 'sbj-timeline-message-' + tlmsg.mid;
            let tmclass = "sbj-timeline-message" + (tlmsg.visible ? "" : " sbj-timeline-message-ignore");
            let icon = (tlmsg.visible ? "clear" : "undo");


            let button = (<span></span>);

            //  音声再生ボタン
            if (tlmsg.voiceRecog) {
                button = (
                    <span>
                        <button className='mdl-button mdl-js-button mdl-button--icon mdl-button--colored sbj-timeline-ignore'
                            onClick={(e) => { this.OnVoiceClick(tlmsg); }}>
                            <i className='material-icons' id={mid}>volume_up</i>
                        </button>
                    </span>
                );
            }

            //  自分のメッセージの場合は削除ボタンを表示
            //  ※削除ボタンは廃止
            /*
            if (this.IsMyChatMessage()) {
                button = (
                    <button className='mdl-button mdl-js-button mdl-button--icon mdl-button--colored sbj-timeline-ignore'
                        onClick={(e) => { this.OnIgnoreClick(tlmsg); }}>
                        <i className='sbj-timeline-message-icon material-icons' id={mid}>{icon}</i>
                    </button>
                );
            }
            */

            let msgs = StdUtil.TextLineSplit(tlmsg.text);
            let ln = 0;
            let dispText = msgs.map(n => {

                ln += 1;
                let linkText = this.SetAutoLink(n);
                if (ln === msgs.length) {
                    return (<span key={ln}>{linkText}{button}</span>);
                }
                else {
                    return (<span key={ln}>{linkText}<br /></span>);
                }
            });

            return (
                <p key={tlmsg.mid} className={tmclass}>{dispText}</p>
            );
        });

        let iconstyle = StyleCache.GetIconStyle(iid);
        //  let msgstyle = StyleCache.GetTimelineMsgStyle(iid);

        let bgColor = this.props.MsgGroup[0].chatBgColor;
        var fgColor = this.blackOrWhite(bgColor);

        let msgstyle = {
            color: fgColor,
            backgroundColor: bgColor,
        };

        //
        let image_div = (iid ? (<div className='sbj-timeline-img-box'><div className='sbj-timeline-img' style={iconstyle}></div></div>) : (<div></div>));

        //
        let msg_div = (
            <div className='sbj-timline-message-box'>
                {this.CreateNameTimeElement(this.props.MsgGroup[0], isMine)}
                <div className='sbj-timeline-balloon' style={msgstyle}>
                    {msgtext}
                </div>
            </div>
        );

        let spc_div = (<div className='sbj-timeline-adjust'></div>);

        if (isMine) {
            return (<div key="left" className='sbj-timeline-flex-left'>{image_div}{msg_div}{spc_div}</div>);
        }
        else {
            return (<div key="right" className='sbj-timeline-flex-right'>{spc_div}{msg_div}{image_div}</div>);
        }

    }

    /**
     * 背景色に応じて文字色を黒か白か判定する
     * @param hexcolor 
     */
    public blackOrWhite(hexcolor: string) {

        if (!hexcolor || hexcolor.length < 7) {
            hexcolor = this.props.controller.DEFULT_BG_COLOR;
        }
        var r = parseInt(hexcolor.substr(1, 2), 16);
        var g = parseInt(hexcolor.substr(3, 2), 16);
        var b = parseInt(hexcolor.substr(5, 2), 16);

        return ((((r * 299) + (g * 587) + (b * 114)) / 1000) < 128) ? "white" : "black";
    }

    /**
     * AutoLinkの設定
     * @param baseText
     */
    public SetAutoLink(baseText: string): JSX.Element {

        let linkArray = MessageUtil.AutoLinkAnaylze(baseText);

        let result = linkArray.map((al) => {

            if( al.isImage){
                return (
                    <span>
                        <img className="sbj-timeline-icon-image" src={al.msg}></img>
                    </span>
                );
            }
            else if (al.isLink) {

                let dispurl = decodeURI(al.msg);

                return (
                    <span>
                        <a className="sbj-timeline-message-autolink" href={al.msg} target="_blank">{dispurl}</a>
                    </span>
                );
            }
            else {
                return (<span>{al.msg}</span>);
            }
        });

        return (<span>{result}</span>);
    }


    /**
     * 名前と発言時間のエレメントを生成
     * @param name 
     * @param datetime 
     * @param isMine 
     */
    public CreateNameTimeElement(msg: Timeline.Message, isMine: boolean): JSX.Element {

        let name = this.props.MsgGroup[0].name;
        let datetime = this.ToDispDate(this.props.MsgGroup[0].ctime);

        let namestyle: React.CSSProperties = { float: (isMine ? "left" : "right") };

        let nameLabel = (name ? <label className='sbj-timeline-name'>{name}</label> : <span></span>);
        let dateLabel = (datetime ? <label className='sbj-timeline-time'>{datetime}</label> : <span></span>);

        if (isMine) {
            return (
                <div className="sbj-timeline-info" style={namestyle}>
                    {nameLabel}
                    {dateLabel}
                </div>
            );
        }
        else {
            return (
                <div className="sbj-timeline-info" style={namestyle}>
                    {dateLabel}
                    {nameLabel}
                </div>
            );
        }
    }


    /**
     * 日付の表示変換
     * @param date
     */
    public ToDispDate(value: number) {
        let date = new Date(value);
        return ("0" + (date.getMonth() + 1)).slice(-2)
            + "/" + ("0" + date.getDate()).slice(-2)
            + " " + ("0" + date.getHours()).slice(-2)
            + ":" + ("0" + date.getMinutes()).slice(-2);
    }


    /**
     * 
     */
    public IsMyChatMessage(): boolean {
        return (this.props.MsgGroup.aid === this.props.controller.CurrentAid);
    }


    /**
     * メッセージの「✕」ボタン押下時イベント
     * @param event
     */
    public OnIgnoreClick(tml: Timeline.Message) {
        tml.visible = !tml.visible;
        this.props.controller.UpdateTimeline(tml);
    }


    /**
     * スピーカーボタン押下時イベント
     * @param tml 
     */
    public OnVoiceClick(tml: Timeline.Message) {

        //  音声を要求
        let sender = new GetAudioBlobSender();
        sender.mid = tml.mid;
        this.props.controller.SwPeer.SendToOwner(sender);

    }

}