import IconCursorSender from "../Sender/IconCursorSender";

interface CursorFunc { (cursor: IconCursorSender): void }

export default class CursorCache {

    public _map = new Map<string, IconCursorSender>();


    /**
     * カーソル配置のキャッシュ
     * @param cursor
     */
    public Set(cursor: IconCursorSender) {

        let peerid = cursor.visitorPeerId;
        if (cursor.isDisp) {
            this._map.set(peerid, cursor);
        }
        else {
            if (this._map.has(peerid)) {
                this._map.delete(peerid);
            }
        }
    }


    /**
     * カーソル情報の取得
     * @param peerid 
     */
    public Get(peerid: string): IconCursorSender {
        if (this._map.has(peerid)) {
            return this._map.get(peerid);
        }
        else {
            return null;
        }
    }

    /**
     * ピアの切断等によるカーソルの削除
     * @param peerid 
     */
    public Remove(peerid: string) {
        if (this._map.has(peerid)) {
            this._map.delete(peerid);
        }
    }


    /**
     * 
     */
    public forEach(func: CursorFunc) {
        this._map.forEach(func);
    }

}
