import StdUtil from "./StdUtil";
import LogUtil from "./LogUtil";
import IServiceController from "../IServiceController";


declare var SkyWay: any;
interface OnGetMediaStream { (stream: MediaStream): void }
interface OnErrorGetMediaStream { (errmsg: string): void }

export enum MobileCam {
    FRONT = 0,
    REAR = 1,
    NONE = 2,
}

export default class StreamUtil {

    private static _screenShare = null;


    /**
     * プレビュー開始
     * @param element 
     * @param stream メディアストリーム
     */
    public static StartPreview(element: HTMLVideoElement, stream: MediaStream) {
        if (element) {
            element.src = null;
            element.srcObject = stream;
        }
    }


    /**
     * メディアストリームの取得
     * @param msc MediaStreamConstraints
     * @param callback OnGetMediaStream
     * @param errorcallback OnErrorGetMediaStream
     */
    public static GetStreaming(msc: MediaStreamConstraints, callback: OnGetMediaStream, errorcallback: OnErrorGetMediaStream) {

        if (msc) {
            this.GetMediaStream(msc, (stream) => {
                callback(stream);
            }, (errname) => {
                errorcallback(errname);
            });
        }
    }


    /**
     * メディアストリームを取得します
     * @param msc 
     * @param callback 
     * @param error_callback 
     * @param retryCount 
     */
    private static GetMediaStream(msc: MediaStreamConstraints, callback: OnGetMediaStream, error_callback: OnErrorGetMediaStream, retryCount: number = 0) {

        try {

            let p = navigator.mediaDevices.getUserMedia(msc);

            p.then((stream) => {
                callback(stream);
            });

            p.catch((err: MediaStreamError) => {

                let errmsg = err.name + "\n" + err.message;

                if (err.name === "TrackStartError" && retryCount < 5) {
                    retryCount = retryCount + 1;
                    LogUtil.Warning(null, errmsg + "/n retry " + retryCount.toString());
                    //  １秒待ってからリトライ ※5回迄
                    setTimeout(() => {
                        this.GetMediaStream(msc, callback, error_callback, retryCount);
                    }, 1000);
                }
                else {
                    error_callback(err.name);
                    LogUtil.Error(null, errmsg);
                }
            });

        }
        catch (err) {
            error_callback(err.name);
            LogUtil.Error(null, err.name);
        }
    }


    /**
     * 
     * @param videoSource 
     * @param audioSource 
     */
    public static GetMediaStreamConstraints(videoSource: string, audioSource: string): MediaStreamConstraints {

        let result: MediaStreamConstraints = {
            video: (videoSource ? { advanced: ([{ deviceId: videoSource }]) } : false),
            audio: (audioSource ? { advanced: ([{ deviceId: audioSource }]) } : false),
        };

        return result;
    }

    /**
     * 
     * @param videoSource 
     * @param audioSource 
     */
     public static GetMediaStreamConstraintsHD(videoSource: string, audioSource: string): MediaStreamConstraints {

        let result: MediaStreamConstraints = {
            //  video: (videoSource ? { advanced: ([{ deviceId: videoSource }]) } : false),
            video: (videoSource ? {
                advanced: ([{
                    deviceId: videoSource,
                    width: 1920,
                    height: 1080
                }]) } : false),
            audio: (audioSource ? { advanced: ([{ deviceId: audioSource }]) } : false),
        };

        return result;
    }

    /**
     * デフォルトデバイスの取得
     */
    public static GetMediaStreamConstraints_DefaultDevice(): MediaStreamConstraints {
        return { audio: true, video: true };
    }


    /**
     * モバイル端末のMediaStreamConstraints取得
     */
    public static GetMediaStreamConstraints_Mobile(cam: MobileCam, useAudio: boolean): MediaStreamConstraints {

        switch (cam) {
            case MobileCam.FRONT:
                return { audio: useAudio, video: { facingMode: "user" } };
            case MobileCam.REAR:
                return { audio: useAudio, video: { facingMode: { exact: "environment" } } };
            case MobileCam.NONE:
                return { audio: useAudio, video: false };
        }
    }


    /**
     * 指定ストリームを停止します
     * @param stream 
     */
    public static Stop(stream: MediaStream) {
        if (stream) {
            let tracks = stream.getTracks();
            let count = tracks.length;
            if (count > 0) {
                for (let i = count - 1; i >= 0; i--) {
                    let track: MediaStreamTrack = tracks[i];
                    track.stop();
                    stream.removeTrack(track);
                }
            }
        }
    }


    /**
     * 指定ストリームをミュートします
     * @param stream 
     * @param value 
     */
    public static SetMute(stream: MediaStream, value: boolean) {
        if (stream) {
            let tracks = stream.getAudioTracks();
            if (tracks && tracks.length > 0) {
                let track = tracks[0];
                track.enabled = !value;
            }
        }
    }


    /**
     * Skybeje Screen Share Extensionのインストール有無確認
     */
    public static IsEnabledExtension(): boolean {
        if (!this._screenShare) {
            this._screenShare = new SkyWay.ScreenShare({ debug: true });
        }
        return this._screenShare.isEnabledExtension();
    }


    /**
     * スクリーンシェアの開始
     * @param width 
     * @param height 
     * @param fr 
     * @param callback 
     */
    public static GetScreenSheare(service: IServiceController, width: number, height: number, fr: number, callback: OnGetMediaStream) {
        this.GetScreenShareMediaStream(service, width, height, fr, (stream) => {
            callback(stream);
        });
    }


    /**
     * スクリーンシェアのメディアストリームを取得します。
     * 【注意】Skybejeの Chrome Extension がインストールされている必要があります。
     * @param width 
     * @param height 
     * @param fr 
     * @param callback 
     */
    private static GetScreenShareMediaStream(service: IServiceController, width: number, height: number, fr: number, callback: OnGetMediaStream) {

        if (!this._screenShare) {
            this._screenShare = new SkyWay.ScreenShare({ debug: true });
        }

        // スクリーンシェアを開始
        if (this._screenShare.isEnabledExtension()) {

            let sWidth = (width === 0 ? "" : width.toString());
            let sHeight = (height === 0 ? "" : height.toString());
            let sFrameRate = (fr === 0 ? "1" : fr.toString());
            let option = {};

            if (width === 0 || height === 0) {
                option = { FrameRate: sFrameRate };
            }
            else {
                option = { Width: sWidth, Height: sHeight, FrameRate: sFrameRate };
            }

            this._screenShare.startScreenShare(option,
                (stream) => {
                    callback(stream);
                }, (err: MediaStreamError) => {
                    LogUtil.Error(service, err.name);
                    LogUtil.Error(service, err.message);
                }, () => {
                });
        } else {
            alert('スクリーンシェアを開始するためには SkyBeje ScreenShare Extension のインストールが必要です。');
        }
    }


    /**
     * AudioStreamの有無
     * @param stream 
     */
    public static HasAudioStream(stream: MediaStream): boolean {
        if (stream) {
            let tracks = stream.getAudioTracks();
            return (tracks && tracks.length > 0);
        }
        else {
            return false;
        }
    }

}