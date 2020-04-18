import * as React from 'react';
import * as ReactDOM from 'react-dom';

import * as Personal from "../../../Contents/IndexedDB/Personal";
import * as Home from "../../../Contents/IndexedDB/Home";

import StdUtil from "../../../Base/Util/StdUtil";
import LogUtil from "../../../Base/Util/LogUtil";
import { Order } from "../../../Base/Container/Order";
import RoomMemberComponent from "./RoomMemberComponent";
import { RoomView, DragItemType } from "./RoomView";
import RoomComponent from "./RoomComponent";
import ActorInfo from '../../../Contents/Struct/ActorInfo';


/**
 *  * グループ一覧プロパティ
 */
interface RoomItemProp {
    view: RoomView;
    owner: RoomComponent;
    room: Home.Room;
    actorInfos: Array<ActorInfo>;
}


/**
 *  グループメンバーコンポーネント
 */
export class RoomItemComponent extends React.Component<RoomItemProp, any>{


    /**
     * グループリストの描画
     */
    public render() {

        let actorNodes = this.props.actorInfos.map((ai) => {
            let key = ai.aid + ai.name;
            return (<RoomMemberComponent key={key} view={this.props.view} room={this.props.room} actorInfo={ai} />);
        });

        let canDelete = !this.props.room.isDefault && (this.props.actorInfos.length === 0);

        return (
            <div id={this.props.room.hid} className='sbj-home-instance-room-panel mdl-cell mdl-cell--6-col mdl-cell--6-col-tablet mdl-cell--6-col-phone mdl-card mdl-shadow--3dp' draggable={true} onDragStart={this.OnDragStart.bind(this)} onDrop={this.onDrop.bind(this)}>
                <div className="sbj-home-instance-room-header">
                    <span className="sbj-home-instance-room-title">{this.props.room.name}</span>
                    <button className="sbj-home-instance-room-edit-button mdl-button mdl-button--colored" onClick={this.OnEditClick.bind(this)}>
                        <i className='material-icons'>edit</i>
                        &nbsp;編集&nbsp;
                    </button>
                    <button className="sbj-home-instance-room-edit-button mdl-button mdl-button--accent" onClick={this.OnDeleteClick.bind(this)} hidden={!canDelete}>
                        <i className='material-icons'>delete</i>
                        &nbsp;削除&nbsp;
                    </button>
                </div>
                <div className="mdl-card__actions mdl-card--border">
                    {actorNodes}
                </div>
            </div >
        );
    }


    /**
     * アクターのドラッグ開始時
     */
    private OnDragStart(ev: DragEvent) {

        let selectdiv = ev.target as HTMLElement;

        if (selectdiv.classList.contains('sbj-home-instance-room-member')) {
            return;
        }

        let json = JSON.stringify(this.props.room);
        //  自身のドラックアイテムと認識させる為にURLを設定
        ev.dataTransfer.setData("text", location.href);
        this.props.view.SetDragItem(DragItemType.Room, this);
    }


    /**
     * ドロップ時イベント
     * @param ev
     */
    private onDrop(ev: DragEvent) {

        //  自身のドラックアイテムの場合のみ処理を実行
        if (ev.dataTransfer.getData("text") !== location.href) {
            return;
        }

        this.props.view.DragItem(this);
    }

    /**
     * 編集
     * @param event 
     */
    private OnEditClick(event) {
        let room = this.props.room;
        this.props.view.Controller.View.DoShowRoomEditDialog(room.hid);
    }


    /**
     * 編集
     * @param event 
     */
    private OnDeleteClick(event) {
        let room = this.props.room;
        this.DeleteRoom(room.hid);
    }


    /**
     * ルームの削除
     * @param aid 
     */
    public DeleteRoom(hid: string) {
        this.props.view.Controller.Model.GetRoom(hid, (room) => {
            if (room.isDefault) {
                return;
            }
            if (window.confirm('削除したルームは元に戻せません。\n削除してよろしいですか？')) {
                this.props.view.DeleteRoom(room);
            }
        });
    }

}
