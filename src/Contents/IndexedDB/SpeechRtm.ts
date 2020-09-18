import AbstractIndexedDB from "../../Base/AbstractIndexedDB";
import * as DBI from "../../Base/AbstractIndexedDB";


//  Speech Recongnition Text Modify
export class SpeechRtm {
    order: string;
    targetText: string;
    modifyText: string;
    iconUrl: string;
}

export class Data {
    SpeechRtms: Array<SpeechRtm>;
}

export class DB extends AbstractIndexedDB<Data> {

    public static NAME = "SpeechRtm";
    public static NOTE = "Speech recognition text modify";
    public static SpeechRtm: string = 'SpeechRtm';

    constructor() {
        super(DB.NAME);
        this.SetStoreList(DB.SpeechRtm);
    }

    public GetName(): string { return DB.NAME; }
    public GetNote(): string { return DB.NOTE; }

    public ReadAllData(onload: DBI.OnLoadComplete<Data>) {

        let data = new Data();

        this.ReadAll<SpeechRtm>(DB.SpeechRtm, (result: Array<SpeechRtm>) => {
            data.SpeechRtms = result;
            onload(data);
        });
    }

    public WriteAllData(data: Data, callback: DBI.OnWriteComplete) {

        this.WriteAll<SpeechRtm>(DB.SpeechRtm, (n) => n.order, data.SpeechRtms, () => {
            callback();
        });
    }


    public IsImportMatch(preData: any): boolean {

        let data: Data = preData;
        if (data.SpeechRtms && data.SpeechRtms.length > 0) return true;

        return false;

    }


    public Import(data: Data, callback: DBI.OnWriteComplete) {

        this.ClearAll(DB.SpeechRtm, () => {
            this.WriteAllData(data, callback);
        });

    }

}
