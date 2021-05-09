import StdUtil from "../../Base/Util/StdUtil";
import LocalCache from "../../Base/Util/LocalCache";
import DeviceUtil, { DeviceKind } from "../../Base/Util/DeviceUtil";
import StreamUtil from "../../Base/Util/StreamUtil";
import { DeviceView } from "../DeviceView/DeviceVew";


if (StdUtil.IsSupoortPlatform(true)) {

    if (!LocalCache.IsCheckDevicePermision) {
        let reload = () => {
            LocalCache.IsCheckDevicePermision = true;
            location.reload();
        };
        navigator.getUserMedia = navigator.getUserMedia || (navigator as any).webkitGetUserMedia || (navigator as any).mozGetUserMedia;
        navigator.getUserMedia({ video: true, audio: false }, (stream) => { reload(); }, (err) => { reload(); });
    }
    else {
        SetMediaDevice();
    }
}

/**
 * Video/Audioソースの取得とリストへのセット
 */
function SetMediaDevice() {

    let preCam = LocalCache.CameraOptions.SelectCam;
    let isInit = (!preCam);

    DeviceUtil.GetVideoDevice((devices) => {

        let previewElement = document.getElementById('web-camera-view-video') as HTMLVideoElement;
        let textElement = document.getElementById('webcam-select') as HTMLInputElement;
        var listElement = document.getElementById('webcam-list') as HTMLElement;

        var view = new DeviceView(DeviceKind.Video, textElement, listElement, devices, (deviceId, deviceName) => {

            LocalCache.SetCameraOptions((opt) => opt.SelectCam = deviceId);

            if (deviceId) {
                let msc = StreamUtil.GetMediaStreamConstraintsHD(deviceId, null);
                StreamUtil.GetStreaming(msc, (stream) => {
                    StreamUtil.StartPreview(previewElement, stream);
                }, (errname) => {
                    alert(errname);
                });
            }
        });

        if (isInit) {
            view.SelectFirstDevice();
        } else {
            view.SelectDeivce(preCam);
        }

        document.getElementById("webcam-select-div").classList.add("is-dirty");
    });

}
