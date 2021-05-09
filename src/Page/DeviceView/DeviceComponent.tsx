import * as React from 'react';

import DeviceItemComponent from "./DeviceItemComponent";
import { DeviceView } from "./DeviceVew";
import DeviceUtil from '../../Base/Util/DeviceUtil';


/**
 * プロパティ
 */
export interface DeviceProp {
    owner: DeviceView;
    deviceList: Array<MediaDeviceInfo>;
}


export default class DeviceComponent extends React.Component<DeviceProp, any> {

    /**
     * コンストラクタ
     * @param props
     * @param context
     */
    constructor(props?: DeviceProp, context?: any) {
        super(props, context);
    }


    /**
     * 
     */
    public render() {

        let deviceTable = this.props.deviceList.map((device, index, array) => {
            let name = DeviceUtil.Set(device);
            return (<DeviceItemComponent key={name} owner={this.props.owner} deviceId={device.deviceId} deviceName={name} />);
        });

        //  コンボボックスの初期化（先頭には空白行を入れる）
        return (
            <div>
                <DeviceItemComponent key={""} owner={this.props.owner} deviceId={""} deviceName={""} />
                {deviceTable}
            </div>
        );
    }

}
