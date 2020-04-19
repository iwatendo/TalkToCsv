
import * as Home from "../../Contents/IndexedDB/Home";
import * as Timeline from "../../Contents/IndexedDB/Timeline";

import StdUtil from "../../Base/Util/StdUtil";
import AbstractServiceModel, { OnModelLoad, OnRead, OnWrite } from "../../Base/AbstractServiceModel";

import GijiLockController from "./GijiLockController";
import ImageInfo from "../../Base/Container/ImageInfo";
import FileUtil from "../../Base/Util/FileUtil";


export default class GijiLockModel extends AbstractServiceModel<GijiLockController> {

    private _homeDB: Home.DB;
    private _timelineDB: Timeline.DB;


    /**
     * 初期化処理
     * @param callback 
     */
    protected Initialize(callback: OnModelLoad) {

        this._homeDB = new Home.DB();
        this._timelineDB = new Timeline.DB();

        this._homeDB.Connect(() => {
            this._timelineDB.Connect(() => {
                this.GetTimelineAll((tlmsgs) => {
                    this.Controller
                    callback();
                });
            });
        });
    }


    /**
     * 
     */
    public CreateDefaultData(callback: OnWrite) {

        //
        let room1 = new Home.Room();
        room1.name = "チャットルーム１（エントランス）";
        room1.hid = StdUtil.CreateUuid();
        room1.order = 1;
        room1.tag = "Default";
        room1.note = "接続したメンバーが最初に配置される部屋です";
        room1.isDefault = true;
        room1.background = new ImageInfo();
        //  room1.background.src = "/image/default-room1.jpg";

        //  
        let room2 = new Home.Room();
        room2.name = "チャットルーム２";
        room2.hid = StdUtil.CreateUuid();
        room2.order = 2;
        room2.tag = "Default";
        room2.note = "チャットルームインスタンスのオーナーの操作で入れる部屋です";
        room2.isDefault = false;
        room2.background = new ImageInfo();
        //  room2.background.src = "/image/default-room2.jpg";

        this.UpdateRoom(room1, () => {
            this.UpdateRoom(room2, () => {
                callback();
            });
        });
    }

    /**
     * 部屋情報の取得
     * @param hid 
     * @param callback 
     */
    public GetRoom(hid: string, callback: OnRead<Home.Room>) {
        this._homeDB.Read(Home.DB.ROOM, hid, callback);
    }


    /**
     * 部屋情報の取得
     * @param callback 
     */
    public GetRooms(callback: OnRead<Array<Home.Room>>) {
        this._homeDB.ReadAll(Home.DB.ROOM, callback);
    }


    /**
     * ルーム情報の書込み
     * @param room 
     * @param callback 
     */
    public UpdateRoom(room: Home.Room, callback: OnWrite = null) {
        this._homeDB.Write<Home.Room>(Home.DB.ROOM, room.hid, room, callback);
    }


    /**
     * ルーム情報の削除
     * @param room 
     * @param callback 
     */
    public DeleteRoom(room: Home.Room, callback: OnWrite = null) {
        this._homeDB.Delete<Home.Room>(Home.DB.ROOM, room.hid, callback);
    }


    /**
     * タイムラインメッセージの全文取得
     * @param callback 
     */
    public GetTimelineAll(callback: OnRead<Array<Timeline.Message>>) {
        this._timelineDB.ReadAll(Timeline.DB.Message, callback);
    }

    /**
     * タイムラインメッセージの更新（追加）
     * @param msg 
     * @param callback 
     */
    public UpdateTimelineMessage(msg: Timeline.Message, callback: OnWrite) {

        let key = msg.mid;
        this._timelineDB.Write(Timeline.DB.Message, key, msg, callback);
    }

    /**
     * タイムラインのクリア処理
     * @param callback 
     */
    public ClearTimeline(callback: OnWrite) {

        if (window.confirm('タイムラインのメッセージを全て削除します。\nよろしいですか？')) {
            this._timelineDB.ClearAll(Timeline.DB.Message, callback);
        }

    }

    public ExportTimeline() {
        this._timelineDB.ReadAllData((timeline) => {
            this._homeDB.ReadAllData((home) => {
                let result = this.ToPlainText(timeline.Messages, home.Rooms);
                let filename = FileUtil.GetDefaultFileName("gijilock", "txt");
                FileUtil.Export(filename, result);
            });
        });
    }


    /**
     * 
     * @param msgs 
     */
    private ToPlainText(msgs: Array<Timeline.Message>, rooms: Array<Home.Room>): string {

        let result = new String();

        //  部屋情報をMAPにする
        let roomMap = new Map<string, Home.Room>();
        rooms.forEach((room) => { roomMap.set(room.hid, room); });

        //  メッセージを時間順にソート
        msgs.sort((a, b) => (a.ctime > b.ctime ? 1 : -1));

        //  メッセージループ
        msgs.forEach((msg) => {
            if (msg.visible) {
                let time = StdUtil.ToDispDate(new Date(msg.ctime));
                let room = (roomMap.has(msg.hid) ? roomMap.get(msg.hid).name : "");
                let name = msg.name;
                let text = msg.text;
                result += time;
                result += ",";
                result += name;
                result += ",";
                result += text;
                result += "\r\n";
            }
        });

        return result.toString();
    }

}
