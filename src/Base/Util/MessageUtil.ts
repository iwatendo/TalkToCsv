export class AutoLinkInfo {

    constructor(isLink: boolean, isImage: boolean, msg: string) {
        this.isLink = isLink;
        this.isImage = isImage;
        this.msg = msg;
    }

    isLink: boolean;
    isImage: boolean;
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

            //  画像データ有無
            let imageRe = /\[\[.*?\]\]/;
            let imageRega = imageRe.exec(workText);

            if (imageRega) {

                //  画像リンクが検出された場合

                //  画像リンクまでは通常出力
                result.push(new AutoLinkInfo(false, false, workText.substr(0, imageRega.index)));

                //  リンク部分の抽出
                let linkStr = imageRega[0];
                let link = linkStr.substr(2, linkStr.length - 4);
                result.push(new AutoLinkInfo(false, true, link));

                //  処理した部分までを削除し、リンク文字列がなくなるまでループする
                workText = workText.substr(imageRega.index + linkStr.length);
            }
            else {
                let linkRe = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
                let linkRega = linkRe.exec(workText);

                if (linkRega) {

                    //  リンク文字列が検出された場合

                    //  リンク文字列までは通常出力
                    result.push(new AutoLinkInfo(false, false, workText.substr(0, linkRega.index)));

                    //  リンク部分の抽出
                    let linkStr = linkRega[0];
                    let link = workText.substr(linkRega.index, linkStr.length);
                    result.push(new AutoLinkInfo(true, false, linkStr));

                    //  処理した部分までを削除し、リンク文字列がなくなるまでループする
                    workText = workText.substr(linkRega.index + linkStr.length);
                } else {
                    //  リンク文字列が検出されなかった場合は通常出力
                    result.push(new AutoLinkInfo(false, false, workText));
                    workText = "";
                }
            }
        }

        return result;
    }

}