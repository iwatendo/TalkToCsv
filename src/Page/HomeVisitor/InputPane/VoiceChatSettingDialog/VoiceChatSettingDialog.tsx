import * as React from 'react';
import * as ReactDOM from 'react-dom';
import StdUtil from "../../../../Base/Util/StdUtil";

export default class VoiceChatSettingDialog {


    private static _dialog: VoiceChatSettingDialog = new VoiceChatSettingDialog('sbj-voicechat-setting-dialog');

    private _backgroundElement = document.getElementById("sbj-voicechat-setting-background");

    /**
     * 
     */
    public static Show() {
        this._dialog.Show();
    }


    private _dialog: any;

    /**
     * コンストラクタ
     * @param dialogName イメージダイアログのID
     */
    public constructor(dialogName: string) {

        StdUtil.StopPropagation();

        this._dialog = document.getElementById(dialogName) as any;

        this._backgroundElement.onclick = (ev) => {
            if (ev.target == this._backgroundElement)
                this.Close();
        };
    }


    /**
     * ガイドダイアログの表示
     * @param callback 
     */
    public Show() {
        this._dialog.showModal();
    }


    /**
     * ガイドデータの追加／更新
     */
    private Done() {
        this.Close();
    }


    /**
     * 終了処理
     */
    private Close() {
        if (this._dialog && this._dialog.open) {
            this._dialog.close();
        }
    }

}
