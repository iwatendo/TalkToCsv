export class AutoLinkInfo {

    constructor(isLink: boolean, msg: string) {
        this.isLink = isLink;
        this.msg = msg;
    }

    isLink: boolean;
    msg: string;
}


export default class MessageUtil {

    /**
     * 文字列に含まれるリンク情報を分解してSplitした配列にする
     * ※ReactでAutoLinkを実現する為の処理
     * @param baseText 
     */
    public static AutoLinkAnaylze(baseText: string): Array<AutoLinkInfo> {

        let workText = baseText;
        let result = new Array<AutoLinkInfo>();

        while (workText.length > 0) {
            let re = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
            let rega = re.exec(workText);

            if (rega) {

                //  リンク文字列が検出された場合

                //  リンク文字列までは通常出力
                result.push(new AutoLinkInfo(false, workText.substr(0, rega.index)));

                //  リンク部分の抽出
                let linkStr = rega[0];
                let link = workText.substr(rega.index, linkStr.length);
                result.push(new AutoLinkInfo(true, linkStr));

                //  処理した部分までを削除し、リンク文字列がなくなるまでループする
                workText = workText.substr(rega.index + linkStr.length);
            } else {
                //  リンク文字列が検出されなかった場合は通常出力
                result.push(new AutoLinkInfo(false, workText));
                workText = "";
            }
        }

        return result;
    }

}