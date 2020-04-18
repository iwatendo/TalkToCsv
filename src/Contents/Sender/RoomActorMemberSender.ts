import ActorInfo from "../../Contents/Struct/ActorInfo";
import Sender from "../../Base/Container/Sender";


/**
 * ルームに接続しているアクターメンバー情報
 */
export default class RoomActorMemberSender extends Sender {

    public static ID = "RoomActorMember";

    constructor() {
        super(RoomActorMemberSender.ID);
    }

    hid: string;
    members: Array<ActorInfo>;


    /**
     * 指定アクターが含まれているか？
     * @param ram 
     * @param aid 
     */
    public static Exist(ram: RoomActorMemberSender, aid: string): boolean {

        let result = false;

        if (ram.members) {
            ram.members.forEach((ai) => {
                if (ai.aid === aid) {
                    result = true;
                }
            });
        }
        return result;
    }


    /**
     * 指定のPeerが含まれているか？
     * @param peerid 
     */
    public static ExistPeer(ram: RoomActorMemberSender, peerid: string): boolean {
        let result = false;
        if (ram.members) {
            ram.members.forEach((n) => {
                if (n.peerid === peerid) {
                    result = true;
                }
            });
        }
        return result;
    }

}
