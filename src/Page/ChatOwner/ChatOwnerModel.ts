
import * as Home from "../../Contents/IndexedDB/Home";
import * as Timeline from "../../Contents/IndexedDB/Timeline";
import * as Voice from "../../Contents/IndexedDB/Voice";

import StdUtil from "../../Base/Util/StdUtil";
import AbstractServiceModel, { OnModelLoad, OnRead, OnWrite } from "../../Base/AbstractServiceModel";

import ChatOwnerController from "./ChatOwnerController";
import ImageInfo from "../../Base/Container/ImageInfo";
import FileUtil from "../../Base/Util/FileUtil";
import AudioBlobSender from "../../Contents/Sender/AudioBlobSender";
import GetAudioBlobSender from "../../Contents/Sender/GetAudioBlobSender";


export default class ChatOwnerModel extends AbstractServiceModel<ChatOwnerController> {

    private _homeDB: Home.DB;
    private _timelineDB: Timeline.DB;
    private _voiceDB: Voice.DB;


    /**
     * 初期化処理
     * @param callback 
     */
    protected Initialize(callback: OnModelLoad) {

        this._homeDB = new Home.DB();
        this._timelineDB = new Timeline.DB();
        this._voiceDB = new Voice.DB();

        this._homeDB.Connect(() => {
            this._timelineDB.Connect(() => {
                this._voiceDB.Connect(() => {
                    this.GetTimelineAll((tlmsgs) => {
                        callback();
                    });
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
     * タイムラインメッセージの取得
     * @param mid 
     * @param callback 
     */
     public GetTimeline(mid:string,callback: OnRead<Timeline.Message>) {
        this._timelineDB.Read(Timeline.DB.Message, mid, callback);
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
            this._voiceDB.ClearAll(Voice.DB.Voice,callback);
        }

    }

    public ExportTimeline() {
        this._timelineDB.ReadAllData((timeline) => {
            this._homeDB.ReadAllData((home) => {
                let result = this.ToPlainText(timeline.Messages, home.Rooms);
                let filename = FileUtil.GetDefaultFileName("", ".csv");
                FileUtil.ExportCsv(filename, result);
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


    /**
     * 音声をIndexedDBに保存
     * @param abs 
     */
    public SaveVoice(abs: AudioBlobSender, callback: OnWrite) {
        this._voiceDB.Write<ArrayBuffer>(Voice.DB.Voice, abs.mid, abs.binary, callback);
    }


    /**
     * 音声をIndexedDBから取得
     * @param key 
     */
    public LoadVoice(key: GetAudioBlobSender, callback: OnRead<AudioBlobSender>) {
        this._voiceDB.Read<ArrayBuffer,string>(Voice.DB.Voice, key.mid, (result)=>{
            let abs = new AudioBlobSender();
            abs.mid = key.mid;
            abs.binary = result;
            callback(abs);
        });
    }

}
