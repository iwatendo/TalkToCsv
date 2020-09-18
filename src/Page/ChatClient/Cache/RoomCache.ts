import * as Home from "../../../Contents/IndexedDB/Home";

import ChatClientController from "../ChatClientController";
import RoomActorMemberSender from "../../../Contents/Sender/RoomActorMemberSender";
import GetRoomSender from "../../../Contents/Sender/GetRoomSender";


interface RoomFunc { (room: Home.Room): void }
interface RoomActorMemberFunc { (ram: RoomActorMemberSender): void }


export default class RoomCache {

    //
    private _controller: ChatClientController;
    //  hid / Room
    private _roomCache = new Map<string, Home.Room>();
    //  hid / RoomActorMember
    private _roomMemberCache = new Map<string, RoomActorMemberSender>();
    //
    private _queue = new Map<string, Array<RoomFunc>>();
    //
    private _nowRooms = new Array<Home.Room>();


    /**
     * コンストラクタ
     * @param controller 
     */
    public constructor(controller: ChatClientController) {
        this._controller = controller;
    }


    /**
     * 処理キューの登録
     * @param key 
     * @param callback 
     */
    private PushQueue(key: string, callback: RoomFunc) {
        if (this._queue.has(key)) {
            this._queue.get(key).push(callback);
        }
        else {
            let ra = new Array<RoomFunc>();
            ra.push(callback);
            this._queue.set(key, ra);
        }
    }


    /**
     * 処理キューが設定されていた場合、実行する
     * @param key 
     */
    private ExecQueue(key: string, room: Home.Room) {
        if (this._queue.has(key)) {
            let queues = this._queue.get(key);
            while (queues.length > 0) {
                let queue = queues.pop();
                queue(room);
            }
        }
    }


    /**
     * ルーム情報をキャッシュ
     * @param peerid 
     * @param room 
     */
    public Set(room: Home.Room) {
        this._roomCache.set(room.hid, room);
        this.ExecQueue(room.hid, room);
    }


    /**
     * ルーム情報の取得
     * @param peerid 
     * @param hid 
     * @param callback 
     */
    public Get(hid: string, callback: RoomFunc) {

        if (this._roomCache.has(hid)) {
            let room = this._roomCache.get(hid);
            callback(room);
        }
        else {
            this.PushQueue(hid, callback);
            let sender = new GetRoomSender(hid);
            this._controller.SwPeer.SendToOwner(sender);
        }
    }


    /**
     * ルームメンバーのキャッシュ
     * @param ram 
     */
    public SetMember(ram: RoomActorMemberSender) {

        //  ルーム毎のメンバー一覧情報の設定or差替え
        this._roomMemberCache.set(ram.hid, ram);

        //  自身のアクターが配置されている部屋のリストを更新
        this._nowRooms = new Array<Home.Room>();
        this._roomMemberCache.forEach((rams, hid) => {
            if (this.ExistRoomMember(rams)) {
                this.Get(hid, (room) => { this._nowRooms.push(room); });
            }
        });
    }

    
    /**
     * 指定した部屋に自身のアクターが配置されているか？
     * @param hid 
     */
    private ExistRoomMember(ram: RoomActorMemberSender): boolean {

        if (ram === null) return false;

        let result = false;
        ram.members.forEach((rm) => {
            this._controller.UseActors.forEach((ua) => {
                if (ua.aid == rm.aid) {
                    result = true;
                }
            });
        });
        return result;
    }


    /**
     * 自分が保持しているアクターが
     * 配置されている部屋の一覧を取得
     */
    public GetRooms(): Array<Home.Room> {
        return this._nowRooms;
    }


    /**
     * ルームメンバーの取得
     * @param hid 
     * @param callback 
     */
    public GetMember(hid: string, callback: RoomActorMemberFunc) {
        if (this._roomMemberCache.has(hid)) {
            let result = this._roomMemberCache.get(hid);
            callback(result);
        }
    }


    /**
     * 指定アクターIDが配置されているRoom情報を取得
     * @param aid 
     * @param callback 
     */
    public GetRoomByActorId(aid: string, callback: RoomFunc) {

        this._roomMemberCache.forEach((rams, hid) => {
            rams.members.forEach((ai) => {
                if (aid === ai.aid) {
                    this.Get(hid, callback);
                    return;
                }
            });
        });
    }


    /**
     * 自身のアクターが所属するルームのメンバーの中で
     * 対応するPeerIDががあるか確認
     * @param peerid 
     */
    public IsInPeer(peerid: string) {

        let result: boolean = false;

        //  自身が使用しているアクター
        let useAps = this._controller.UseActors;

        //  メンバーキャスト
        this._roomMemberCache.forEach((rams, hid) => {

            let hasPeer = false;
            let hasUseAct = false;

            rams.members.forEach((ram) => {
                if (ram.peerid === peerid) {
                    hasPeer = true;
                }

                useAps.forEach((ai) => {
                    if (ai.aid == ram.aid) {
                        hasUseAct = true;
                    }
                });
            });

            if (hasPeer && hasUseAct) {
                result = true;
                return;
            }
        });

        return result;
    }

}