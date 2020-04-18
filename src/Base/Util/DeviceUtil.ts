
interface OnReadDevice { (devices: Array<MediaDeviceInfo>) }


export enum DeviceKind {
    Audio = 1,
    Video = 2,
}

export default class DeviceUtil {

    /**
     * 
     */
    public static GetAudioDevice(callback: OnReadDevice) {

        navigator.mediaDevices.enumerateDevices().then((devices) => {

            let result = Array<MediaDeviceInfo>();
            devices.forEach((device, index, array) => {
                if (device.kind === 'audioinput') {
                    result.push(device);
                }
            });
            callback(result);
        }).catch((err) => {
            alert("GetAudioDevice\n" + err);
        });
    }

    /**
     * 
     */
    public static GetVideoDevice(callback: OnReadDevice) {

        navigator.mediaDevices.enumerateDevices().then((devices) => {

            let result = Array<MediaDeviceInfo>();

            devices.forEach((device, index, array) => {
                if (device.kind === 'videoinput') {
                    result.push(device);
                }
            });

            callback(result);

        }).catch((err) => {
            alert("GetVideoDevice\n" + err);
        });
    }


    /**
     * 
     */
    public static GetSpeakerDevice(callback: OnReadDevice) {

        navigator.mediaDevices.enumerateDevices().then((devices) => {

            let result = Array<MediaDeviceInfo>();
            devices.forEach((device, index, array) => {
                if (device.kind === 'audiooutput') {
                    result.push(device);
                }
            });
            callback(result);
        }).catch((err) => {
            alert("GetSpeakerDevice\n" + err);
        });
    }


    public static _deviceCount = new Map<string, number>();
    public static _deviceMap = new Map<string, string>();
    public static _deviceIdMap = new Map<string, string>();



    /**
     * デバイス件数の取得
     * @param kind 
     */
    private static GetDeviceCount(kind: string): number {

        let result: number = 0;

        if (this._deviceCount.has(kind)) {
            result = this._deviceCount.get(kind);
        }

        result++;
        this._deviceCount.set(kind, result);
        return result;
    }


    /**
     * デバイス名称からデバイスIDを取得します
     * @param deviceName 
     */
    public static GetDeviceId(deviceName: string): string {

        if (this._deviceIdMap.has(deviceName)) {
            return this._deviceIdMap.get(deviceName);
        }
        else {
            return "";
        }
    }


    /**
     * デバイスIDからデバイス名称を取得します
     * @param deviceId 
     */
    public static GetDeviceName(kind: DeviceKind, deviceId: string): string {

        let kid = this.ToKindId(kind, deviceId);

        if (this._deviceMap.has(kid)) {
            return this._deviceMap.get(kid);
        }
        else {
            return "";
        }
    }


    /**
     * 
     * @param kind 
     * @param deviceId 
     */
    private static ToKindId(kind: DeviceKind | string, deviceId: string) {

        if (kind === "audioinput" || kind === DeviceKind.Audio) {
            return "audio-" + deviceId;
        }

        if (kind === "videoinput" || kind === DeviceKind.Video) {
            return "video-" + deviceId;
        }

        return "";
    }


    /**
     * デバイス情報を保持します。同時にデバイス名称も取得しキャッシュ
     * ※デバイス名称が取得できなかった場合は連番を設定します
     * @param device  
     */
    public static Set(device: MediaDeviceInfo): string {

        let id = device.deviceId;
        let kid = this.ToKindId(device.kind, id);

        if (this._deviceMap.has(kid)) {
            return this._deviceMap.get(kid);
        }

        let index = this.GetDeviceCount(device.kind);

        //  デバイス名称が設定されている場合はデバイス名称を返す
        let deviceName: string = device.label;

        if (!deviceName) {
            //  デバイス名称が設定されていない場合
            if (device.kind === 'audioinput') {
                deviceName = 'mic' + index.toString();
            }
            else if (device.kind === 'videoinput') {
                deviceName = 'camera' + index.toString();
            }
        }

        this._deviceMap.set(kid, deviceName);
        this._deviceIdMap.set(deviceName, id);
        return deviceName;
    }

}