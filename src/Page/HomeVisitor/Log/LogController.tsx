import * as React from 'react';
import * as ReactDOM from 'react-dom';


import HomeVisitorController from "../HomeVisitorController";
import LogUtil, { ILogListener, Log } from "../../../Base/Util/LogUtil";
import LogComponent from "./LogComponent";


export default class LogController implements ILogListener {

    private _controller: HomeVisitorController;
    private _logElement = document.getElementById('sbj-home-visitor-console-log');
    private _logs = new Array<Log>();

    /**
     * コンストラクタ
     * @param controller 
     */
    constructor(controller: HomeVisitorController) {
        this._controller = controller;
        LogUtil.AddListener(this);
    }


    /**
     * ログの書込み
     * @param value
     */
    public Write(value: Log) {
        this._logs.push(value);
        ReactDOM.render(<LogComponent controller={this._controller} logs={this._logs} />, this._logElement, () => { });
    }

}