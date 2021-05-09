import * as React from 'react';
import { DeviceView } from "./DeviceVew";


/**
 * プロパティ
 */
export interface DeviceItemProp {
    owner: DeviceView;
    deviceId: string;
    deviceName: string;
}


export default class DeviceItemComponent extends React.Component<DeviceItemProp, any> {

    /**
     * 
     */
    public render() {
        return (
            <li className="mdl-menu__item" onClick={this.OnClick.bind(this)}>{this.props.deviceName}</li>
        );
    }


    /**
     * デバイス選択時
     * @param event 
     */
    public OnClick(event) {
        this.props.owner.ChangeDevice(this.props.deviceId, this.props.deviceName);
    }

}
