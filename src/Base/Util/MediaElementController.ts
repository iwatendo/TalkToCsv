import StdUtil from "./StdUtil";
import LogUtil from "./LogUtil";


/**
 * AndroidとSafariのMediaElementへの設定差分を吸収する
 */
export default class MediaElementController {

    private _videoElement: HTMLVideoElement;

    private _audioContext: AudioContext = null;
    private _mediaStream: MediaStream;
    private _initAudio: boolean;
    private _mediaStreamNode: MediaStreamAudioSourceNode = null;
    private _gainNode: GainNode = null;
    private _isMute: boolean;
    private _volume: number;
    private _isSafari: boolean;

    /**
     * 
     * @param video 
     */
    public constructor(video: HTMLVideoElement) {
        this._isSafari = false // StdUtil.IsSafari();
        this._videoElement = video;
        this._isMute = true;
        this._initAudio = false;
        this._volume = 1;
    }


    /**
     * Video/Audioエレメント
     * @param stream 
     * @param video 
     * @param audio 
     */
    public SetStream(stream: MediaStream) {

        if (stream) {
            this._mediaStream = stream;
            this._videoElement.srcObject = stream;
            this._videoElement.play();
            this._videoElement.muted = true;
            this._initAudio = false;
        }
    }


    /**
     * モバイル端末にて音声の再生開始は必ず、ユーザー操作が起点である必要があり
     * ミュート解除ボタン等のイベントから呼出すようにしてください。
     */
    public UserAction() {
        if (!this._initAudio) {
            this.InitilzieAudioContext();
            this._initAudio = true;
        }
    }


    /**
     * AudioContextの初期化
     */
    private InitilzieAudioContext() {

        if (this._isSafari) {
            (window as any).AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
            this._audioContext = new AudioContext();
            this._mediaStreamNode = this._audioContext.createMediaStreamSource(this._mediaStream);
            this._gainNode = this._audioContext.createGain();
            this._mediaStreamNode.connect(this._gainNode);
            this._gainNode.gain.value = 0;
            this._gainNode.connect(this._audioContext.destination);
        }
        else {
            this._videoElement.muted = this._isMute;
            this._videoElement.volume = this._volume;
        }
    }


    /**
     * 
     */
    public get Mute(): boolean {
        return this._isMute;
    }


    /**
     * 
     */
    public set Mute(isMute: boolean) {

        this._isMute = isMute;
        let volume = (this._isMute ? 0 : this._volume);

        if (this._isSafari) {
            if (this._gainNode) {
                this._gainNode.gain.value = volume;
            }
        }
        else {
            if (this._videoElement) {
                this._videoElement.muted = this._isMute;
                this._videoElement.volume = volume;
            }
        }
    }


    /**
     * 
     */
    public get Volume(): number {
        return this._volume;
    }


    /**
     * ボリューム(0~1)
     */
    public set Volume(volume: number) {

        this._volume = volume;

        if (this._isSafari) {
            if (this._gainNode) {
                this._gainNode.gain.value = volume;
            }
        }
        else {
            if (this._videoElement) {
                this._videoElement.volume = volume;
            }
        }
    }

}
