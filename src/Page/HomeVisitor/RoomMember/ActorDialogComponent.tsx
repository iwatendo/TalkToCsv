import * as React from 'react';
import * as ReactDOM from 'react-dom';

import StdUtil from "../../../Base/Util/StdUtil";
import MessageUtil from "../../../Base/Util/MessageUtil";

import ActorInfo from '../../../Contents/Struct/ActorInfo';

import HomeVisitorController from "../HomeVisitorController";

/**
 * 
 */
export interface ActorDialogProp {
    controller: HomeVisitorController;
    actorInfo: ActorInfo;
}


export default class ActorDialogComponent extends React.Component<ActorDialogProp, any> {

    /**
     * 描画処理
     */
    public render() {

        let actor = this.props.actorInfo;

        let msgs = StdUtil.TextLineSplit(actor.profile);
        let ln = 0;
        let dispProfile = msgs.map(line => {

            let dispLine = MessageUtil.AutoLinkAnaylze(line).map((al) => {
                if (al.isLink) {
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

            ln++;
            if (ln === msgs.length) {
                return (<span key={ln}>{dispLine}</span>);
            }
            else {
                return (<span key={ln}>{dispLine}<br /></span>);
            }
        });


        return (
            <div>
                <h5>
                    <span id="sbj-actor-profile-name">{actor.name}</span>
                    <br />
                    <span id="sbj-actor-profile-tag">{actor.tag}</span>
                </h5>
                <h6>
                    <span id="sbj-actor-profile-note">{dispProfile}</span>
                </h6>
            </div>
        );
    }

}
