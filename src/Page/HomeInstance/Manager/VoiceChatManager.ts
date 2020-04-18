import HomeInstanceController from "../HomeInstanceController";

import VoiceChatMemberSender from "../../../Contents/Sender/VoiceChatMemberSender";
import VoiceChatMemberListSender from "../../../Contents/Sender/VoiceChatMemberListSender";
import IServiceController from "../../../Base/IServiceController";


export default class VoiceChatManager {

    private _controller: IServiceController;
    private _voiceChatMemberList = new Array<VoiceChatMemberSender>();


    /**
     * コンストラクタ
     * @param controller 
     */
    constructor(controller: IServiceController) {
        this._controller = controller;
    }


    /**
     * ボイスチャットルームの接続メンバ－の管理と通知
     * @param sender 
     */
    public SetMember(sender: VoiceChatMemberSender) : boolean {

        let isAppend = false;

        if (sender.isMember) {
            //  メンバー追加時
            let list = this._voiceChatMemberList.filter((p) => p.peerid === sender.peerid);
            if (list.length === 0) {
                //  メンバー追加時処理
                this._voiceChatMemberList.push(sender);
                isAppend = true;
            }
        }
        else {
            //  メンバー離脱時
            this._voiceChatMemberList = this._voiceChatMemberList.filter((p) => p.peerid !== sender.peerid);
        }
        this.SendMemberList();
        return isAppend;
    }


    /**
     * ボイスチャットのメンバーリストの通知
     */
    public SendMemberList(){
        let listSender = new VoiceChatMemberListSender();
        listSender.Members = this._voiceChatMemberList;
        this._controller.SwPeer.SendAll(listSender);
    }


    /**
     * 
     * @param peerid 
     */
    public RemoveConnection(peerid : string){
        this._voiceChatMemberList = this._voiceChatMemberList.filter((p) => p.peerid !== peerid);
        this.SendMemberList();
    }

}