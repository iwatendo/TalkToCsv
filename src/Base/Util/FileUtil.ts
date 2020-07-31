

interface OnFileSelect { (file: File) };
interface OnImport { (data: string) };
interface OnImportError { (err: Error) };

/**
 * 
 */
export default class FileUtil {

    /**
     * エクスポートファイルの拡張子
     */
    public static EXPORT_EXT = ".json";

    /**
     * エクスポートのデフォルトファイル名を取得
     * @param name 
     */
    public static GetDefaultFileName(name: string, ext: string = this.EXPORT_EXT) {

        let now = new Date();
        let year = ("0000" + (now.getFullYear().toString())).slice(-4);
        let month = ("0" + (now.getMonth() + 1).toString()).slice(-2);
        let day = ("0" + now.getDate().toString()).slice(-2);
        let hours = ("0" + now.getHours().toString()).slice(-2);
        let min = ("0" + now.getMinutes().toString()).slice(-2);
        let sec = ("0" + now.getSeconds().toString()).slice(-2);

        let datetime = year + month + day + "_" + hours + min + sec;
        
        let filename = "gijilockon_" + datetime;
        if(name){
            filename += name;
        }
        filename += ext;

        return filename;
    }


    /**
     * インポート処理
     * @param file 
     * @param callback 
     * @param errorcb 
     */
    public static Import(file: File, callback: OnImport, errorcb: OnImportError) {

        if (!file || file.name.length === 0)
            return;

        let reader = new FileReader();
        reader.readAsText(file);

        let data: any;
        let hasError = false;

        reader.onload = (ev) => {
            try {
                data = JSON.parse(reader.result.toString());
            }
            catch (err) {
                hasError = true;
                errorcb(err);
            }
        }

        reader.onloadend = (ev) => {
            if (!hasError) {
                callback(data);
            }
        }
    }


    /**
     * エクスポートファイルの選択ダイアログ表示
     * @param callback 
     */
    public static SelectImportFile(callback: OnFileSelect) {
        this.Select(true, this.EXPORT_EXT, false, callback);
    }


    /**
     * 画像ファイルの選択ダイアログ表示
     * @param callback 
     */
    public static SelectImageFile(callback: OnFileSelect) {
        this.Select(false, "image/*", false, callback);
    }


    /**
     * 画像ファイルの選択ダイアログ表示
     * @param callback 
     */
    public static SelectImageCamera(callback: OnFileSelect) {
        this.Select(false, "image/*", true, callback);
    }


    /**
     * ファイル選択ダイアログを開きます
     * @param multiple 
     * @param accept 
     * @param isCamera
     * @param callback 
     */
    private static Select(multiple: boolean = false, accept: string = "", isCamera = false, callback: OnFileSelect) {

        let inputElement: HTMLInputElement = document.createElement("input") as HTMLInputElement;
        inputElement.type = 'file';
        inputElement.hidden = true;
        inputElement.multiple = multiple;
        inputElement.accept = accept;

        if (isCamera) {
            (inputElement as any).capture = 'camera'
        }

        document.body.appendChild(inputElement);

        inputElement.onchange = ((event) => {
            let files = (event.target as any).files as FileList;

            for (let i = 0; i < files.length; i++) {
                callback(files[i]);
            }

            document.body.removeChild(inputElement);
        });

        inputElement.click();
    }


    /**
     * 
     * @param value 
     */
    public static Export(filename: string, value: string) {

        //  出力テキストのフォーマット編集
        let strValue = this.JsonFormatter(value);

        this.str2bytes(strValue, (buffer: ArrayBuffer) => {

            if (window.navigator.msSaveBlob) {
                window.navigator.msSaveBlob(new Blob([buffer], { type: "text/plain" }), filename);
            } else {
                let a: any = document.createElement("a");
                a.href = URL.createObjectURL(new Blob([buffer], { type: "text/plain" }));
                a.download = filename;
                document.body.appendChild(a) //  FireFox specification
                a.click();
                document.body.removeChild(a) //  FireFox specification
            }
        });
    }


    /**
     * 
     * @param value 
     */
    public static ExportCsv(filename: string, value: string) {

        //  出力テキストのフォーマット編集
        let strValue = this.JsonFormatter(value);

        //ファイル作成
        let bom  = new Uint8Array([0xEF, 0xBB, 0xBF]);
        var blob = new Blob([bom, value] , { type: "text/csv;" });        

        if (window.navigator.msSaveBlob) {
            window.navigator.msSaveBlob(blob, filename);
        } else {
            let a: any = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = filename;
            document.body.appendChild(a) //  FireFox specification
            a.click();
            document.body.removeChild(a) //  FireFox specification
        }
    }


    /**
     * Json文字列の加工
     * 改行コードを入れテキストエディタで加工しやすい形にする
     */
    private static JsonFormatter(str: string): string {

        //  以下のような簡易変換の場合
        //  テキスト情報に {}[]が含まれるとエラーになる為、テスト時のみ使用
        // str = str.replace(/},/g, '},\r\n');
        // str = str.replace(/],/g, '],\r\n');
        // str = str.replace(/}],/g, '}\r\n],');
        // str = str.replace(/\[/g, '\[\r\n');

        return str;
    }

    /**
     * 文字列をUTF16に変換
     * @param value 
     */
    private static str2utf16(value:string) : Uint16Array
    {
        var array = [];
        for (var i=0; i<value.length; i++){
        array.push(value.charCodeAt(i));
        }
        return new Uint16Array(array);
    }


    /**
     * 文字列をバイナリに変換
     */
    private static str2bytes(str : string, callback) {
        let fr = new FileReader();
        fr.onloadend = function () {
            callback(fr.result);
        };
        fr.readAsArrayBuffer(new Blob([str],{ type: "text/csv;charset=utf-16;" }));
    }

}