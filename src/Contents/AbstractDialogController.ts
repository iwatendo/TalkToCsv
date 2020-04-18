import StdUtil from "../Base/Util/StdUtil";
import IServiceController from "../Base/IServiceController";


export enum DialogMode {
    View = 0,
    Append = 1,
    Edit = 2,
    Delete = 3,
    EditDelete = 4,
    Select = 9,
}


interface OnChangeItem<T> { (imageRec: T): void }
interface OnClose { (): void }


/**
 * 汎用ダイアログの抽象化クラス / <dialog>要素を使用しています。
 * https://developer.mozilla.org/ja/docs/Web/HTML/Element/dialog
 */
export default abstract class AbstractDialogController<U extends IServiceController, T> {

    private _dialog = document.getElementById('sbj-dialog') as any;
    private _dialogView = document.getElementById("sbj-dialog-view");
    private _dialogBackground = document.getElementById('sbj-dialog-background');
    private _dialogTitle = document.getElementById("sbj-dialog-title-value");
    private _dialogIcon = document.getElementById("sbj-dialog-title-icon");
    private _sizeElement = document.getElementById('sbj-dialog-card');
    private _doneButton = document.getElementById('sbj-dialog-done') as HTMLButtonElement;
    private _updateButton = document.getElementById('sbj-dialog-update') as HTMLButtonElement;
    private _deleteButton = document.getElementById('sbj-dialog-delete') as HTMLButtonElement;
    private _selectButton = document.getElementById('sbj-dialog-select') as HTMLButtonElement;
    private _cancelButton = document.getElementById('sbj-dialog-close') as HTMLButtonElement;

    private _owner_callback: OnChangeItem<T>;
    private _close_callback: OnClose;
    private _item: T;
    private _dialogMode: DialogMode;
    private _controller: U;
    private _dialog_height: number;
    private _dialog_width: number;

    protected get Controller() {
        return this._controller;
    }

    protected get Mode() {
        return this._dialogMode;
    }


    /**
     * コンストラクタ
     * @param controller 
     * @param title 
     * @param icon 
     * @param width 
     * @param height 
     */
    public constructor(controller: U, title: string, icon: string, width: number = 480, height: number = 540) {

        this._controller = controller;
        StdUtil.StopPropagation();

        this.Title = title;
        this.Icon = icon;

        this.SetDialogSize(height, width);

        this._dialogBackground.onclick = (ev) => {
            if (ev.target === this._dialogBackground) {
                this.Close();
            }
        };

        this._doneButton.onclick = (() => this.Done());
        this._updateButton.onclick = (() => this.Done());
        this._deleteButton.onclick = (() => this.Delete());
        this._selectButton.onclick = (() => this.Done());
        this._cancelButton.onclick = (() => this.Close());
    }

    protected abstract Initialize(item: T);


    /**
     * このエレメントに、メインとなるコンポーネントを配置します。
     */
    public ViewElement(): HTMLElement {
        return this._dialogView;
    }


    /**
     * タイトル設定
     */
    public set Title(title: string) {
        this._dialogTitle.textContent = title;
    }


    /**
     * タイトルアイコン設定
     */
    public set Icon(icon: string) {
        this._dialogIcon.textContent = icon;
    }


    /**
     * ダイアログサイズの変更
     * @param height 
     * @param width 
     */
    public SetDialogSize(height, width) {

        //  サイズ調整
        this._dialog_height = height;
        this._dialog_width = width;

        let card = this._sizeElement;
        card.style.height = height.toString() + "px";
        card.style.width = width.toString() + "px";
        card.style.margin = "-" + (height / 2).toString() + "px 0 0 -" + (width / 2).toString() + "px";
    }


    /**
     * ダイアログの表示
     * @param mode 
     * @param item 
     * @param callback 
     */
    public Show(mode: DialogMode, item: T, callback: OnChangeItem<T>, close_callback: OnClose = null) {

        if (this._dialog && this._dialog.open)
            return;

        this.SetDialogSize(this._dialog_height, this._dialog_width);

        this._doneButton.hidden = !(mode === DialogMode.Append);
        this._updateButton.hidden = !(mode === DialogMode.Edit || mode === DialogMode.EditDelete);
        this._deleteButton.hidden = !(mode === DialogMode.Delete || mode === DialogMode.EditDelete);
        this._selectButton.hidden = !(mode === DialogMode.Select);

        this.Initialize(item);
        this._owner_callback = callback;
        this._close_callback = close_callback;
        this._dialog.showModal();
    }


    /**
     * アクションボタン（選択・更新・確定）のDisabled設定
     * 削除ボタンは押せる状態にしておく
     * @param disabled 
     */
    public SetActionButtonDisabled(disabled: boolean) {
        this._selectButton.disabled = disabled;
        this._doneButton.disabled = disabled;
        this._updateButton.disabled = disabled;
        //  this._deleteButton.disabled = disabled;
    }


    /**
     * 戻り値の設定
     */
    public SetResult(item: T) {
        this._item = item;
    }


    /**
     * データの追加／更新
     */
    public Done() {
        this.Close();
        this._owner_callback(this._item);
    }


    /**
     * データの削除
     */
    public Delete() {
        this.Close();
        this._owner_callback(null);
    }


    /**
     * 終了処理
     */
    public Close() {

        if (this._close_callback) {
            this._close_callback();
        }

        if (this._dialog && this._dialog.open) {
            this._dialog.close();
        }
    }

}


