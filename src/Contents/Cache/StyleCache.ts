import ImageInfo, { BgPosEnum, BgRepeatEnum, BgSizeEnum } from "../../Base/Container/ImageInfo";
import { Icon } from "../IndexedDB/Personal";

export default class StyleCache {


    /*---------------------------------------------
    //  チャットメッセージのCSS設定
    //-------------------------------------------*/

    private static _msgCssMap = new Map<string, string>();

    private static _element: HTMLElement = document.documentElement;

    public static SetCacheElement(element: HTMLElement) {
        this._element = element;
    }

    /**
     * タイムラインのCSS指定取得
     * @param key 
     */
    public static GetTimelineMsgStyle(key: string): any {

        if (!StyleCache._msgCssMap.has(key)) {
            //  デフォルト設定
            this._element.style.setProperty('--sbj-msgc-' + key, "var(--sbj-color-timeline-message)");
            this._element.style.setProperty('--sbj-msgbc-' + key, "var(--sbj-color-timeline-ballon)");
        }

        return {
            color: 'var(--sbj-msgc-' + key + ')',
            backgroundColor: 'var(--sbj-msgbc-' + key + ')',
        };
    }


    /**
     * タイムラインのCSS指定
     * @param key 
     * @param rec 
     */
    public static SetTimelineMsgStyle(key: string, icon: Icon) {

        //  チャットの文字色 / 背景色設定
        if (icon && icon.msgcolor && icon.msgbackcolor) {
            if (StyleCache._msgCssMap.has(key)) {
                return;
            }
            else {
                this._element.style.setProperty('--sbj-msgc-' + key, icon.msgcolor);
                this._element.style.setProperty('--sbj-msgbc-' + key, icon.msgbackcolor);
                StyleCache._msgCssMap.set(key, key);
            }
        }

    }


    /*---------------------------------------------
    //  画像データのCSS
    //-------------------------------------------*/

    private static _imgCssMap = new Map<string, string>();


    /**
     * アイコンのスタイルはキャシュ（設定済か？）
     * @param key 
     */
    public static HasIconStyle(key: string): boolean {
        return StyleCache._imgCssMap.has(key);
    }


    /**
     * 
     * @param element 
     * @param key 
     */
    public static SetIconStyleElement(element: HTMLElement, key: string) {
        element.style.background = 'var(--sbj-imgbg-' + key + ')';
        element.style.backgroundSize = 'var(--sbj-imgbgs-' + key + ')';
        element.style.backgroundRepeat = 'var(--sbj-imgbgr-' + key + ')';
        element.style.backgroundPosition = 'var(--sbj-imgbgp-' + key + ')';
        element.style.backgroundColor = 'var(--sbj-bgc-' + key + ')';
    }


    /**
     * アイコンのCSS指定取得
     * @param key
     * @param isSetSize
     */
    public static GetIconStyle(key: string, isSetSize: boolean = false): any {

        //  デフォルト設定
        if (!StyleCache._imgCssMap.has(key)) {
            this._element.style.setProperty('--sbj-bgc-' + key, 'rgba(0,0,0,.3)');
            if (isSetSize) this.SetIconSize(key, 48);
        }

        if (isSetSize) {

            return {
                width: 'var(--sbj-imgw-' + key + ')',
                height: 'var(--sbj-imgh-' + key + ')',
                margin: 'var(--sbj-imgm-' + key + ')',
                background: 'var(--sbj-imgbg-' + key + ')',
                backgroundSize: 'var(--sbj-imgbgs-' + key + ')',
                backgroundRepeat: 'var(--sbj-imgbgr-' + key + ')',
                backgroundPosition: 'var(--sbj-imgbgp-' + key + ')',
                backgroundColor: 'var(--sbj-bgc-' + key + ')',
                userselect: 'none',
            };
        }
        else {
            return {
                background: 'var(--sbj-imgbg-' + key + ')',
                backgroundSize: 'var(--sbj-imgbgs-' + key + ')',
                backgroundRepeat: 'var(--sbj-imgbgr-' + key + ')',
                backgroundPosition: 'var(--sbj-imgbgp-' + key + ')',
                backgroundColor: 'var(--sbj-bgc-' + key + ')',
                userselect: 'none',
            };
        }
    }


    /**
     * 画像サイズ指定
     * @param key 
     * @param iconSizePx 
     */
    public static SetIconSize(key: string, iconSizePx: number) {
        let iconsize = iconSizePx.toString() + "px";
        let mergin = "-" + Math.round(iconSizePx / 2) + "px";
        this._element.style.setProperty('--sbj-imgw-' + key, iconsize);
        this._element.style.setProperty('--sbj-imgh-' + key, iconsize);
        this._element.style.setProperty('--sbj-imgm-' + key, mergin);
    }


    /**
     * 画像のCSS指定
     * @param key
     * @param rec 
     */
    public static SetIconStyle(key: string, rec: ImageInfo) {
        if (StyleCache._imgCssMap.has(key)) {
            return;
        }
        else {
            let bgurl: string = null;

            if (rec.src) {
                if (rec.src.indexOf("data:image") === 0) {
                    //  base64形式の場合は、blob形式にして格納
                    window.URL = window.URL || (window as any).webkitURL;
                    let blob = this.ToBlob(rec.src);
                    bgurl = window.URL.createObjectURL(blob);
                }
                else {
                    bgurl = rec.src;
                }
            }

            if (rec && bgurl) {
                this._element.style.setProperty('--sbj-bgc-' + key, "");
                this._element.style.setProperty('--sbj-imgbg-' + key, "url(" + bgurl + ")");
                this._element.style.setProperty('--sbj-imgbgs-' + key, StyleCache.SizeEnumToString(rec.backgroundsize));
                this._element.style.setProperty('--sbj-imgbgr-' + key, StyleCache.RepeatEnumToString(rec.backgroundrepeat));
                this._element.style.setProperty('--sbj-imgbgp-' + key, StyleCache.PosEnumToString(rec.backgroundposition));
            }

            StyleCache._imgCssMap.set(key, key);
        }
    }


    /**
     * base64形式のデータをBlob形式変換
     * @param src 
     */
    private static ToBlob(src: string): Blob {
        var bin = atob(src.replace(/^.*,/, ''));
        var buffer = new Uint8Array(bin.length);
        for (var i = 0; i < bin.length; i++) {
            buffer[i] = bin.charCodeAt(i);
        }
        return new Blob([buffer.buffer]);
    }


    /**
     * 
     * @param value 
     */
    private static SizeEnumToString(value: BgSizeEnum) {
        switch (value) {
            case BgSizeEnum.Contain: return "contain";
            case BgSizeEnum.Cover: return "cover";
        }
        return "";
    }


    /**
     * 
     * @param value 
     */
    private static PosEnumToString(value: BgPosEnum) {
        switch (value) {
            case BgPosEnum.Center: return "center";
            case BgPosEnum.Top: return "top";
            case BgPosEnum.Left: return "left";
            case BgPosEnum.Right: return "right";
            case BgPosEnum.Bottom: return "bottom";
        }
        return "";
    }


    /**
     * 
     * @param value 
     */
    private static RepeatEnumToString(value: BgRepeatEnum) {
        switch (value) {
            case BgRepeatEnum.Repeat: return "repeat";
            case BgRepeatEnum.RepeatX: return "repeat-x";
            case BgRepeatEnum.RepeatY: return "repeat-y";
            case BgRepeatEnum.NoRepeat: return "no-repeat";
        }
        return "";
    }


}
