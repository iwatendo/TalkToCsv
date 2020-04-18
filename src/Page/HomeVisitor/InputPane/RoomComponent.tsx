import * as React from 'react';
import * as ReactDOM from 'react-dom';

import * as Home from "../../../Contents/IndexedDB/Home";
import * as Personal from "../../../Contents/IndexedDB/Personal";

import HomeVisitorController from "../HomeVisitorController";
import RoomItemComponent from "./RoomItemComponent";


export class RoomUnread {

    constructor(room: Home.Room, unreadcount: number) {
        this.room = room;
        this.unreadCount = unreadcount;
    }

    room: Home.Room;
    unreadCount: number;
}


/**
 * プロパティ
 */
export interface RoomProp {
    controller: HomeVisitorController;
    roomUnreads: Array<RoomUnread>;
}


export default class RoomComponent extends React.Component<RoomProp, any> {

    /**
     * 
     */
    public render() {

        let list = this.props.roomUnreads.map((ru) => {
            let key = ru.room.hid + ru.room.name;
            return (<RoomItemComponent key={key} controller={this.props.controller} room={ru.room} unreadcount={ru.unreadCount} />);
        });

        return (
            <div>
                {list}
            </div>
        );
    }

}
