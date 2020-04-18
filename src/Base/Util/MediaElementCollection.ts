
/**
 * 不特定多数で利用するボイスチャット等にて
 * 動的に生成するMediaElement(HTMLVideoElement)の管理クラス
 */
export default class MediaElementCollection {

    private _preElement: HTMLVideoElement = null;
    private _elementMap = new Map<string, HTMLVideoElement>();
    private _peerList = new Array<string>();


    /**
     * MediaElementを生成しているPeerListの一覧を取得します
     */
    public get PeerList(): Array<string> {
        return this._peerList;
    }


    /**
     * 
     * @param peerid
     */
    private GetElement(peerid: string): HTMLVideoElement {
        if (this._elementMap.has(peerid)) {
            return this._elementMap.get(peerid);
        }
        else {
            let newElement = this.CreateVideoElement(peerid);
            newElement.id = peerid;
            this._elementMap.set(peerid, newElement);
            return newElement;
        }
    }


    /**
     * 
     * @param peerid 
     */
    private CreateVideoElement(peerid: string): HTMLVideoElement {

        let result: HTMLVideoElement = this._preElement;
        if (result === null) {
            result = document.createElement('video');
        }
        result.id = peerid;
        this._preElement = null;
        return result;
    }


    /**
     * ストリーム設定前に事前にPlay状態にしておく
     */
    public PrePlay() {
        this._preElement = document.createElement('video');
        this._preElement.muted = false;
        this._preElement.autoplay = true;
        this._preElement.setAttribute('playsinline', 'true');
    }


    /**
     * 
     * @param peerid 
     * @param stream 
     */
    public SetStream(peerid: string, stream: MediaStream) {

        let element = this.GetElement(peerid);

        if (element) {
            element.srcObject = stream;
            element.play();
        }

        if (this._peerList.filter((p) => p === peerid).length === 0) {
            this._peerList.push(peerid);
        }
    }


    /**
     * 
     * @param peerid 
     * @param stream 
     */
    public RemoveStream(peerid: string, stream: any) {
        let element = this.GetElement(peerid);

        if (element) {
            element.pause();
        }

        if (this._peerList.filter((p) => p === peerid).length === 0) {
            this._peerList = this._peerList.filter((p) => p !== peerid);
        }
    }

}
