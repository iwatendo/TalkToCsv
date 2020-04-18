

export enum BgSizeEnum {
    Auto = 0,
    Contain = 1,
    Cover = 2,
}


export enum BgPosEnum {
    Center = 0,
    Top = 1,
    Bottom = 2,
    Left = 3,
    Right = 4,
}


export enum BgRepeatEnum {
    Repeat = 0,
    RepeatX = 1,
    RepeatY = 2,
    NoRepeat = 3,
}


/**
 * アイコンや背景画像の格納クラス
 * 描画時のCSS設定情報も保持する
 */
export default class ImageInfo {

    src: string;
    backgroundsize: BgSizeEnum;
    backgroundrepeat: BgRepeatEnum;
    backgroundposition: BgPosEnum;


    public constructor() {
        this.backgroundsize = BgSizeEnum.Cover;
        this.backgroundposition = BgPosEnum.Center;
        this.backgroundrepeat = BgRepeatEnum.NoRepeat;
    }


    public static SetCss(elementId: string, rec: ImageInfo) {

        let element: HTMLElement = document.getElementById(elementId);
        this.SetElementCss(element, rec);
    }


    /**
     * 
     * @param element 
     * @param rec 
     */
    public static SetElementCss(element: HTMLElement, rec: ImageInfo) {

        if (rec !== null && element !== null) {

            if (rec.src == null || rec.src.length == 0) {
                element.style.background = "";
            }
            else {
                element.style.background = "url(" + rec.src + ")";
            }
            element.style.backgroundSize = ImageInfo.SizeEnumToString(rec.backgroundsize);
            element.style.backgroundRepeat = ImageInfo.RepeatEnumToString(rec.backgroundrepeat);
            element.style.backgroundPosition = ImageInfo.PosEnumToString(rec.backgroundposition);
        }

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


    /**
     * コピー
     * @param pre 
     */
    public static Copy(pre: ImageInfo) : ImageInfo{
        let result = new ImageInfo();
        result.src = pre.src;
        result.backgroundsize = pre.backgroundsize;
        result.backgroundrepeat = pre.backgroundrepeat;
        result.backgroundposition = pre.backgroundposition;
        return result;
    }


    /**
     * 同一画像か？
     * @param pre 
     * @param cur 
     */
    public static Equals(pre: ImageInfo, cur: ImageInfo): boolean {

        if (pre && cur) {
            if (pre.backgroundsize !== cur.backgroundsize) return false;
            if (pre.backgroundrepeat !== cur.backgroundrepeat) return false;
            if (pre.backgroundposition !== cur.backgroundposition) return false;
            if (pre.src !== cur.src) return false;
            return true;
        }

        return false;
    }

}
