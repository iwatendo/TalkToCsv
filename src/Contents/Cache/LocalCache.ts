import StdUtil from "../../Base/Util/StdUtil";
import Sender from "../../Base/Container/Sender";

export interface OnSetVoiceChatOptions { (option: VoiceChatOptions): void };
export interface OnSetLiveCastOptions { (option: LiveCastOptions): void };
export interface OnSetScreenShareOptions { (option: ScreenShareOptions): void };
export interface OnSetGadgetCastOptions { (option: GadgetCastOptions): void };

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
    public static set BootHomeInstancePeerID(val: string) { localStorage.setItem('home-instance-id', val); }
    public static get BootHomeInstancePeerID(): string { return localStorage.getItem('home-instance-id'); }


    /**
     *  起動しているインスタンスのPeerID
     */
    public static set IsCheckDevicePermision(val: boolean) { localStorage.setItem('checked-device-permision', (val ? "True" : "")); }
    public static get IsCheckDevicePermision(): boolean { return localStorage.getItem('checked-device-permision') === "True" }


    /**
     *  ボイスチャットのオプション設定
     */
    public static get VoiceChatOptions(): VoiceChatOptions {
        let value = localStorage.getItem('voice-chat-options');
        return (value ? JSON.parse(value) as VoiceChatOptions : new VoiceChatOptions());
    }
    public static SetVoiceChatOptions(setoptions: OnSetVoiceChatOptions) {
        let options = this.VoiceChatOptions;
        setoptions(options);
        localStorage.setItem('voice-chat-options', JSON.stringify(options));
    }


    /**
     *  ライブキャストのオプション設定
     */
    public static get LiveCastOptions(): LiveCastOptions {
        let value = localStorage.getItem('live-cast-options');
        return (value ? JSON.parse(value) as LiveCastOptions : new LiveCastOptions());
    }
    public static SetLiveCastOptions(setoptions: OnSetLiveCastOptions) {
        let options = this.LiveCastOptions;
        setoptions(options);
        localStorage.setItem('live-cast-options', JSON.stringify(options));
    }


    /**
     *  スクリーンシェアのオプション設定
     */
    public static get ScreenShareOptions(): ScreenShareOptions {
        let value = localStorage.getItem('screen-share-options');
        return (value ? JSON.parse(value) as ScreenShareOptions : new ScreenShareOptions());
    }
    public static SetScreenShareOptions(setoptions: OnSetScreenShareOptions) {
        let options = this.ScreenShareOptions;
        setoptions(options);
        localStorage.setItem('screen-share-options', JSON.stringify(options));
    }


    /**
     *  ガジェットキャストのオプション設定
     */
    public static get GadgetCastOptions(): GadgetCastOptions {
        let value = localStorage.getItem('gadget-cast-options');
        return (value ? JSON.parse(value) as GadgetCastOptions : new GadgetCastOptions());
    }
    public static SetGadgetCastOptions(setoptions: OnSetGadgetCastOptions) {
        let options = this.GadgetCastOptions;
        setoptions(options);
        localStorage.setItem('gadget-cast-options', JSON.stringify(options));
    }


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


    /**
     * アクター変更のショートカットキーのモード
     */
    public static set ActorChangeKeyMode(val: number) {
        localStorage.setItem('actor-change-keymode', val.toString());
    }
    public static get ActorChangeKeyMode(): number {
        let value = localStorage.getItem('actor-change-keymode');
        return (value ? Number.parseInt(value) : 0);
    }

    //  音声認識時の振舞い設定
    public static set VoiceRecognitionMode(val: number) {
        localStorage.setItem('voice-recognition-mode', val.toString());
    }
    public static get VoiceRecognitionMode(): number {
        let value = localStorage.getItem('voice-recognition-mode');
        //  デフォルト値は「直接チャットメッセージとして送信」とする
        return (value ? Number.parseInt(value) : 1);
    }

    //  チャットメッセージ送信時の動作
    public static set ChatMessageCopyMode(val: number) {
        localStorage.setItem('chat-message-copy-mode', val.toString());
    }
    public static get ChatMessageCopyMode(): number {
        let value = localStorage.getItem('chat-message-copy-mode');
        return (value ? Number.parseInt(value) : 0);
    }

    //  アクター機能の使用有無
    public static set UseActors(val: boolean) {
        localStorage.setItem('use-actors', (val ? "1" : "0"));
    }
    public static get UseActors(): boolean {
        let value = localStorage.getItem('use-actors');
        return (value === "1");
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


/**
 * オプション設定の保持：ボイスチャット
 */
export class VoiceChatOptions {
    SelectMic: string;
}


/**
 * オプション設定の保持：ライブキャスト
 */
export class LiveCastOptions {
    SelectMic: string;
    SelectCam: string;
}


/**
 * オプション設定の保持：スクリーンシェア
 */
export class ScreenShareOptions {
    constructor() {
        this.FrameRage = 15;
        this.Resolution = 1;
    }
    Resolution: number;
    FrameRage: number;
}


/**
 * ガジェットキャスト時のオプション設定
 */
export class GadgetCastOptions {
}

