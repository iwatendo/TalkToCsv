import FileUtil from "./FileUtil";

interface OnDropFile { (file: File, src: string): void }

declare var loadImage: any;

export default class FileAttachUtil {

    public static SetImageDropEvenet(
        viewElement: HTMLElement,
        attachButtonElement: HTMLButtonElement,
        cameraButtonElement: HTMLButtonElement,
        callback: OnDropFile
    ) {

        if (attachButtonElement) {
            //  ファイル選択画面の表示
            attachButtonElement.onclick = (e) => {
                FileUtil.SelectImageFile((file) => {
                    this.FileToBase64(file, callback);
                });
            };
        }

        if (cameraButtonElement) {
            //  カメラの起動
            cameraButtonElement.onclick = (e) => {
                FileUtil.SelectImageCamera((file) => {
                    this.FileToBase64_ChageOrentation(file, callback);
                });
            };
        }

        if (viewElement) {
            //  画像エリアのイベント（ドラック＆ドロップ用）
            viewElement.ondragover = (event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = 'copy';
                viewElement.focus();
            };

            //
            viewElement.ondrop = (event) => {
                event.preventDefault();
                let files: FileList = event.dataTransfer.files;
                if (files.length > 0) {
                    this.FileToBase64(files[0], callback);
                }
                this.UrlToBase64(event.dataTransfer.items, callback);
            };
        }
    }

    /**
     * 指定されたファイルを Base64 形式に変換する
     * @param files
     */
    public static FileToBase64(file: File, callback: OnDropFile) {

        let owner = FileAttachUtil;

        if (file) {
            if (file.type.indexOf('image/') === 0) {
                let reader = new FileReader();
                reader.onload = function (event) {
                    let target = event.target as FileReader;
                    callback(file, target.result.toString());
                };
                reader.readAsDataURL(file);
            }
        }
    }


    /**
     * iPhone等のスマホの写真が回転する為、適切な表示に修正
     * @param file 
     * @param callback 
     */
    public static FileToBase64_ChageOrentation(file, callback) {

        var options = { canvas: true, orientation: undefined };

        loadImage.parseMetaData(file, (data) => {
            if (data.exif) {
                options.orientation = data.exif.get('Orientation');
            }
            loadImage(file, (canvas: HTMLCanvasElement) => {
                canvas.toBlob((blob) => {
                    let reader = new FileReader();
                    reader.onload = function (event) {
                        let target = event.target as FileReader;
                        callback(blob, target.result);
                    };
                    reader.readAsDataURL(blob);
                }, "image/jpeg");
            }, options);
        });
    }


    /**
     * 指定されたURLの画像を Base64 形式に変換する
     * @param itemList
     */
    private static UrlToBase64(itemList, callback: OnDropFile) {

        for (let i = 0, l = itemList.length; i < l; i++) {
            let dti: DataTransferItem = itemList[i];
            if (dti != null && dti.type == 'text/html')
                dti.getAsString((s) => { this.DataTransferItem(s, callback) });
        }
    }


    /**
     * データ変換処理
     * @param value
     */
    private static DataTransferItem(value: string, callback: OnDropFile) {
        let doc: Document = new DOMParser().parseFromString(value, 'text/html');
        let image = doc.images[0];
        if (image) {
            let result = image.attributes.getNamedItem('src').nodeValue;
            callback(null, result);
        }
    }
}