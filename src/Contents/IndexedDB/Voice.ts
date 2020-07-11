import AbstractIndexedDB from "../../Base/AbstractIndexedDB";
import * as DBI from "../../Base/AbstractIndexedDB";


export class VoiceData {
    mid: string;
}

export class Data {
    Voices: Array<VoiceData>;
}

export class DB extends AbstractIndexedDB<Data> {

    public static NAME = "Voice";
    public static NOTE = "音声";
    public static Voice: string = 'voice';

    constructor() {
        super(DB.NAME);
        this.SetStoreList(DB.Voice);
    }

    public GetName(): string { return DB.NAME; }
    public GetNote(): string { return DB.NOTE; }

    public ReadAllData(onload: DBI.OnLoadComplete<Data>) {

        let data = new Data();

        this.ReadAll<VoiceData>(DB.Voice, (result: Array<VoiceData>) => {
            data.Voices = result;
            onload(data);
        });
    }

    public WriteAllData(data: Data, callback: DBI.OnWriteComplete) {

        this.WriteAll<VoiceData>(DB.Voice, (n) => n.mid, data.Voices, () => {
            callback();
        });
    }


    public IsImportMatch(preData: any): boolean {
        let data: Data = preData;
        if (data.Voices && data.Voices.length > 0) return true;
        return false;
    }


    public Import(data: Data, callback: DBI.OnWriteComplete) {
        this.ClearAll(DB.Voice, () => {
            this.WriteAllData(data, callback);
        });
    }

}
