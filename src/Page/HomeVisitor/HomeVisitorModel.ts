
import * as Personal from "../../Contents/IndexedDB/Personal";

import AbstractServiceModel, { OnModelLoad, OnRead, OnWrite } from "../../Base/AbstractServiceModel";

import HomeVisitorController from "./HomeVisitorController";
import StdUtil from "../../Base/Util/StdUtil";
import ImageInfo from "../../Base/Container/ImageInfo";
import LocalCache from "../../Contents/Cache/LocalCache";


export default class HomeVisitorModel extends AbstractServiceModel<HomeVisitorController> {

    private _personalDB: Personal.DB;

    /**
     * 初期化処理
     * @param callback 
     */
    protected Initialize(callback: OnModelLoad) {

        this._personalDB = new Personal.DB();

        this._personalDB.Connect(() => {
            callback();
        });
    }


    /**
      * 
      */
    public CreateDefaultData(callback: OnWrite) {

        //  デフォルトアイコン
        let icon = new Personal.Icon;
        icon.iid = StdUtil.CreateUuid();
        icon.img = new ImageInfo();
        icon.dispratio = 8;
        icon.img.src = "/image/default-icon.png";

        //  デフォルトユーザー
        let user = new Personal.Actor();
        user.aid = LocalCache.UserID;
        user.name = "名前未設定";
        user.tag = "";
        user.isUserProfile = true;
        user.profile = "";
        user.iconIds.push(icon.iid);
        user.dispIid = icon.iid;

        this.UpdateActor(user, () => {
            this.UpdateIcon(icon, () => {
                callback();
            });
        });
    }

    /**
     * プロフィール情報取得
     * @param callback 
     */
    public GetUserProfile(callback: OnRead<Personal.Actor>) {

        this._personalDB.ReadAll(Personal.DB.ACTOR, (actors: Array<Personal.Actor>) => {

            let result: Personal.Actor;
            let list = actors.filter(n => n.isUserProfile);

            if (list && list.length > 0) {
                result = list[0];
            }

            callback(result);
        });
    }


    /**
     * アクター情報の取得
     * @param aid 
     * @param callback 
     */
    public GetActor(aid: string, callback: OnRead<Personal.Actor>) {
        this._personalDB.Read(Personal.DB.ACTOR, aid, callback);
    }

    /**
     * アクター情報の更新
     * @param actor 
     */
    public UpdateActor(actor: Personal.Actor, callback: OnWrite = null) {
        this._personalDB.Write<Personal.Actor>(Personal.DB.ACTOR, actor.aid, actor, callback);
    }

    /**
     * アクター情報を全て取得
     * @param callback 
     */
    public GetActors(callback: OnRead<Array<Personal.Actor>>) {
        this._personalDB.ReadAll(Personal.DB.ACTOR, callback);
    }


    /**
     * アイコンの更新
     * @param icon 
     * @param callback 
     */
    public UpdateIcon(icon: Personal.Icon, callback: OnWrite = null) {
        this._personalDB.Write<Personal.Icon>(Personal.DB.ICON, icon.iid, icon, () => {
            if (callback) {
                callback();
            }
        });
    }


    /**
     * アイコン情報を全て取得
     * @param callback 
     */
    public GetIcons(callback: OnRead<Array<Personal.Icon>>) {
        this._personalDB.ReadAll(Personal.DB.ICON, callback);
    }


    /**
     * アイコン情報の取得
     * @param iid 
     * @param callback 
     */
    public GetIcon(iid: string, callback: OnRead<Personal.Icon>) {
        this._personalDB.Read(Personal.DB.ICON, iid, callback);
    }


    /**
     * 指定されたAIDのアイコンリストを取得します
     * @param pid 
     * @param OnRead 
     */
    public GetIconList(actor: Personal.Actor, callback: OnRead<Array<Personal.Icon>>) {

        if (actor === null) {
            return;
        }
        let result = new Array<Personal.Icon>();

        let icons = actor.iconIds;
        let loop: number = 0;
        let max: number = icons.length;

        let loopCall = (icon) => {
            result.push(icon);
            loop += 1;
            if (loop < max) {
                this.GetIcon(icons[loop], loopCall);
            }
            else {
                callback(result);
            }
        };

        if (max === 0) {
            callback(result);
        }
        else {
            this.GetIcon(icons[0], loopCall)
        }
    }


    /**
     * ガイド情報の取得
     * @param gid 
     * @param callback 
     */
    public GetGuide(gid: string, callback: OnRead<Personal.Guide>) {
        this._personalDB.Read(Personal.DB.GUIDE, gid, callback);
    }


}
