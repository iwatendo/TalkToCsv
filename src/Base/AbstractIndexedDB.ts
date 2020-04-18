import FileUtil from "./Util/FileUtil";

interface OnCreateDB { (): void };
export interface OnRemoveDB { (): void };
interface ObtainWritekey<T> { (T): string };
interface OnReadObject<T> { (T): void };
interface OnWriteDB<T> { (): void };
interface OnDeleteObject<T> { (): void };
interface OnClearObject<T> { (): void };
interface OnConnect { (): void };
export interface OnLoadComplete<T> { (data: T): void }
export interface OnWriteComplete { (): void }


export default abstract class AbstractIndexedDB<D> {

    protected _dbname: string;
    protected _db: IDBDatabase;
    protected _storelist: Array<string>;


    /**
     * コンストラクタ
     * @param dbName データベース名
     */
    constructor(dbName: string) {
        this._dbname = dbName;
        this._storelist = new Array<string>();
    }


    /**
     * 
     * @param storeName
     */
    protected SetStoreList(storeName: string) {
        this._storelist.push(storeName);
    }


    /**
     * IndexedDBの構築
     * @param onCreate 
     */
    protected Create(onCreate: OnCreateDB) {
        let rep: IDBOpenDBRequest = window.indexedDB.open(this._dbname, 2);
        rep.onupgradeneeded = (e) => { this.CreateStore(e) };
        rep.onsuccess = (e) => { onCreate(); };
        rep.onerror = (e) => { this.RequestError(e, rep); };
    }


    /**
     * ストア生成
     * @param event 
     */
    private CreateStore(event: IDBVersionChangeEvent) {
        this._db = (<IDBRequest>event.target).result;
        this._storelist.forEach((s) => this._db.createObjectStore(s));
    }


    /**
     * IndexedDBを削除
     * @param onRemove 
     */
    public Remove(onRemove: OnRemoveDB) {

        if (this._db)
            this._db.close();

        let req = window.indexedDB.deleteDatabase(this._dbname);
        req.onsuccess = (e) => { onRemove(); };
        req.onerror = (e) => { this.RequestError(e, req); }

        req.onblocked = (e: IDBVersionChangeEvent) => {
            //
        };

        req.onupgradeneeded
    }


    /**
     * IndexedDBに接続
     * @param onconnect 
     */
    public Connect(onconnect: OnConnect) {

        let rep: IDBOpenDBRequest = window.indexedDB.open(this._dbname, 2);

        rep.onupgradeneeded = (e) => { this.CreateStore(e); }

        rep.onerror = (e) => { alert(rep.error.toString()); };

        rep.onsuccess = (e) => {
            this._db = rep.result;
            onconnect();
        };
    }


    /**
     * リクエストエラー発生時の処理
     * @param e 
     * @param req 
     */
    private RequestError(e: Event, req: IDBRequest) {
        if (req && req.error) {
            alert(req.error.toString());
        }
        else {
            alert("Unknown request error in IndexedDB.");
        }
    }


    /**
     * トランザクションの生成
     * @param storeName 
     * @param mode 
     */
    public CreateTransaction(storeName: string | string[], mode: IDBTransactionMode): IDBTransaction {

        let trans = this._db.transaction(storeName, mode);

        trans.onabort = (ev) => {
            let msg = "IndexedDB Transaction Abort\n";
            if (trans.error) {
                msg += trans.error.toString();
            }
            alert(msg);
        }

        trans.onerror = (e) => {
            let msg = "IndexedDB Transaction Error\n";
            if (trans.error) {
                msg += trans.error.toString();
            }
            alert(msg);
        }

        return trans;
    }


    /**
     * データ登録
     * @param storeName ストア名
     * @param key 登録キー
     * @param data 登録データ
     * @param callback 登録成功時のコールバック
     */
    public Write<T>(storeName: string, key: IDBValidKey, data: T, callback: OnWriteDB<T>, trans: IDBTransaction = null) {

        if (!trans) {
            trans = this.CreateTransaction(storeName, 'readwrite');
        }
        let store = trans.objectStore(storeName);

        if (key) {
            let req = store.put(data, key);

            req.onerror = (e) => { this.RequestError(e, req); };

            if (callback != null) {
                req.onsuccess = (e) => {
                    callback();
                }
            }

        }
        else {
            alert("Store key is empty.");
        }
    }


    /**
     * データ削除
     * @param storeName ストア名称
     * @param key 削除対象のデータキー
     * @param callback 削除成功時のコールバック
     */
    public Delete<T>(storeName: string, key: IDBKeyRange | IDBValidKey, callback: OnDeleteObject<T>, trans: IDBTransaction = null) {

        if (!trans) {
            trans = this.CreateTransaction(storeName, 'readwrite');
        }
        let store = trans.objectStore(storeName);
        let req = store.delete(key);

        req.onerror = (e) => { this.RequestError(e, req); }

        if (callback != null) {
            req.onsuccess = (e) => { callback(); }
        }
    }


    /**
     * データ一括登録
     * @param storeName ストア名称
     * @param getkey 登録キー生成関数
     * @param datalist データリスト
     * @param callback データ登録成功時のコールバック
     */
    public WriteAll<T>(storeName: string, getkey: ObtainWritekey<T>, datalist: Array<T>, callback: OnWriteDB<T>, trans: IDBTransaction = null) {

        if (!trans) {
            trans = this.CreateTransaction(storeName, 'readwrite');
        }

        let worklist = datalist.concat();

        let writefunc = (data) => {

            if (data == undefined) {
                if (callback != null)
                    callback();
            }
            else {
                this.Write(storeName, getkey(data), data, () => {
                    writefunc(worklist.pop());
                }, trans);
            }
        };

        writefunc(worklist.pop());

    }


    /**
     * データ読込処理
     * @param storeName ストア名
     * @param key 読込データキー 
     * @param callback 読込成功時のコールバック
     */
    public Read<T, K extends string | IDBKeyRange>(storeName: string, key: K, callback: OnReadObject<T>, trans: IDBTransaction = null) {

        if (!trans) {
            trans = this.CreateTransaction(storeName, 'readonly');
        }
        let store = trans.objectStore(storeName);
        let req = store.get(key);

        req.onerror = (e) => { this.RequestError(e, req); }
        req.onsuccess = (e) => { callback(req.result); };
    }


    /**
     * ストア内データの一括読込
     * @param storeName ストア名
     * @param callback 読込成功時のコールバック
     */
    public ReadAll<T>(storeName: string, callback: OnReadObject<Array<T>>, trans: IDBTransaction = null) {

        this._db.onerror = (e) => {
            alert(e.target)
        }
        if (!trans) {
            trans = this.CreateTransaction(storeName, 'readonly');
        }
        let store = trans.objectStore(storeName);
        let req = store.openCursor();

        let result: Array<T> = new Array<T>();

        req.onerror = (e) => { this.RequestError(e, req); }
        req.onsuccess = (e) => {
            let cursor = <IDBCursorWithValue>(req).result;

            if (cursor) {
                let msg = cursor.value as T;
                if (msg)
                    result.push(cursor.value);

                cursor.continue();
            }
            else {
                callback(result);
            }
        };

    }


    /**
     * ストア内データの一括削除
     * @param storeName ストア名
     * @param callback 削除成功時のコールバック
     */
    public ClearAll<T>(storeName: string, callback: OnClearObject<T>) {

        let trans = this.CreateTransaction(storeName, 'readwrite');
        let store = trans.objectStore(storeName);
        let req = store.openCursor();
        store.clear();
        req.onerror = (e) => { this.RequestError(e, req); };
        req.onsuccess = (e) => { callback(); };

    }

    public abstract GetName(): string;

    public abstract GetNote(): string;

    public abstract ReadAllData(onload: OnLoadComplete<D>);

    public abstract WriteAllData(data: D, callback: OnWriteComplete);

    public abstract IsImportMatch(data: any): boolean;

    public abstract Import(data: D, callback: OnWriteComplete);


    /**
     * データのエクスポート処理
     */
    public Export() {

        let defaultFileName = FileUtil.GetDefaultFileName(this._dbname);

        this.ReadAllData((data) => {
            let str = JSON.stringify(data);
            FileUtil.Export(defaultFileName, str);
        });
    }

}
