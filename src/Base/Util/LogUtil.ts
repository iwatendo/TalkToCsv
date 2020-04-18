import Sender from "../Container/Sender";
import IServiceController from "../IServiceController";
import LocalCache from "../../Contents/Cache/LocalCache";

export enum LogLevel {
    Info = 0,
    Warning = 1,
    Error = 2,
}


/**
 * ログ出力クラス
 */
export class Log {

    /**
     * コンストラクタ
     * @param msg
     * @param logtype
     */
    constructor(msg: string, logtype: LogLevel = LogLevel.Info) {
        this.Date = Date.now();
        this.Message = msg;
        this.LogType = logtype;
    }

    Date: number;
    Message: string;
    LogType: LogLevel;


    /**
     * 表示用の日付＋時間
     */
    public DispDateTime(): string {

        let date = new Date(this.Date);

        return date.getFullYear()
            + "-" + ("0" + (date.getMonth() + 1)).slice(-2)
            + "-" + ("0" + date.getDate()).slice(-2)
            + " " + ("0" + date.getHours()).slice(-2)
            + ":" + ("0" + date.getMinutes()).slice(-2)
            + ":" + ("0" + date.getSeconds()).slice(-2)
            + "." + ("00" + date.getMilliseconds()).slice(-3);
    }

}


export interface ILogListener {
    Write(value: Log);
}

/**
 * ログ出力ユーティリティ
 */
export default class LogUtil {


    public static _APPNAME = 'Skybeje';


    //  リスナー管理
    private static _listener: Array<ILogListener>;


    //  ログ出力レベル設定
    public static LogLevel: LogLevel = LogLevel.Error;

    /**
     * リスナー追加
     * @param listener
     */
    public static AddListener(listener: ILogListener) {
        if (this._listener == null) {
            this._listener = new Array<ILogListener>();
        }

        this._listener.push(listener);
    }


    /**
     * リスナーの削除
     */
    public static RemoveListener() {
        this._listener = null;
    }


    /**
     * 
     * @param service 
     */
    public static LogHeader(service: IServiceController): string {

        let result = this._APPNAME + " : ";
        if (service) {
            result += service.ControllerName();
            let peerid = (service.SwPeer ? service.SwPeer.PeerId : "");
            if (peerid) result += " [" + peerid + "]";
            result += " : ";
        }

        return result;
    }


    /**
     * ログ出力
     * @param peerid 
     * @param value 
     */
    public static Info(service: IServiceController, value: string) {

        if (this.LogLevel > LogLevel.Info) {
            return;
        }

        const maxlen = 512;
        let consoleLog: string;

        if (value.length < maxlen) {
            consoleLog = value;
        }
        else {
            consoleLog = value.substring(0, maxlen) + "...";
        }

        console.log(this.LogHeader(service) + consoleLog);

        let log = new Log(value);

        if (this._listener)
            this._listener.forEach(n => n.Write(log));
    }


    /**
     * 警告ログの出力
     * @param service 
     * @param value 
     */
    public static Warning(service: IServiceController, value: string) {

        if (this.LogLevel > LogLevel.Warning) {
            return;
        }

        console.warn(this.LogHeader(service) + value);

        let log = new Log(value, LogLevel.Warning);

        if (this._listener)
            this._listener.forEach(n => n.Write(log));
    }


    /**
     * エラーログの出力
     * @param value
     */
    static Error(service: IServiceController, value: string) {

        console.error(this.LogHeader(service) + value);

        let log = new Log(value, LogLevel.Error);

        if (this._listener)
            this._listener.forEach(n => n.Write(log));
    }


    /**
     * 致命的エラーのログ出力（エラーページを表示します）
     * @param value
     */
    public static FatalError(value: string) {
        sessionStorage.setItem("ErrorUrl", window.location.href);
        sessionStorage.setItem("ErrorMsg", value);

        window.location.href = "../../ErrorAlert/";
    }


    /**
     * 出力対象となるSenderか？
     * @param sender
     */
    public static IsOutputSender(sender: Sender): boolean {

        if (sender === null) return false;

        //  画像が含まれるものは除外する
        if (sender.type === 'Entrance') return false;
        if (sender.type === 'Room') return false;
        //  if (sender.type === 'Icon') return false;

        //  カーソルもログの量が多すぎるので除外する
        if (sender.type === 'IconCursor') return false;
        if (sender.type === 'ChatInputing') return false;
        if (sender.type === 'Timeline') return false;

        return true;
    }

}
