import * as React from 'react';
import * as ReactDOM from 'react-dom';

import * as Home from "../../../Contents/IndexedDB/Home";

import { RoomView, RoomActors } from "./RoomView";
import { RoomItemComponent } from "./RoomItemComponent";


/**
 * 
 */
interface RoomProp {
    view: RoomView;
    roomActors: Array<RoomActors>
}


/**
 * 
 */
interface RoomStat {
    roomActors: Array<RoomActors>
}


/**
 * ルーム一覧コンポーネント
 */
export default class RoomComponent extends React.Component<RoomProp, RoomStat> {


    /**
     * コンストラクタ
     * @param props
     * @param context
     */
    constructor(props?: RoomProp, context?: any) {
        super(props, context);

        this.state = {
            roomActors: this.props.roomActors,
        };
    }


    /**
     * ルーム一覧の描画
     */
    public render() {

        let nodes = this.state.roomActors.map((ra) => {
            return (<RoomItemComponent key={ra.room.hid} view={this.props.view} owner={this} room={ra.room} actorInfos={ra.actorInfos} />);
        });

        return (
            <div>
                <div className='sbj-home-instance-room-grid mdl-grid'>
                    {nodes}
                </div>
            </div>
        );
    }


    /**
     * 部屋の並び順変更
     */
    public ChangeRoomOrder(rooms: Array<Home.Room>) {

        this.setState({
            roomActors: this.state.roomActors,
        }, () => {
            this.state.roomActors.forEach(cur => {
                this.props.view.Controller.Model.UpdateRoom(cur.room);
            });
        });
    }


}


