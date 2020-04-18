import * as React from 'react';
import * as ReactDOM from 'react-dom';

import * as Personal from "../../../Contents/IndexedDB/Personal";

import { DialogMode } from "../../../Contents/AbstractDialogController";

import HomeVisitorController from "../HomeVisitorController";
import ActorDialog from "./ActorDialog";
import ActorInfo from "../../../Contents/Struct/ActorInfo";
import RoomActorItemComponent from "./RoomActorItemComponent";



/**
 * プロパティ
 */
export interface RoomMemberItemProp {
    controller: HomeVisitorController;
    ownerAid: string;
    ownerPeerId: string;
    actors: Array<ActorInfo>;
}


/**
 * プロパティ
 */
export interface RoomMemberItemStat {
    userInfo: ActorInfo;
}



export default class RoomMemberItemComponent extends React.Component<RoomMemberItemProp, RoomMemberItemStat> {


    /**
      * コンストラクタ
      * @param props
      * @param context
      */
    constructor(props?: RoomMemberItemProp, context?: any) {
        super(props, context);
        this.state = {
            userInfo: null,
        };
    }


    /**
     * 
     */
    public render() {

        let dispname = "";

        if (this.state.userInfo) {
            dispname = this.state.userInfo.name;
        }
        else {
            let peerid = this.props.ownerPeerId;
            let aid = this.props.ownerAid;
            this.props.controller.ActorCache.GetActor(peerid, aid, (actor) => {
                if (actor) {
                    this.setState({ userInfo: actor });
                }
            });
        }

        let actorTable = this.props.actors.map((ai) => {
            if (!ai.isUser) {
                return (<RoomActorItemComponent key={ai.aid} controller={this.props.controller} actorInfo={ai} />);
            }
        });

        return (
            <div>
                <li className="sbj-home-visitor-room-member-item mdl-list__item" onClick={this.onClick.bind(this)}>
                    <span className="mdl-list__item-primary-content">
                        <i className="material-icons mdl-list__item-icon sbj-home-visitor-room-member-icon">account_box</i>
                        {dispname}
                    </span>
                </li>
                {actorTable}
            </div>
        );
    }


    /**
     * 選択時処理
     * @param e 
     */
    private onClick(e) {

        let dialog = new ActorDialog(this.props.controller);

        //  アクターダイアログの表示
        dialog.Show(DialogMode.View, this.state.userInfo, (result) => { });
    }

}
