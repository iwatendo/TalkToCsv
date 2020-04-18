import AbstractIndexedDB from "../../Base/AbstractIndexedDB";
import * as DBI from "../../Base/AbstractIndexedDB";
import ImageInfo from "../../Base/Container/ImageInfo";
import { IOrder } from "../../Base/Container/Order";


export class Room implements IOrder {
    hid: string;
    name: string;
    tag: string;
    note: string;
    isDefault: boolean;
    order: number;
    background: ImageInfo;

    constructor() {
        this.hid = "";
        this.name = "";
        this.tag = "";
        this.note = "";
        this.isDefault = false;
        this.order = 0;
        this.background = new ImageInfo();
    }
    
}


export class Data {
    Rooms: Array<Room>;
}


export class DB extends AbstractIndexedDB<Data> {

    public static NAME = "Home";
    public static NOTE = "ルーム";
    public static ROOM: string = 'room';

    constructor() {
        super(DB.NAME);
        this.SetStoreList(DB.ROOM);
    }

    public GetName(): string { return DB.NAME; }
    public GetNote(): string { return DB.NOTE; }

    public ReadAllData(onload: DBI.OnLoadComplete<Data>) {

        let data = new Data();

        this.ReadAll<Room>(DB.ROOM, (result: Array<Room>) => {
            data.Rooms = result;
            onload(data);
        });
    }


    public WriteAllData(data: Data, callback: DBI.OnWriteComplete) {
        this.WriteAll<Room>(DB.ROOM, (n) => n.hid, data.Rooms, () => {
            callback();
        });
    }


    public IsImportMatch(preData: any): boolean {

        let data: Data = preData;
        if (data.Rooms && data.Rooms.length > 0) return true;

        return false;
    }


    public Import(data: Data, callback: DBI.OnWriteComplete) {

        this.ClearAll(DB.ROOM, () => {
            this.WriteAllData(data, callback);
        });

    }

}
