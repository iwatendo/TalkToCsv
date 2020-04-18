import LinkUtil from "./LinkUtil";
import LogUtil from "./LogUtil";
import IServiceController from "../IServiceController";

interface OnSpeechRecognition { (speech: string): void }
interface OnSpeechStart { (): void }
interface OnSpeechEnd { (): void }

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


    /**
     *  
     */

    private static _recognition: SpeechRecognition;
    private static _useRecognition: boolean;


    /**
     * 音声認識処理
     */
    public static InitSpeechRecognition(service: IServiceController, callback: OnSpeechRecognition, onSpeechStart: OnSpeechStart = null, onSpeechEnd: OnSpeechEnd = null) {

        let win = window as any;

        win.SpeechRecognition = win.SpeechRecognition || webkitSpeechRecognition;
        this._recognition = new webkitSpeechRecognition();
        this._recognition.lang = 'ja';

        //
        this._recognition.onerror = (sre: SpeechRecognitionError) => {

            //  NoSpeechエラーは無視
            if (sre.error === "no-speech") {
                return;
            }

            if (sre.error === "aborted" && sre.message === "") {
                LogUtil.Info(service, "SpeechRecognitiaon Aborted.");
            }
            else {
                if (sre.error) {
                    LogUtil.Error(service, sre.error);
                }
                if (sre.message) {
                    LogUtil.Error(service, sre.message);
                }
            }

            //  this._useRecognition = false;
        };

        //
        if (onSpeechStart) {
            this._recognition.onsoundstart = (e: Event) => { onSpeechStart(); }
        }

        if (onSpeechEnd) {
            this._recognition.onsoundend = (e: Event) => { onSpeechEnd(); }
        }

        //
        this._recognition.onresult = (e: SpeechRecognitionEvent) => {
            let text = this.SpeechRecToText(e);
            this._recognition.stop();
            callback(text);
        }

        this._recognition.onnomatch = (e: SpeechRecognitionEvent) => {
            this._recognition.stop();
            callback("");
        }

        //
        this._recognition.onend = (e: Event) => {
            if (this._useRecognition) {
                this._recognition.start();
            }
        }
    }


    /**
     * 音声認識処理の開始
     */
    public static StartSpeechRecognition() {
        if (this._recognition) {
            this._useRecognition = true;
            this._recognition.start();
        }
    }


    /**
     * 音声認識処理の停止
     */
    public static StopSpeechRecognition() {
        if (this._recognition) {
            this._useRecognition = false;
            this._recognition.stop();
        }
    }


    /**
     * 
     * @param e 
     */
    private static SpeechRecToText(e: SpeechRecognitionEvent): string {

        let text: string = "";

        if (e || e.results) {

            let srrList: SpeechRecognitionResultList = e.results;

            if (srrList.length > 0) {

                let srr: SpeechRecognitionResult = srrList.item(0);

                if (srr.length > 0) {
                    text = srr.item(0).transcript;
                }

            }
        }

        return text;
    }

}


