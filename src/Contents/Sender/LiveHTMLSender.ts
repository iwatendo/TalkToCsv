import Sender from "../../Base/Container/Sender";
import { EmbedPage, CtrlLayerEnum } from "../IndexedDB/LiveHTML";


/**
 * 
 */
export default class LiveHTMLSender extends Sender {

    public static ID = "LiveHTML";

    constructor(ps: EmbedPage = new EmbedPage()) {
        super(LiveHTMLSender.ID);
        this.pageId = ps.pageId;
        this.pageName = ps.pageName;
        this.pageTag = ps.pageTag;
        this.ctrlLayerMode = ps.ctrlLayerMode;
        this.isAspectFix = ps.isAspectFix;
        this.aspectW = ps.aspectW;
        this.aspectH = ps.aspectH;
        this.layerBackgroundB = ps.layerBackgroundB;
        this.layerBackgroundF = ps.layerBackgroundF;
        this.layerActive = ps.layerActive;
        this.layerControl = ps.layerControl;
    }

    public pageId: string;
    public pageName: string;
    public pageTag : string;
    public ctrlLayerMode: CtrlLayerEnum;
    public isAspectFix: boolean;
    public aspectW: number;
    public aspectH: number;
    public layerBackgroundB: string;
    public layerBackgroundF: string;
    public layerActive: string;
    public layerControl: string;


    public static Equals(s1: LiveHTMLSender, s2: LiveHTMLSender): boolean {
        if (s1.ctrlLayerMode === s2.ctrlLayerMode
            && s1.isAspectFix === s2.isAspectFix
            && s1.aspectH === s2.aspectH
            && s1.aspectW === s2.aspectW
            && s1.layerBackgroundB === s2.layerBackgroundB
            && s1.layerBackgroundF === s2.layerBackgroundF
            && s1.layerActive === s2.layerActive
            && s1.layerControl === s2.layerControl) {
            return true;
        }
        else {
            return false;
        }
    }
}