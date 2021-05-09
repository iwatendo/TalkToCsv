export interface OnSetLiveCastOptions { (option: CameraOptions): void };

/**
 * ローカルストレージに対するデータ操作を行います。
 * このクラスを経由しないローカルストレージの使用は禁止します
 */
export default class LocalCache {

    /**
     *  使用デバイスの許可有無の確認
     */
    public static set IsCheckDevicePermision(val: boolean) { localStorage.setItem('checked-device-camera-permision', (val ? "True" : "")); }
    public static get IsCheckDevicePermision(): boolean { return localStorage.getItem('checked-device-camera-permision') === "True" }

    /**
     *  プライベート配信のオプション設定
     */
    public static get CameraOptions(): CameraOptions {
        let value = localStorage.getItem('camera-options');
        return (value ? JSON.parse(value) as CameraOptions : new CameraOptions());
    }
    public static SetCameraOptions(setoptions: OnSetLiveCastOptions) {
        let options = this.CameraOptions;
        setoptions(options);
        localStorage.setItem('camera-options', JSON.stringify(options));
    }

}


/**
 * オプション設定の保持：プライベート配信
 */
export class CameraOptions {
    SelectCam: string;
}


