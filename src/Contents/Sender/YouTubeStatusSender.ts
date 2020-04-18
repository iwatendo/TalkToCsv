import Sender from "../../Base/Container/Sender";
import { YouTubeOption } from "../../Contents/Util/YouTubeUtil";

/**
 * 
 */
export default class YouTubeStatusSender extends Sender {

    public static ID = "YouTubeStatus";

    constructor() {
        super(YouTubeStatusSender.ID);

        this.state = -1;
        this.current = -1;
        this.playbackRate = 1;
    }

    state: YT.PlayerState;
    current: number;
    playbackRate: number;


    /**
     * ステータスの一致確認
     * @param s1 
     * @param s2 
     */
    public static IsEqual(s1: YouTubeStatusSender, s2: YouTubeStatusSender) {
        if (s1.state !== s2.state) return false;
        if (s1.current !== s2.current) return false;
        if (s1.playbackRate !== s2.playbackRate) return false;
        return true;
    }


    /**
     * ステータスの近似確認
     * @param s1 
     * @param s2 
     */
    public static IsNeer(s1: YouTubeStatusSender, s2: YouTubeStatusSender) {
        if (s1.state !== s2.state) return false;
        if (s1.playbackRate !== s2.playbackRate) return false;
        if (Math.abs(s1.current - s2.current) < 2.0 ) return false;
        return true;
    }
    
}