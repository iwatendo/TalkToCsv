import * as React from 'react';
import * as ReactDOM from 'react-dom';

import * as Home from "../../../Contents/IndexedDB/Home";
import * as Personal from "../../../Contents/IndexedDB/Personal";

import HomeVisitorController from "../HomeVisitorController";
import { RoomUnread } from "./RoomComponent";



/**
 * プロパティ
 */
export interface RoomItemProp {
    controller: HomeVisitorController;
    room: Home.Room;
    unreadcount: number;
}


export default class RoomItemComponent extends React.Component<RoomItemProp, any> {


    /**
     * 
     */
    public render() {

        let dispname = this.props.room.name;

        if (this.props.unreadcount > 0) {
            dispname += " (" + this.props.unreadcount.toString() + ")";
        }

        return (
            <li className="mdl-menu__item" onClick={this.OnClick.bind(this)}>{dispname}</li>
        );
    }


    /**
     * 
     * @param e 
     */
    private OnClick(e) {

        let controller = this.props.controller;

        controller.RoomCache.GetMember(this.props.room.hid, (ram) => {

            let rml = ram.members.filter((ai) => ai.peerid === controller.PeerId);

            if (rml.length > 0) {
                if (rml.filter((ai) => ai.aid === controller.CurrentAid).length === 0) {
                    controller.View.InputPane.ChangeSelectionActorIcon(rml[0].aid);
                }
                else {
                    controller.View.MoveLastTimeline();
                }
            }

        });

    }

}
