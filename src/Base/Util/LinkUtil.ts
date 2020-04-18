
export default class LinkUtil {

    public static OneTimeKey: string = LinkUtil.CreateOneTimeKey();

    /**
     * URLのPeerIDを取得します
     */
    public static GetPeerID(): string {
        return this.GetArgs('p');
    }


    /**
     * URLのOneTimeKeyを取得します
     */
    public static GetOneTimeKey(): string {
        return this.GetArgs('k');
    }


    /**
     * URLのPidを取得します
     */
    public static GetUrlPid(): number {

        let pid = this.GetArgs('pid');

        if (pid)
            return Number(pid);
        else
            return 0;
    }


    /**
     * URLの引数を取得します
     * @param value
     */
    public static GetArgs(value: string): string {

        return this.GetUrlArgs(location.href, value);
    }


    /**
     * URLの引数を取得します
     * @param url
     * @param value
     */
    public static GetUrlArgs(url: string, value: string): string {

        if (url == null || url.length == 0)
            return null;

        let data = url.split('?');

        if (data.length < 2)
            return null;

        let data2 = data[1].split('&');

        for (let i in data2) {
            let data3 = data2[i].split('=');

            if (data3[0] === value)
                return decodeURIComponent(data3[1]);
        }

        return null;
    }


    /**
     * 
     * @param htmlPath 
     * @param peerid 
     */
    public static CreateLink(htmlPath: string, peerid: string = null): string {

        //  URLは小文字に変換する
        //  ※フォルダ名には大文字が含まれますが、Webサーバー配置時には全て小文字にする為
        htmlPath = htmlPath.toLowerCase();

        let path = window.location.pathname;
        let result: string = "";

        if (htmlPath.indexOf('/') == 0) {
            result = window.location.protocol + htmlPath;
        }
        else {
            let lastpos = path.lastIndexOf('/');

            if (lastpos >= 0) {
                path = path.substring(0, lastpos + 1);
            }

            result = window.location.protocol + "//" + window.location.host + path + htmlPath;
        }

        //  相対パスを絶対パスに変換
        let e: any = document.createElement('span')
        e.insertAdjacentHTML('beforeend', '<a href="' + result + '" />');
        result = e.firstChild.href;

        if (peerid) {
            result += "?k=" + LinkUtil.OneTimeKey + "&p=" + peerid;
        }

        return result;
    }




    /**
     * ワンタイムパスワードを生成します
     */
    public static CreateOneTimeKey(): string {
        let key: string;
        key = LinkUtil.GetOneTimeKey();
        if (!key) {
            key = this.createRandKey(8, "");
        }
        return key;
    }

    /**
     * 
     * @param l 
     * @param r 
     */
    private static createRandKey(l: number, r: string): string {
        r = r ? r : '';
        return l ? LinkUtil.createRandKey(--l, "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz".charAt(Math.floor(Math.random() * 60)) + r) : r;
    }

}
