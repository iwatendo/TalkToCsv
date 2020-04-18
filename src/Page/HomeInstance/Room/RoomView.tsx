import * as React from 'react';
import * as ReactDOM from 'react-dom';

import * as Personal from "../../../Contents/IndexedDB/Personal";
import * as Home from "../../../Contents/IndexedDB/Home";

import StdUtil from "../../../Base/Util/StdUtil";
import ImageInfo from "../../../Base/Container/ImageInfo";
import { Order } from "../../../Base/Container/Order";

import HomeInstanceController from "../HomeInstanceController";

import { RoomItemComponent } from "./RoomItemComponent";
import RoomMemberComponent from "./RoomMemberComponent";
import RoomComponent from "./RoomComponent";
import LogUtil from "../../../Base/Util/LogUtil";
import ActorInfo from '../../../Contents/Struct/ActorInfo';


/**
 * 
 */
export class RoomActors {
    room: Home.Room;
    actorInfos: Array<ActorInfo>;
}

export enum DragItemType {
    Room = 0,
    Member = 1,
}



export class RoomView {

    private _controller: HomeInstanceController;
    private _element: HTMLElement;
    private _roomActors: Array<RoomActors>;


    public get Controller(): HomeInstanceController {
        return this._controller;
    }

    /**
     * コンストラクタ
     * @param controller 
     * @param element 
     * @param rooms 
     */
    public constructor(controller: HomeInstanceController, element: HTMLElement, rooms: Array<Home.Room>) {
        this._controller = controller;
        this._element = element;
        this._roomActors = new Array<RoomActors>();

        Order.Sort(rooms);

        rooms.map((room) => {
            let ra = new RoomActors();
            ra.room = room;
            ra.actorInfos = new Array<ActorInfo>();
            this._roomActors.push(ra);
        });

        this.Create();
    }


    /**
     * 生成処理（描画処理）
     */
    public Create() {
        let key = StdUtil.UniqKey();
        ReactDOM.render(<RoomComponent key={key} view={this} roomActors={this._roomActors} />, this._element, () => {
            this._roomActors.forEach((ra) => {
                ImageInfo.SetCss(ra.room.hid, ra.room.background);
            });
        });
    }


    /**
     * ルーム情報の更新
     */
    public ChangeRoomInfo(rooms: Array<Home.Room>) {

        rooms.forEach((curRoom) => {

            let pres = this._roomActors.filter((ra) => ra.room.hid === curRoom.hid);
            if (pres.length > 0) {

                let pre = pres[0];
                let preRoom = pre.room;

                //  名前か画像が変更された場合、接続クライアントに通知する
                if (preRoom.name !== curRoom.name || !ImageInfo.Equals(preRoom.background, curRoom.background)) {
                    this.Controller.SendChnageRoom(curRoom);
                }

                pre.room = curRoom;
            }
            else {
                //  新しく追加された部屋の追加
                let ra = new RoomActors();
                ra.room = curRoom;
                ra.actorInfos = new Array<ActorInfo>();
                this._roomActors.push(ra);
            }

        });

        this.Create();
    }


    /**
     * ルーム情報の削除
     * @param hid 
     */
    public DeleteRoom(room: Home.Room) {

        this._roomActors = this._roomActors.filter((ra) => ra.room.hid !== room.hid);
        this.Controller.Model.DeleteRoom(room, () => {
            this.Create();
        });
    }

    /**
     * ルームメンバーの変更
     * @param hid 
     * @param roomMember 
     */
    public ChangeRoomMember(hid: string, roomMember: Array<ActorInfo>) {
        let ras = this._roomActors.filter(n => n.room.hid === hid);
        if (ras.length > 0) {
            ras[0].actorInfos = roomMember;
            this.Create();
        }
    }


    private _dragItemType: DragItemType;

    private _dragitem: RoomMemberComponent | RoomItemComponent;


    /**
     * 
     * @param item 
     */
    public SetDragItem(itemType: DragItemType, item: RoomMemberComponent | RoomItemComponent) {
        this._dragItemType = itemType;
        this._dragitem = item;
    }


    /**
     * 
     * @param targetRoom 
     */
    public DragItem(targetRoom: RoomItemComponent) {

        if (this._dragItemType === DragItemType.Member) {
            //  メンバーのドラック＆ドロップ時
            let memberComponent = this._dragitem as RoomMemberComponent;
            let peerid = memberComponent.props.actorInfo.peerid;
            let aid = memberComponent.props.actorInfo.aid;
            let preHid = this._dragitem.props.room.hid;
            let newHid = targetRoom.props.room.hid;

            if (preHid !== newHid) {

                //  変更通知
                this.Controller.Manager.Room.MoveRoom(peerid, aid, newHid, preHid);

                //  表示
                this.ChangeRoomMember(preHid, this.Controller.Manager.Room.GetRoomInActors(preHid));
                this.ChangeRoomMember(newHid, this.Controller.Manager.Room.GetRoomInActors(newHid));
            }
        }

        if (this._dragItemType === DragItemType.Room) {
            //  ルームのドラック＆ドロップ時は、部屋を並び替える
            let roomComponent = this._dragitem as RoomItemComponent;
            try {
                let dragRoom = roomComponent.props.room;    //  移動元
                let dropRoom = targetRoom.props.room;       //  移動先

                if (dragRoom && dragRoom.hid) {
                    this.ChangeRoomOrder(dragRoom, dropRoom);
                }

            } catch (e) {
                LogUtil.Warning(this._controller, e);
            }
        }
    }


    /**
     * 部屋の並び順を変更
     * @param dragRoom 
     * @param dropRoom 
     */
    private ChangeRoomOrder(dragRoom: Home.Room, dropRoom: Home.Room) {

        let rooms = new Array<Home.Room>();
        let raMap = new Map<string, RoomActors>();

        this._roomActors.forEach((ra) => {
            rooms.push(ra.room);
            raMap.set(ra.room.hid, ra);
        })

        let newList = Order.Swap(rooms, dragRoom, dropRoom);

        Order.Sort(rooms);

        let newDispList = new Array<RoomActors>();
        rooms.forEach((room) => {
            this._controller.Model.UpdateRoom(room);
            let roomActor = raMap.get(room.hid);
            roomActor.room = room;
            newDispList.push(roomActor);
        });

        this._roomActors = newDispList;
        this.Create();
    }

}
