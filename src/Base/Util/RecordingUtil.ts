import { textChangeRangeIsUnchanged } from "typescript";

declare var MediaRecorder: any;

interface OnRecorded { (audioBlob: Blob): void }

export default class RecordingUtil {

    private static recorder: any;
    private static audioData: any;
    private static audioExtension: any;

    /**
     * 初期化有無
     */
    private static _isInit: boolean = false;

    /**
     * 録音している最中か？
     */
    private static _isRecording: boolean;

    /**
     * 録音されたか？
     */
    private static _isRecorded: boolean;

    /**
     * 初期化有無
     */
    public static get IsInit(): boolean {
        return this._isInit;
    }

    /**
     * 
     */
    public static get IsRecorded(): boolean {
        return this._isRecorded;
    }

    /**
     * 
     */
    public static set IsRecorded(value: boolean) {
        this._isRecorded = value;
    }

    /**
     * 録音処理の初期化
     */
    public static initilize(callback: OnRecorded) {

        if (this._isInit) {
            return;
        }

        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {

                this.recorder = new MediaRecorder(stream);
                this.recorder.addEventListener('dataavailable', e => {

                    this.audioData.push(e.data);
                    this.audioExtension = this.getExtension(e.data.type);
                });
                this.recorder.addEventListener('stop', () => {

                    const audioBlob = new Blob(this.audioData);
                    callback(audioBlob);
                });

                this._isInit = true;
            });
    }


    /**
     * 録音開始
     */
    public static start() {
        this.audioData = [];
        this.recorder.start();
        this._isRecording = true;
        this._isRecorded = true;
    }


    /**
     * 録音停止
     */
    public static stop() {
        if (this._isRecording && this.recorder) {
            this.recorder.stop();
            this._isRecording = false;
        }
    }


    /**
     * 
     * @param audioType 
     */
    private static getExtension(audioType) {

        let extension = 'wav';
        const matches = audioType.match(/audio\/([^;]+)/);

        if (matches) {
            extension = matches[1];
        }

        return '.' + extension;
    }


    /**
     * 
     * @param audioBlob 
     */
    public static download(audioBlob: Blob) {
        const url = URL.createObjectURL(audioBlob);

        let a = document.createElement('a');
        a.href = url;
        a.download = Math.floor(Date.now() / 1000) + this.audioExtension;
        document.body.appendChild(a);
        a.click();
    }

}