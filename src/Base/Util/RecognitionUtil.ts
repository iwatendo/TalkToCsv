import LinkUtil from "./LinkUtil";
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
            this.StopSpeechRecognition();
        };

        //
        if (onSpeechStart) {
            //  音声認識開始イベント
            this._recognition.onsoundstart = (e: Event) => {
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
            for (var i = event.resultIndex; i < results.length; i++) {
                if (results[i].isFinal) {
                    callback(results[i][0].transcript, true);
                    this._recognition.stop();
                }
                else {
                    callback(results[i][0].transcript, false);
                }
            }
        }

        this._recognition.onnomatch = (e: SpeechRecognitionEvent) => {
            this._recognition.stop();
            callback("", true);
        }

        //
        this._recognition.onend = (e: Event) => {
            if (this._useRecognition) {
                this._recognition.start();
            }
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


