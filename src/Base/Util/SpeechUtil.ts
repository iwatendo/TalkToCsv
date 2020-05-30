
export default class SpeechUtil {

    /**
     * 音声出力処理
     * @param msg メッセージ
     */
    public static Speech(text: string) {
        let ssu = new SpeechSynthesisUtterance();
        ssu.volume = 0.8;
        ssu.rate = 1.00;
        ssu.pitch = 1.00;
        ssu.text = text;
        ssu.lang = "ja-JP";
        ssu.onend = function (event) { }
        speechSynthesis.speak(ssu);
    }


    private static _lastCTime: number;

    /**
     * 
     * @param startTime 
     */
    public static SetStartTime(startTime: number) {
        this._lastCTime = startTime
    }


    /**
     * タイムラインメッセージの読上げ
     * @param tlmsg 
     */
    public static TimelineSpeech(ctime: number, msg: string) {
        if (ctime > this._lastCTime) {
            this._lastCTime = ctime;
            this.Speech(msg);
        }
    }

}


