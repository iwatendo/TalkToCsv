import LogUtil from "./LogUtil";
import IServiceController from "../IServiceController";

interface OnSpeechRecognition { (speech: string, isFinal: boolean): void }
interface OnSpeechStart { (): void }
interface OnSpeechEnd { (): void }

export default class RecognitionUtil {

    /**
     *  
     */
    private static _recognition: SpeechRecognition;
    private static _useRecognition: boolean;
    private static _isCancel: boolean = false;

    //  音を検出してから、以下の時間（ミリ秒）文字検知出来なかった場合音声認識を停止
    private static NOWORD_TIMEOUT = 2500;

    /**
     * 音声認識処理の開始
     */
    public static Start() {
        if (this._recognition) {
            this._useRecognition = true;
            this._isCancel = false;
            this._recognition.start();
        }
    }


    /**
     * 音声認識処理の停止
     */
    public static Stop() {
        if (this._recognition) {
            this._useRecognition = false;
            this._recognition.stop();
        }
    }


    /**
     * 音声認識のキャンセル
     */
    public static Cancel() {
        if (this._recognition) {
            this._isCancel = true;
            this._recognition.stop();
        }
    }

    /**
     * 音声認識処理
     */
    public static InitSpeechRecognition(
        service: IServiceController,
        callback: OnSpeechRecognition,
        onSpeechStart: OnSpeechStart = null,
        onSpeechEnd: OnSpeechEnd = null
    ) {

        let win = window as any;
        win.SpeechRecognition = win.SpeechRecognition || webkitSpeechRecognition;

        this._recognition = new webkitSpeechRecognition();
        this._recognition.lang = 'ja';
        this._recognition.interimResults = true;
        this._recognition.continuous = true;

        let workText = "";

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
            this.Stop();
        };

        let self = this;

        //  音声認識開始イベント
        this._recognition.onsoundstart = (e: Event) => {

            workText = "";

            //  ２秒以内に言葉を認識できなければ停止する
            setTimeout(() => {
                if (!workText) {
                    self._recognition.stop();
                }
            }, this.NOWORD_TIMEOUT);

            //
            if (onSpeechStart) {
                onSpeechStart();
            }
        }

        if (onSpeechEnd) {
            //  音声認識終了イベント
            this._recognition.onsoundend = (e: Event) => {
                onSpeechEnd();
            };
        }

        //
        this._recognition.onresult = (event: SpeechRecognitionEvent) => {

            var results = event.results;
            let isFinal = false;
            let text = "";

            if (!RecognitionUtil._isCancel) {
                for (var i = event.resultIndex; i < results.length; i++) {
                    text += results[i][0].transcript;
                    if (results[i].isFinal) {
                        isFinal = true;
                    }
                }
                workText = text;
            }

            if (isFinal) {
                RecognitionUtil._isCancel = false;
                this._recognition.stop();
                callback(text, true);
            }
            else {
                callback(text, false);
            }
        }

        //
        this._recognition.onnomatch = (e: SpeechRecognitionEvent) => {
            this._recognition.stop();
            callback("", true);
        }

        //
        this._recognition.onend = (e: Event) => {
            if (this._useRecognition) {
                RecognitionUtil._isCancel = false;
                this._recognition.start();
            }
        }
    }


}


