
import StdUtil from "../Base/Util/StdUtil";
import FileUtil from "../Base/Util/FileUtil";
import ImageInfo from "../Base/Container/ImageInfo";
import * as Enum from "../Base/Container/ImageInfo";
import FileAttachUtil from "../Base/Util/FileAttachUtil";


interface OnChangeImage { (imageRec: ImageInfo): void }



/**
 * イメージダイアログはどの処理からも呼べるように
 * Static関数を追加
 */
export default class ImageDialogController {


    private static _dialog: ImageDialogController = new ImageDialogController('sbj-image-dialog');

    private _imageBackgroundElement = document.getElementById("sbj-image-background");
    private _imageView = document.getElementById("sbj-image-view");
    private _attachButton = document.getElementById("sbj-image-attach") as HTMLButtonElement;
    private _cameraButton = document.getElementById("sbj-image-camera") as HTMLButtonElement;
    private _imageDropMsg = document.getElementById("sbj-image-drop-msg");



    /**
     * 
     */
    public static Add(callback: OnChangeImage) {
        this.Start(true, false, false, new ImageInfo(), callback);
    }


    /**
     * 
     */
    public static Edit(image: ImageInfo, callback: OnChangeImage) {
        this.Start(false, true, false, image, callback);
    }


    /**
     * 
     */
    public static Delete(image: ImageInfo, callback: OnChangeImage) {
        this.Start(false, false, true, image, callback);
    }


    /**
     * 
     * @param canAdd 
     * @param canEdit 
     * @param canDelete 
     * @param image 
     * @param callback 
     */
    private static Start(canAdd: boolean, canEdit: boolean, canDelete: boolean, image: ImageInfo, callback: OnChangeImage) {

        document.getElementById('sbj-image-done').hidden = !canAdd;
        document.getElementById('sbj-image-update').hidden = !canEdit;
        document.getElementById('sbj-image-delete').hidden = !canDelete;

        //  削除のみの場合は編集できないようにする
        let canIconChange = (!canAdd && !canEdit && canDelete);
        document.getElementById('sbj-image-attach').hidden = canIconChange;
        document.getElementById('sbj-image-css-edit-check').hidden = canIconChange;

        //  CSS編集をOFFにする
        document.getElementById('sbj-image-css-edit-check').classList.remove('is-checked');
        let cssEditElement = document.getElementById('sbj-image-css-edit') as HTMLInputElement;
        cssEditElement.checked = false;

        this._dialog.SetCssEditMode(false);
        this._dialog.SetImage(image);
        this._dialog.Show(callback);
    }


    private _dialog: any;
    private _image: ImageInfo;
    private _owner_callback: OnChangeImage;

    private _bgsizeMap: Map<Enum.BgSizeEnum, HTMLElement> = null;
    private _bgposMap: Map<Enum.BgPosEnum, HTMLElement> = null;

    /**
     * コンストラクタ
     * @param dialogName イメージダイアログのID
     */
    public constructor(dialogName: string) {

        StdUtil.StopPropagation();

        this._dialog = document.getElementById(dialogName) as any;
        this._image = new ImageInfo();

        this._imageBackgroundElement.onclick = (ev) => {
            if (ev.target == this._imageBackgroundElement)
                this.Close();
        };

        FileAttachUtil.SetImageDropEvenet(
            this._imageView,
            this._attachButton,
            this._cameraButton,
            (file, src) => {
                let rec = this.CreateImageRec(src);
                this.SetImage(rec);
            }
        );

        //  CSS設定
        this._bgsizeMap = this.CreateBackgoundSizeMap();
        this._bgposMap = this.CreateBackgroundPostionMap();

        //  イベント設定
        this._bgposMap.forEach((element, key) => element.onclick = (e) => this.Refresh(null, key));
        this._bgsizeMap.forEach((element, key) => element.onclick = (e) => this.Refresh(key, null));

        document.getElementById('sbj-image-done').onclick = (() => this.Done());
        document.getElementById('sbj-image-update').onclick = (() => this.Done());
        document.getElementById('sbj-image-delete').onclick = (() => this.Delete());
        document.getElementById('sbj-image-close').onclick = (() => this.Close());
        document.getElementById('sbj-image-cancel').onclick = (() => this.Close());

        let cssEditElement = document.getElementById('sbj-image-css-edit') as HTMLInputElement;
        cssEditElement.onchange = (() => this.SetCssEditMode(cssEditElement.checked));
        this.SetCssEditMode(false);
    }


    /**
     * 
     */
    public CreateBackgoundSizeMap(): Map<Enum.BgSizeEnum, HTMLElement> {

        let result = new Map<Enum.BgSizeEnum, HTMLElement>();

        result.set(Enum.BgSizeEnum.Cover, document.getElementById('sbj-image-cover'));
        result.set(Enum.BgSizeEnum.Contain, document.getElementById('sbj-image-contain'));

        return result;
    }


    /**
     * 
     */
    public CreateBackgroundPostionMap(): Map<Enum.BgPosEnum, HTMLElement> {

        let result = new Map<Enum.BgPosEnum, HTMLElement>();
        result.set(Enum.BgPosEnum.Center, document.getElementById('sbj-image-center'));
        result.set(Enum.BgPosEnum.Top, document.getElementById('sbj-image-top'));
        result.set(Enum.BgPosEnum.Bottom, document.getElementById('sbj-image-bottom'));
        result.set(Enum.BgPosEnum.Left, document.getElementById('sbj-image-left'));
        result.set(Enum.BgPosEnum.Right, document.getElementById('sbj-image-right'));
        return result;
    }


    /**
     * 
     * @param isShowEdit 
     */
    public SetCssEditMode(isShowEdit: boolean) {
        this._bgsizeMap.forEach((element, key) => element.hidden = !isShowEdit);
        this._bgposMap.forEach((element, key) => element.hidden = !isShowEdit);
    }


    /**
     * イメージダイアログの表示
     * @param callback 
     */
    public Show(callback: OnChangeImage) {
        this._owner_callback = callback;
        this._dialog.showModal();
    }


    /**
     * 画像データの追加／更新
     */
    private Done() {
        this._owner_callback(this._image);
        this.Close();
    }


    /**
     * 画像データの削除
     */
    private Delete() {
        this._owner_callback(null);
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


    /**
     * 画像データ生成
     * @param src
     */
    private CreateImageRec(src): ImageInfo {
        let rec = new ImageInfo();
        rec.src = src;
        this._image = rec;
        return rec;
    }


    /**
     * 画像の再描画とCSSアイコンの設定
     * @param bg_size
     * @param bg_pos 
     */
    private Refresh(bg_size: Enum.BgSizeEnum, bg_pos: Enum.BgPosEnum) {

        if (this._image) {

            if (bg_size !== null) {
                this._image.backgroundsize = bg_size;
            }

            if (bg_pos !== null) {
                this._image.backgroundposition = bg_pos;
            }

            this.SetImage(this._image);
        }
    }


    /**
     * 画像の表示
     * @param image
     */
    private SetImage(image: ImageInfo) {

        if (image == null) {
            image = new ImageInfo();
        }

        this._image = image;

        let imgStyle = this._imageView.style;

        imgStyle.width = "424px";
        imgStyle.height = "424px";


        if (image.src == null || image.src.length == 0) {
            imgStyle.background = "";
            this.SetEditButtonDisabled(true);
        } else {
            this.SetEditButtonDisabled(false);
        }

        //  画像のCSS変更
        ImageInfo.SetCss(this._imageView.id, image);

        //  CSS選択アイコンの変更
        this._bgsizeMap.forEach((value, key) => value.classList.remove('sbj-image-css-selection'));
        this._bgsizeMap.get(image.backgroundsize).classList.add('sbj-image-css-selection');

        this._bgposMap.forEach((value, key) => value.classList.remove('sbj-image-css-selection'));
        this._bgposMap.get(image.backgroundposition).classList.add('sbj-image-css-selection');
    }


    /**
     * 追加/更新ボタンの制御
     * @param disabled 
     */
    private SetEditButtonDisabled(disabled: boolean) {
        (document.getElementById('sbj-image-done') as HTMLInputElement).disabled = disabled;
        (document.getElementById('sbj-image-update') as HTMLInputElement).disabled = disabled;
        this._imageDropMsg.hidden = !disabled;
    }

}


