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
    public static set BootChatOwnerPeerID(val: string) { localStorage.setItem('home-instance-id', val); }
    public static get BootChatOwnerPeerID(): string { return localStorage.getItem('home-instance-id'); }

    /**
     * 起動しているインスタンスのKeyID
     */
    public static set FixedConnectionPeerID(val: string) { localStorage.setItem('fixed-connection-id', val); }
    public static get FixedConnectionPeerID(): string { return localStorage.getItem('fixed-connection-id'); }

    /**
     * 起動しているインスタンスのKeyID
     */
    public static set FixedConnectionKey(val: string) { localStorage.setItem('fixed-connection-key', val); }
    public static get FixedConnectionKey(): string { return localStorage.getItem('fixed-connection-key'); }

    /**
     *  パーミッションの確認有無
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
