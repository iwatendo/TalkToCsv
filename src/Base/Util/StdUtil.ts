import platform = require("platform");

interface OnGetMobleDeviceId { (deviceId: string): void }

export default class StdUtil {

    public static UserID: string = StdUtil.CreateUserID();

    /**
     *  ユーザーID / 初回起動時にランダムで設定されます
     */
    private static CreateUserID(): string {

        let userid = localStorage.getItem('user-id');

        if (!userid) {
            userid = StdUtil.CreateUuid();
            localStorage.setItem('user-id', userid);
        }
        return userid;
    }


    /**
     * サポートブラウザか？
     * @param isGeneral 
     */
    public static IsSupoortPlatform(isGeneral: boolean = false, useSpeechRecognition: boolean = true): boolean {

        //  対応ブラウザかチェック
        let name = platform.name.toLocaleLowerCase();

        if (name === 'chrome' || name === 'chrome mobile' || name === 'microsoft edge') {

            if (useSpeechRecognition) {
                let ua = navigator.userAgent;
                if (ua.indexOf('Edg') < 0) {
                    return true;
                }
                else{
                    //  Microsoft EdgeもSpeechRecognitionに対応した為、サポートブラウザとする
                    //  但し、挙動が重い部分があるため、判定処理は残しておく
                    return true;
                }
            }
            else {
                return true;
            }
        }

        let errmsg = "";

        if (isGeneral) {
            if (name === 'firefox' || name === 'firefox for ios') {
                return true;
            }
            else if (name === 'safari') {
                if (platform.version >= '10.2') {
                    return true;
                }
                else {
                    errmsg = '未対応のブラウザバージョンです。\niOS11.2以降に対応しています';
                }
            }
            errmsg = "未対応のブラウザです\n";
            errmsg += "このページは以下のブラウザに対応しています\n"
            errmsg += "\n";
            errmsg += "・FireFox\n";
            errmsg += "・Google Chrome\n";
            errmsg += "・Safari\n";
        }
        else {
            errmsg = "未対応のブラウザです。\n";
            errmsg = "このページは Google Chrome にのみ対応しています"
        }

        errmsg += "\n\nお使いのブラウザは\n" + name + " です";

        alert(errmsg);
    }


    /**
     * 動作するブラウザかチェック
     * ※現状は Google Chromeにのみ対応
     */
    public static IsSupportBrowser(isLiveCast: boolean): boolean {

        //  対応ブラウザかチェック
        let name = platform.name.toLocaleLowerCase();

        if (name === 'chrome') return true;
        if (name === 'firefox') return true;
        if (name === 'safari') {
            return (platform.version >= '10.2');
        }
        return false;
    }


    /**
     * 
     */
    public static IsSafari() {

        if (platform) {
            return (platform.name.toLowerCase() === "safari");
        }
        else {
            return false;
        }
    }


    /**
     * 
     * @param ua 
     */
    public static IsIOS(ua: string) {
        let pf = platform.parse(ua);

        if (pf && pf.os) {
            let osname = pf.os.toString().toLowerCase();
            return (osname.indexOf("ios ") === 0);
        }
        else {
            return false;
        }
    }


    /**
     * mobile端末か判定
     */
    public static IsMobile() {
        let ua = navigator.userAgent;
        if (ua.indexOf('iPhone') > 0 || ua.indexOf('iPod') > 0 || (ua.indexOf('Android') > 0) && (ua.indexOf('Mobile') > 0) || ua.indexOf('Windows Phone') > 0) {
            return true;
        } else if (ua.indexOf('iPad') > 0 || ua.indexOf('Android') > 0) {
            return true;
        }
        return false;
    }


    /**
     * Arrayの重複を除去する
     * @param list 
     */
    public static Uniq<T>(list: Array<T>): Array<T> {

        let map = new Map<T, T>();

        list.forEach((value) => {
            map.set(value, value);
        });

        let result = new Array<T>();

        map.forEach((value, key) => {
            result.push(key);
        });

        return result;
    }


    /**
     * ハッシュコード生成
     * @param value 
     */
    public static ToHashCode(value): number {

        let hash = 0;

        if (value.length == 0) {
            return hash;
        }

        for (let i: number = 0; i < value.length; i++) {
            let char = value.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }

        return hash;
    }


    /**
     * ディープコピー
     * ※Date/Function/undefined についてはコピーされないので注意。
     * @param value 
     */
    public static DeepCopy<T>(value: T): T {

        //  http://qiita.com/seihmd/items/74fa9792d05278a2e898
        return JSON.parse(JSON.stringify(value));

        //  return Object.assign<T, T>({} as T, value);
    }


    /**
     * 日付の表示変換
     * @param date
     */
    public static ToDispDate(date: Date) {
        return date.getFullYear()
            + "-" + ("0" + (date.getMonth() + 1)).slice(-2)
            + "-" + ("0" + date.getDate()).slice(-2)
            + " " + ("0" + date.getHours()).slice(-2)
            + ":" + ("0" + date.getMinutes()).slice(-2)
            + ":" + ("0" + date.getSeconds()).slice(-2)
            //  + "." + ("00" + date.getMilliseconds()).slice(-3)
            ;
    }

    /**
     * UUIDの生成
     */
    public static CreateUuid(): string {

        let result: string = "";

        for (let i = 0; i < 32; i++) {

            let random: number = Math.random() * 16 | 0;

            if (i == 8 || i == 12 || i == 16 || i == 20)
                result += "-"

            result += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random)).toString(16);
        }
        return result;
    }


    /**
     * ユニークキーの生成
     */
    public static UniqKey(): string {
        return this.CreateUuid();
    }


    /**
     * XSS対策及び改行コード変換
     * @param msg
     */
    public static ToHtml(msg: string): string {
        msg = this.htmlspecialchars(msg);

        //  HTMLリンクをリンクにする
        let exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
        msg = msg.replace(exp, "<a target='_blank' href='$1'>$1</a>");

        return msg.replace(/\n/g, '<br/>');
    }


    /**
     * XSS対策
     * @param ch
     */
    public static htmlspecialchars(ch: string): string {
        ch = ch.replace(/&/g, "&amp;");
        ch = ch.replace(/"/g, "&quot;");
        ch = ch.replace(/'/g, "&#039;");
        ch = ch.replace(/</g, "&lt;");
        ch = ch.replace(/>/g, "&gt;");
        return ch;
    }


    /**
     * テキストを改行コードでsplit
     * @param value 
     */
    public static TextLineSplit(value: string): Array<string> {

        if (value.indexOf('\n') < 0) {
            let result = new Array<string>();
            result.push(value);
            return result;
        }
        else {
            //  改行コードがある場合の制御
            let msgs = value.split('\n');

            //  最終行が空の場合は除去
            if (msgs[msgs.length - 1].length == 0) {
                msgs = msgs.slice(0, msgs.length - 1);
            }

            return msgs;
        }
    }


    /**
     * ページへのデフォルトドロップイベントを発生させなくする
     */
    public static StopPropagation() {

        document.ondrop = (e) => {
            e.stopPropagation();
            e.preventDefault();
        };

        document.ondragover = (e) => {
            e.stopPropagation();
            e.preventDefault();
        };
    }


    /**
     * タッチパネルイベントの抑制（スライドでのページ遷移の抑制）
     */
    public static StopTouchMove() {

        if (!(window as any).TouchEvent) {
            return;
        }

        //  PullToRefresh対策
        //  http://qiita.com/sundaycrafts/items/5ad6bbea8800ad3d764b
        //  http://elsur.xyz/android-preventdefault-error
        //  を参考に実装
        //  無効化できない端末がありますが、現状では致命的な問題では無い為、保留します。
        let preventPullToRefresh = ((lastTouchY) => {

            lastTouchY = lastTouchY || 0;
            let maybePrevent = false;

            function setTouchStartPoint(e) {
                lastTouchY = e.touches[0].clientY;
            }

            function isScrollingUp(e) {
                let touchY = e.touches[0].clientY;
                let touchYDelta = touchY - lastTouchY;
                lastTouchY = touchY;
                return (touchYDelta > 0);
            }

            return {
                touchstartHandler: (e) => {
                    if (e.touches.length != 1) return;

                    setTouchStartPoint(e);
                    maybePrevent = (window.pageYOffset === 0);
                },
                touchmoveHandler: (e) => {

                    if (maybePrevent) {
                        maybePrevent = false;
                        if (isScrollingUp(e)) {
                            e.preventDefault();             //  prevantDefaultでは無効化できない？
                            e.stopImmediatePropagation();   //  Nexus7の場合、これで無効化できるが、Nexus9では無効化できない
                            return;
                        }
                    }
                }
            }
        })();

        document.addEventListener('touchstart', preventPullToRefresh.touchstartHandler);
        document.addEventListener('touchmove', preventPullToRefresh.touchmoveHandler);
    }


    /**
     * タッチでのズームを禁止します
     * ※Safariにのみに適用されます。Androidでは無効化できません。
     */
    public static StopTouchZoom() {

        //  ピッチイン、ピッチアウトによる拡大縮小を禁止
        document.documentElement.addEventListener('touchstart', (te: TouchEvent) => {

            let el = te.srcElement;

            //  ビデオエレメントのタッチは無条件にキャンセル
            if (el && el instanceof HTMLVideoElement) {
                te.preventDefault();
            }

            if (te.touches.length > 1) {
                event.preventDefault();
            }

        }, false);

        var lastTouchEnd = 0;
        document.documentElement.addEventListener('touchend', (te: TouchEvent) => {
            var now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, false);

    }



    /**
     * クリップボードに指定テキストをコピーします
     * @param text 
     */
    public static ClipBoardCopy(text: string): boolean {

        var element: HTMLTextAreaElement = document.createElement('textarea');

        element.value = text;
        element.selectionStart = 0;
        element.selectionEnd = element.value.length;

        var s = element.style;
        s.position = 'fixed';
        s.left = '-100%';

        document.body.appendChild(element);
        element.focus();

        var result = document.execCommand('copy');
        element.blur();
        document.body.removeChild(element);

        return result;
    }

    /**
     * スリープ関数
     * @param milliseconds 
     */
    public static Sleep(milliseconds: number) {
        return new Promise<void>(resolve => { setTimeout(() => resolve(), milliseconds); });
    }

}
