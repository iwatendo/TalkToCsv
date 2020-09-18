import * as React from 'react';
import * as ReactDOM from 'react-dom';
import ChatClientController from "../ChatClientController";
import { Log } from "../../../Base/Util/LogUtil";


/**
 * プロパティ
 */
export interface LogProp {
    controller: ChatClientController;
    logs: Array<Log>
}


export default class LogComponent extends React.Component<LogProp, any> {

    /**
     * 
     */
    public render() {

        var logNodes = this.props.logs.map((cur) => {

            var msg = cur.Message;

            if (msg.length > 512)
                msg = msg.substring(0, 512) + " ...";

            return (<div className='console-log'><span className='console-time'>{cur.DispDateTime() }</span> {msg}</div>);
        });

        return (
            <div>
                {logNodes}
            </div>
        );
    }

}
