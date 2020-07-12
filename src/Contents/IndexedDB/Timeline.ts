import AbstractIndexedDB from "../../Base/AbstractIndexedDB";
import * as DBI from "../../Base/AbstractIndexedDB";


export class Message {
    mid: string;
    hid: string;
    aid: string;
    peerid: string;
    iid: string;
    gid: string;
    name: string;
    text: string;
    ctime: number;
    utime: number;
    visible: boolean;
    speech: boolean;
    voiceRecog: boolean;    
}

export class Data {
    Messages: Array<Message>;
}

export class DB extends AbstractIndexedDB<Data> {

    public static NAME = "Timeline";
    public static NOTE = "タイムライン";
    public static Message: string = 'message';

    constructor() {
        super(DB.NAME);
        this.SetStoreList(DB.Message);
    }

    public GetName(): string { return DB.NAME; }
    public GetNote(): string { return DB.NOTE; }

    public ReadAllData(onload: DBI.OnLoadComplete<Data>) {

        let data = new Data();

        this.ReadAll<Message>(DB.Message, (result: Array<Message>) => {
            data.Messages = result;
            onload(data);
        });
    }

    public WriteAllData(data: Data, callback: DBI.OnWriteComplete) {

        this.WriteAll<Message>(DB.Message, (n) => n.mid, data.Messages, () => {
            callback();
        });
    }


    public IsImportMatch(preData: any): boolean {

        let data: Data = preData;
        if (data.Messages && data.Messages.length > 0) return true;

        return false;

    }


    public Import(data: Data, callback: DBI.OnWriteComplete) {

        this.ClearAll(DB.Message, () => {
            this.WriteAllData(data, callback);
        });

    }

}
