import { Actor } from "../IndexedDB/Personal";

/**
 * アクター情報
 */
export default class ActorInfo {

    /**
     * 
     * @param peerid ピアID
     * @param uid ユーザーID
     * @param actor アクター情報
     */
    constructor(peerid: string, uid: string, actor: Actor) {
        this.peerid = peerid;
        this.uid = uid;
        this.aid = actor.aid;
        this.iid = actor.dispIid;
        this.isUser = actor.isUserProfile;
        this.name = actor.name;
        this.tag = actor.tag;
        this.profile = actor.profile;
    }

    peerid: string;
    uid: string;
    aid: string;
    iid: string;
    isUser: boolean;
    name: string;
    tag: string;
    profile: string;


    /**
     * 変更されたか？
     * @param pre 
     * @param cur 
     */
    public static IsChange(pre: ActorInfo, cur: ActorInfo) {
        return !(pre.name === cur.name && pre.tag === cur.tag && pre.profile === cur.profile);
    }
}