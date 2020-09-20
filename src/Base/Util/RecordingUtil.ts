
declare var MediaRecorder: any;

interface OnRecorded { (audioBlob: Blob): void }

export default class RecordingUtil {

    private static recorder: any;
    private static audioData: any;
    private static audioExtension: any;

    private static _isRec: boolean;

    private static _mid: string;

    public static set Mid(mid: string) {
        this._mid = mid;
    }

    public static get Mid(): string {
        return this._mid;
    }

    /**
     * 録音処理の初期化
     */
    public static initilize(callback: OnRecorded) {

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
            });
    }


    /**
     * 録音開始
     */
    public static start() {
        this.audioData = [];
        this.recorder.start();
        this._isRec = true;
    }


    /**
     * 録音停止
     */
    public static stop() {
        if (this._isRec && this.recorder) {
            this.recorder.stop();
            this._isRec = false;
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