
import * as Personal from "../../../Contents/IndexedDB/Personal";
import HomeVisitorController from "../HomeVisitorController";
import GetIconSender from "../../../Contents/Sender/GetIconSender";


export default class IconCache {

    //
    private _controller: HomeVisitorController;


    //  PeerID / Iid / Icon
    private _iconCache = new Map<string, Map<string, Personal.Icon>>();


    /**
     * コンストラクタ
     * @param controller 
     */
    public constructor(controller: HomeVisitorController) {
        this._controller = controller;
    }


    /**
     * アイコンデータの取得
     * @param peerid 
     * @param iid 
     */
    public GetIcon(peerid: string, iid: string) {
        let iids = new Array<string>();
        iids.push(iid);
        this.GetIcons(peerid, iids);
    }



    /**
     * アイコンデータ（複数件）の取得
     * @param peerid 
     * @param iids 
     */
    public GetIcons(peerid: string, iids: Array<string>) {

        //  自身のアイコンの場合は、IndexedDBから取得
        if (this._controller.PeerId === peerid) {
            iids.forEach((iid) => {
                this._controller.Model.GetIcon(iid, (icon) => {
                    this._controller.View.SetIconCss(icon);
                });
            });
        }
        else {

            iids.forEach((iid) => {

                if (!iid)
                    return;

                if (this._iconCache.has(peerid)) {

                    let iconMap = this._iconCache.get(peerid);

                    if (iconMap.has(iid)) {
                        //  キャッシュ済みの場合、キャッシュされていたアイコンを表示
                        let icon = iconMap.get(iid);
                        this._controller.View.SetIconCss(icon);
                        return;
                    }
                }

                //  キャッシュされていない場合は
                //  発言者にIconデータを要求
                this.GetOtherUserIcon(peerid, iid);
            });
        }
    }


    /**
     * 他ユーザーへのアイコン要求
     * @param peerid 
     * @param iids 
     */
    private GetOtherUserIcon(peerid: string, iid: string) {

        //  Room内に居ないメンバー(PeerIDで判定)の場合、アイコン取得しない
        if (!this._controller.RoomCache.IsInPeer(peerid)) {
            return;
        }

        let sender = new GetIconSender();
        sender.iid = iid;
        //  他ユーザーへアイコン要求

        this._controller.SwPeer.SendTo(peerid, sender);
    }


    /**
     * 他ユーザーからのアイコン受信
     * @param peerid 
     * @param icon 
     */
    public SetOtherUserIcon(peerid: string, icon: Personal.Icon) {

        //  キャッシュ登録
        if (!this._iconCache.has(peerid)) {
            this._iconCache.set(peerid, (new Map<string, Personal.Icon>()));
        }
        let map = this._iconCache.get(peerid);
        map.set(icon.iid, icon);

        //  タイムラインへのアイコン表示
        this._controller.View.SetIconCss(icon);
    }

}
