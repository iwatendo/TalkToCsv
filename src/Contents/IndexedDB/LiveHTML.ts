import AbstractIndexedDB from "../../Base/AbstractIndexedDB";
import * as DBI from "../../Base/AbstractIndexedDB";
import LinkUtil from "../../Base/Util/LinkUtil";


export enum CtrlLayerEnum {
    Overlay = 1,
    Show = 2,
    Hide = 3,
}


export class EmbedPage {

    constructor() {
        this.pageId = "";
        this.pageName = "";
        this.pageTag = "";
        this.callWord = "";
        this.ctrlLayerMode = CtrlLayerEnum.Overlay;
        this.isAspectFix = false;
        this.aspectW = 0;
        this.aspectH = 0;
        this.layerBackgroundB = "";
        this.layerBackgroundF = "";
        this.layerActive = "";
        this.layerControl = "";
    }

    public pageId: string;
    public pageName: string;
    public pageTag: string;
    public callWord: string;
    public ctrlLayerMode: CtrlLayerEnum;
    public isAspectFix: boolean;
    public aspectW: number;
    public aspectH: number;
    public layerBackgroundB: string;
    public layerBackgroundF: string;
    public layerActive: string;
    public layerControl: string;


    public static HasCtrl(ps: EmbedPage): boolean {
        if (ps && ps.layerControl && ps.layerControl.length > 0) {
            return true;
        }
        else {
            return false;
        }
    }


    public static ReplasePeerId(html: string, peerid: string): string {
        if (html && html.length > 0) {
            return html.replace("{key}", LinkUtil.OneTimeKey).replace("{peer}", peerid);
        }
        else {
            return html;
        }
    }
}

export class Data {
    Pages: Array<EmbedPage>;
}

export class DB extends AbstractIndexedDB<Data> {

    public static NAME = "LiveHTML";
    public static NOTE = "LiveHTML";
    public static EmbedPage: string = 'EmbedPage';

    constructor() {
        super(DB.NAME);
        this.SetStoreList(DB.EmbedPage);
    }

    public GetName(): string { return DB.NAME; }
    public GetNote(): string { return DB.NOTE; }

    public ReadAllData(onload: DBI.OnLoadComplete<Data>) {

        let data = new Data();

        this.ReadAll<EmbedPage>(DB.EmbedPage, (result: Array<EmbedPage>) => {
            data.Pages = result;
            onload(data);
        });
    }

    public WriteAllData(data: Data, callback: DBI.OnWriteComplete) {

        this.WriteAll<EmbedPage>(DB.EmbedPage, (n) => n.pageId, data.Pages, () => {
            callback();
        });
    }


    public IsImportMatch(preData: any): boolean {
        let data: Data = preData;
        if (data.Pages && data.Pages.length > 0) return true;

        return false;
    }


    public Import(data: Data, callback: DBI.OnWriteComplete) {
        this.ClearAll(DB.EmbedPage, () => {
            this.WriteAllData(data, callback);
        });
    }

}
