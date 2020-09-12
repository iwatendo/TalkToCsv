import * as SpeechRtm from "../IndexedDB/SpeechRtm";


export default class SpeechRecongnitionTextModify {


    /**
     * 
     */
    private _tables: Array<SpeechRtm.SpeechRtm>;


    /**
     * コンストラクタ
     * @param tables 
     */
    public constructor(tables: Array<SpeechRtm.SpeechRtm>) {
        this._tables = tables;
    }


    /**
     * 変換処理
     * @param text 
     */
    public Modify(baseText: string): string {

        let resultText = baseText;

        for (let rec of this._tables) {
            var reObj = new RegExp(rec.targetText, "g");

            let modifyText = rec.modifyText;
            if (rec.iconUrl) {
                modifyText = `[[${rec.iconUrl}]]${modifyText}`;
            }
            resultText = resultText.replace(reObj, modifyText);
            resultText
        }

        return resultText;
    }

}
