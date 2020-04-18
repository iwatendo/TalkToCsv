import Sender from "../Container/Sender";


declare var ForcedTimer: any;

interface OnIntervalSend<T extends Sender> { (sender: T): void }

/**
 * カーソル表示やキーボード入力中情報を送りすぎないように
 * 指定間隔で送信する為のクラス
 */
export default class IntervalSend<T extends Sender> {

    private _queue: T;
    private _intervalTime: number;


    /**
     * 
     * @param intervalTime 
     */
    constructor(intervalTime: number) {
        this._intervalTime = intervalTime;
    }

    private _sendInterval: number;

    /**
     * 
     * @param sender 
     */
    public Send(sender: T, callback: OnIntervalSend<T>) {
        this._queue = sender;

        if (this._sendInterval) {
            return;
        }

        this._sendInterval = ForcedTimer.setInterval(() => {
            if (this._queue) {
                callback(this._queue);
                this._queue = null;
            }
            else {
                ForcedTimer.clearInterval(this._sendInterval);
                this._sendInterval = undefined;
            }
        }, this._intervalTime);
    }
}
