import * as React from 'react';
import * as ReactDOM from 'react-dom';

import * as Personal from "../../../Contents/IndexedDB/Personal";
import * as Home from "../../../Contents/IndexedDB/Home";

import StdUtil from "../../../Base/Util/StdUtil";
import { RoomView, DragItemType } from "./RoomView";
import ActorInfo from '../../../Contents/Struct/ActorInfo';


interface RoomMemberProp {
    view: RoomView;
    room: Home.Room;
    actorInfo: ActorInfo;
}


interface RoomMenberStat {
    actorInfo: ActorInfo;
}


/**
 * ルームメンバー
 */
export default class RoomMemberComponent extends React.Component<RoomMemberProp, RoomMenberStat>{


    /**
     * コンストラクタ
     * @param props
     * @param context
     */
    constructor(props?: RoomMemberProp, context?: any) {
        super(props, context);

        this.state = {
            actorInfo: this.props.actorInfo,
        };
    }


    render() {

        let isUser = this.state.actorInfo.isUser;
        let icon = (isUser ? "person" : "account_box");
        let dispName = this.state.actorInfo.name;
        return (
            <div className='sbj-home-instance-room-member' draggable={true} onDragStart={this.onDragStart.bind(this)}>
                {dispName}
            </div>
        );
    }

    /**
     * 
     * @param ev 
     */
    private onDragStart(ev: DragEvent) {
        //  自身のドラックアイテムと認識させる為にURLを設定
        ev.dataTransfer.setData("text", location.href);
        this.props.view.SetDragItem(DragItemType.Member, this);
    }
}