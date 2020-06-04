import StdUtil from "../../Base/Util/StdUtil";

/**
 * ローカルストレージに対するデータ操作を行います。
 * このクラスを経由しないローカルストレージの使用は禁止します
 */
export default class LocalCache {

    /**
     *  ユーザーID
     */
    public static get UserID(): string { return StdUtil.UserID; }


    /**
     *  IndexedDBの初期化フラグ
     */
    public static set Initialize(val: boolean) { localStorage.setItem('skybeje-initialize', (val ? "True" : "")) }
    public static get Initialize(): boolean { return localStorage.getItem('skybeje-initialize') === "True" }


    /**
     *  起動しているインスタンスのPeerID
     */
    public static set BootTalkToCsvPeerID(val: string) { localStorage.setItem('home-instance-id', val); }
    public static get BootTalkToCsvPeerID(): string { return localStorage.getItem('home-instance-id'); }


    /**
     *  起動しているインスタンスのPeerID
     */
    public static set IsCheckDevicePermision(val: boolean) { localStorage.setItem('checked-device-permision', (val ? "True" : "")); }
    public static get IsCheckDevicePermision(): boolean { return localStorage.getItem('checked-device-permision') === "True" }


    /**
     * チャット時のEnterの振舞い設定
     */
    public static set ChatEnterMode(val: number) {
        localStorage.setItem('enter-mode', val.toString());
    }
    public static get ChatEnterMode(): number {
        let value = localStorage.getItem('enter-mode');
        return (value ? Number.parseInt(value) : 0);
    }

    //  デバックモード
    public static set DebugMode(val: number) {
        localStorage.setItem('debug-mode', val.toString());
    }
    public static get DebugMode(): number {
        let value = localStorage.getItem('debug-mode');
        return (value ? Number.parseInt(value) : 0);
    }

}
