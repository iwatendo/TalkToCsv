import StdUtil from "../../Base/Util/StdUtil";
import LinkUtil from "../../Base/Util/LinkUtil";


export default class MdlUtil {

    /**
     * MDLのチェックボックスの「表示」と、「実際の値」に相違が発生しないようする為の処理
     * @param checkElementName 
     * @param checkLabelElementName 
     * @param checked 
     */
    public static SetChecked(checkElementName: string, checkLabelElementName: string, checked: boolean) {
        (document.getElementById(checkElementName) as HTMLInputElement).checked = checked;
        if (checked) {
            document.getElementById(checkLabelElementName).classList.add('is-checked');
        }
        else {
            document.getElementById(checkLabelElementName).classList.remove('is-checked');
        }
    }

    public static SetColered(elementName: string, value: boolean) {

        let element = (document.getElementById(elementName) as HTMLInputElement);
        if (value) {
            element.classList.add('mdl-button--colored');
        }
        else {
            element.classList.remove('mdl-button--colored');
        }
    }

    /**
     * 
     * @param textElement 
     * @param fieldEleemntName 
     * @param value 
     * @param useInvalid 
     */
    public static SetTextField(textElementName: string, fieldElementName: string, value: string, useInvalid: boolean = false) {

        let textElement = document.getElementById(textElementName) as HTMLInputElement;
        let fieldElement = document.getElementById(fieldElementName);

        if (textElement && fieldElement) {

            value = (value ? value : "");
            textElement.value = value;

            if (value.length > 0) {
                if (useInvalid) fieldElement.classList.remove('is-invalid');
                fieldElement.classList.add('is-dirty');
            }
            else {
                if (useInvalid) fieldElement.classList.add('is-invalid');
                fieldElement.classList.remove('is-dirty');
            }
        }
    }


    /**
     * 
     * @param link 
     * @param linkCopyBtn 
     * @param openBtn 
     * @param qrcode 
     */
    public static SetCopyLinkButton(link: string, label: string, linkCopyBtn: HTMLButtonElement, openBtn: HTMLButtonElement = null, qrcode: HTMLFrameElement = null) {

        if (link) {
            if (linkCopyBtn) {
                linkCopyBtn.onclick = (e) => {
                    StdUtil.ClipBoardCopy(link);
                    linkCopyBtn.textContent = " " + label + "をクリップボードにコピーしました ";
                    linkCopyBtn.classList.remove('mdl-button--raised');
                    linkCopyBtn.classList.remove('mdl-button--colored');
                    linkCopyBtn.classList.add('mdl-button--accent');
                    window.setTimeout(() => {
                        linkCopyBtn.textContent = " " + label + "のコピー ";
                        linkCopyBtn.classList.remove('mdl-button--accent');
                        linkCopyBtn.classList.add('mdl-button--colored');
                        linkCopyBtn.classList.add('mdl-button--raised');
                    }, 2500);
                };
            }

            if (openBtn) {
                openBtn.onclick = (e) => { window.open(link, "_blank"); }
            }

            if (qrcode) {
                qrcode.src = LinkUtil.CreateLink("../QrCode/") + "?linkurl=" + encodeURIComponent(link);
            }

        }

    }

}
