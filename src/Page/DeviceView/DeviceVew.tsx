import * as React from 'react';
import * as ReactDOM from 'react-dom';

import DeviceUtil, { DeviceKind } from "../../Base/Util/DeviceUtil";

import DeviceComponent from "./DeviceComponent";


export interface OnChangeDevice { (deviceId: string, deviceName: string): void };


export class DeviceView {

    private _textElement: HTMLInputElement;
    private _listElement: HTMLElement;
    private _devices: Array<MediaDeviceInfo>;
    private _onChangeDevice: OnChangeDevice;
    private _selectDeviceId: string;
    private _deviceKind: DeviceKind;

    /**
     * コンストラクタ
     * @param deviceKind
     * @param textElement 
     * @param listElement 
     * @param devices 
     * @param deviceSelector 
     */
    public constructor(deviceKind: DeviceKind, textElement: HTMLInputElement, listElement: HTMLElement, devices: Array<MediaDeviceInfo>, deviceSelector: OnChangeDevice) {
        this._deviceKind = deviceKind;
        this._textElement = textElement;
        this._textElement.style.cursor = "pointer";
        this._listElement = listElement;
        this._devices = devices;
        this._onChangeDevice = deviceSelector;
        this.Create();
    }


    /**
     * 生成処理（描画処理）
     */
    public Create() {
        ReactDOM.render(<DeviceComponent owner={this} deviceList={this._devices} />, this._listElement, () => { });
    }


    /**
     * 選択デバイスの変更
     * @param deviceId 
     * @param deviceName 
     */
    public ChangeDevice(deviceId: string, deviceName: string) {

        //  リストを非表示にする為のクリックアクション
        this._textElement.click();

        this._selectDeviceId = deviceId;
        this._textElement.value = deviceName;
        if (this._onChangeDevice) {
            this._onChangeDevice(deviceId, deviceName);
        }
    }


    /**
     * 
     */
    public SelectClear() {
        this._selectDeviceId = "";
        this._textElement.value = "";
        if (this._onChangeDevice) {
            this._onChangeDevice("", "");
        }
    }


    /**
     * 先頭のデバイスを選択状態にする
     */
    public SelectFirstDevice() {
        if (this._devices && this._devices.length > 0) {
            this.SelectDeivce(this._devices[0].deviceId);
        }
    }


    /**
     * 指定したデバイスを選択状態にする　
     * @param id 
     */
    public SelectDeivce(id: string) {

        let name = DeviceUtil.GetDeviceName(this._deviceKind, id);
        this._textElement.value = name;
        if (this._onChangeDevice) {
            this._onChangeDevice(id, name);
        }
    }
}
