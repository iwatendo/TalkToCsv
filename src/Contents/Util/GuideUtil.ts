import * as Personal from "../IndexedDB/Personal";
import YouTubeUtil, { YouTubeOption } from "./YouTubeUtil";

interface OnDropUrl { (url: string, embedstatus: string) }

export default class GuideUtil {


    /**
     * ドラック＆ドロップイベントを追加します
     * @param panel 
     * @param onDropUrl 
     */
    public static SetEvent(panel: HTMLElement, onDropUrl: OnDropUrl) {

        //  ガイドエリアのイベント（ドラック＆ドロップ用）
        panel.ondragover = (event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = 'copy';
            panel.focus();
        };

        //  ドロップ時イベント
        panel.ondrop = (event: DragEvent) => {
            event.preventDefault();
            var items = event.dataTransfer.items;
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                if (item.type == "text/uri-list") {
                    item.getAsString((url) => { this.DropUrl(url, onDropUrl); });
                }
            }
        };

    }


    /**
     * ドラック＆ドロップイベント
     * @param url 
     * @param ondropUrl 
     */
    private static DropUrl(url: string, ondropUrl: OnDropUrl) {

        let tubeId = YouTubeUtil.GetYouTubeID(url);

        if (tubeId.length === 0)
            return;

        let option = new YouTubeOption();
        option.id = tubeId;
        let embedUrl = YouTubeUtil.ToEmbedYouTubeURL(tubeId);
        let embedstatus = JSON.stringify(option);

        ondropUrl(embedUrl, embedstatus);
    }

}
