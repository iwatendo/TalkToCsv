import * as React from 'react';
import * as ReactDOM from 'react-dom';

import * as Personal from "../../../Contents/IndexedDB/Personal";

import { DialogMode } from "../../../Contents/AbstractDialogController";

import HomeVisitorController from "../HomeVisitorController";
import ActorDialog from "./ActorDialog";
import ActorInfo from "../../../Contents/Struct/ActorInfo";



/**
 * プロパティ
 */
export interface RoomActorItemProp {
    controller: HomeVisitorController;
    actorInfo: ActorInfo;
}


export default class RoomActorItemComponent extends React.Component<RoomActorItemProp, any> {


    /**
     * 
     */
    public render() {

        return (
            <li className="sbj-home-visitor-room-member-item mdl-list__item" onClick={this.onClick.bind(this)}>
                <span className="mdl-list__item-primary-content">
                    <i className="sbj-home-visitor-room-actor-icon material-icons mdl-list__item-icon">label_outline</i>
                    {this.props.actorInfo.name}
                </span>
            </li>
        );
    }


    /**
     * 選択時処理
     * @param e 
     */
    private onClick(e) {

        let dialog = new ActorDialog(this.props.controller);

        //  アクターダイアログの表示
        dialog.Show(DialogMode.View, this.props.actorInfo, (result) => { });
    }

}
