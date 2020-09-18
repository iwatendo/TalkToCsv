import AbstractIndexedDB from "../../Base/AbstractIndexedDB";
import * as DBI from "../../Base/AbstractIndexedDB";
import ImageInfo from "../../Base/Container/ImageInfo";
import { IOrder } from "../../Base/Container/Order";
import StdUtil from "../../Base/Util/StdUtil";
import LocalCache from "../Cache/LocalCache";


export enum ActorType {
    Default = 0,
    Caster = 1,
    Narrator = 2,
    CastNarrator = 3,
}


/**
 * アクター情報（ユーザープロフィール情報）
 */
export class Actor implements IOrder {

    constructor() {
        this.aid = "";
        this.actorType = ActorType.Default;
        this.isUserProfile = false;
        this.isUsing = false;
        this.name = "";
        this.tag = "";
        this.profile = "";
        this.dispIid = "";
        this.iconIds = new Array<string>();
        this.guideIds = new Array<string>();
        this.chatBgColor = "";
        this.order = 0;
    }

    aid: string;
    actorType: ActorType;
    isUserProfile: boolean;
    isUsing: boolean;
    name: string;
    tag: string;
    profile: string;
    dispIid: string;
    iconIds: Array<string>;
    guideIds: Array<string>;
    chatBgColor: string;
    order: number;

    /**
     * ハッシュコードを生成
     */
    public static HashCode(act: Actor): string {
        let value = act.name + "/n" + act.tag + "/n" + act.profile + "/n" + act.dispIid;
        return StdUtil.ToHashCode(value).toString();
    }


    /**
     * 
     * @param actType 
     */
    public static IsIconDispChange(actType: ActorType) {
        switch (actType) {
            case ActorType.Caster: return true;
            case ActorType.CastNarrator: return true;
            default: return false;
        }
    }


    /**
     * 
     * @param actType 
     */
    public static IsDispSubtitles(actType: ActorType) {
        switch (actType) {
            case ActorType.Narrator: return true;
            case ActorType.CastNarrator: return true;
            default: return false;
        }
    }

}


/**
 * アイコン
 */
export class Icon implements IOrder {

    constructor() {
        this.iid = "";
        this.order = 0;
        this.img = new ImageInfo();
        this.dispratio = 0;
        this.voicecode = "";
        this.msgcolor = "";
        this.msgbackcolor = "";
    }

    iid: string;
    order: number;
    img: ImageInfo;
    dispratio: number;
    voicecode: string;
    msgcolor: string;
    msgbackcolor: string;

    /**
     * データコピー(※Shallow Copy)
     * @param icon 
     */
    public static Copy(icon: Icon): Icon {
        let result = new Icon();
        result.iid = icon.iid;
        result.order = icon.order;
        result.img = ImageInfo.Copy(icon.img);
        result.dispratio = icon.dispratio;
        result.voicecode = icon.voicecode;
        result.msgcolor = icon.msgcolor;
        result.msgbackcolor = icon.msgbackcolor;
        return result;
    }


    /**
     * データ比較
     * @param icon1 
     * @param icon2 
     */
    public static Equlas(icon1: Icon, icon2: Icon): boolean {
        if (icon1 || icon2) {
            if (icon1.dispratio === icon2.dispratio
                && icon1.voicecode === icon2.voicecode
                && icon1.msgcolor === icon2.msgcolor
                && icon1.msgbackcolor === icon2.msgbackcolor
                && ImageInfo.Equals(icon1.img, icon2.img)) {
                return true;
            }
            else {
                return false;
            }
        }
        else {
            return false;
        }
    }

}


/**
 * ガイド情報
 */
export class Guide implements IOrder {

    constructor() {
        this.gid = "";
        this.aid = "";
        this.iid = "";
        this.order = 0;
        this.matchoption = 0;
        this.rescheckoption = 0;
        this.keyword = "";
        this.note = "";
        this.url = "";
        this.embedstatus = "";
    }

    gid: string;
    aid: string;
    iid: string;
    order: number;
    matchoption: number;
    rescheckoption: number;
    img: ImageInfo;
    keyword: string;
    note: string;
    url: string;
    embedstatus: string;
}

export class Data {
    Actors: Array<Actor>;
    Icons: Array<Icon>;
    Guide: Array<Guide>;
}

export class DB extends AbstractIndexedDB<Data> {

    public static NAME = "Personal";
    public static NOTE = "プロフィール／アクター";
    public static ACTOR: string = 'actor';
    public static ICON: string = 'icon';
    public static GUIDE: string = 'guide';


    /**
     * 
     */
    constructor() {
        super(DB.NAME);
        this.SetStoreList(DB.ACTOR);
        this.SetStoreList(DB.ICON);
        this.SetStoreList(DB.GUIDE);
    }

    public GetName(): string { return DB.NAME; }
    public GetNote(): string { return DB.NOTE; }


    public ReadAllData(onload: DBI.OnLoadComplete<Data>) {
        let data = new Data();
        this.ReadAll<Actor>(DB.ACTOR, (result: Array<Actor>) => {
            data.Actors = result;
            this.ReadAll<Icon>(DB.ICON, (result: Array<Icon>) => {
                data.Icons = result;
                this.ReadAll<Guide>(DB.GUIDE, (result: Array<Guide>) => {
                    data.Guide = result;
                    onload(data);
                });
            });
        });
    }


    /**
     * 
     * @param data 
     * @param callback 
     */
    public WriteAllData(data: Data, callback: DBI.OnWriteComplete) {
        this.WriteAll<Actor>(DB.ACTOR, (n) => n.aid, data.Actors, () => {
            this.WriteAll<Icon>(DB.ICON, (n) => n.iid, data.Icons, () => {
                this.WriteAll<Guide>(DB.GUIDE, (n) => n.gid, data.Guide, () => {
                    callback();
                });
            });
        });
    }


    public IsImportMatch(preData: any): boolean {

        let data: Data = preData;
        if (data.Actors && data.Actors.length > 0) return true;
        if (data.Icons && data.Icons.length > 0) return true;

        return false;
    }


    /**
     * インポート処理
     * @param data 
     * @param callback 
     */
    public Import(data: Data, callback: DBI.OnWriteComplete) {

        this.ClearAll(DB.ACTOR, () => {
            this.ClearAll(DB.ICON, () => {
                this.ClearAll(DB.GUIDE, () => {
                    if (!this.IsMyData(data)) {
                        this.ResetId(data);
                    }
                    this.WriteAllData(data, callback);
                });
            });
        });
    }


    /**
     * 自分自身のデータか？
     * @param data 
     */
    public IsMyData(data: Data) {
        let list = data.Actors.filter((a) => a.isUserProfile);
        if (list.length === 1) {
            let user = list[0];
            if (user.aid === LocalCache.UserID) {
                return true;
            }
        }
        return false;
    }


    /**
     * 自分自身のデータでは無い場合
     * ID重複を防ぐ為、全IDを変更する
     * @param data 
     */
    public ResetId(data: Data) {

        let aidMap = new Map<string, string>();
        let iidMap = new Map<string, string>();
        let gidMap = new Map<string, string>();

        data.Actors.forEach((a) => {
            if (a.isUserProfile) {
                aidMap.set(a.aid, LocalCache.UserID);
            }
            else {
                aidMap.set(a.aid, StdUtil.CreateUuid());
            }
        });
        data.Icons.forEach((i) => { iidMap.set(i.iid, StdUtil.CreateUuid()); });
        data.Guide.forEach((g) => { gidMap.set(g.gid, StdUtil.CreateUuid()); });

        data.Actors.forEach((a) => {
            //
            a.aid = aidMap.get(a.aid);
            a.dispIid = iidMap.get(a.dispIid);
            //
            let newIconIds = new Array<string>();
            if (a.iconIds) {
                a.iconIds.forEach((iid) => { newIconIds.push(iidMap.get(iid)); });
            }
            a.iconIds = newIconIds;
            //
            let newGuideIds = new Array<string>();
            if (a.guideIds) {
                a.guideIds.forEach((gid) => { newGuideIds.push(gidMap.get(gid)); });
            }
            a.guideIds = newGuideIds;
        });

        data.Icons.forEach((i) => { i.iid = iidMap.get(i.iid); });

        data.Guide.forEach((g) => {
            g.gid = gidMap.get(g.gid);
            g.aid = aidMap.get(g.aid);
            g.iid = iidMap.get(g.iid);
        });
    }

}
