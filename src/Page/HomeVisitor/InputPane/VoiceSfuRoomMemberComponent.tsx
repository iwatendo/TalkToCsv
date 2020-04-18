import * as React from 'react';
import * as ReactDOM from 'react-dom';
import HomeVisitorController from '../HomeVisitorController';
import VoiceChatMemberListSender from '../../../Contents/Sender/VoiceChatMemberListSender';
import StyleCache from '../../../Contents/Cache/StyleCache';


/**
 *  メッセージプロパティ
 */
interface VoiceSfuRoomMemberProp {
    controller: HomeVisitorController;
    memberList: VoiceChatMemberListSender;
}

/**
 *  
 */
export class VoiceSfuRoomMemberComponent extends React.Component<VoiceSfuRoomMemberProp, any>{

    /**
     *  描画処理
   　*/
    public render() {

        let iconDivs = this.props.memberList.Members.map((vcm) => {
            if (vcm.iid) {
                let imgstyle = StyleCache.GetIconStyle(vcm.iid);
                return (<div className='sbj-voicechat-member-img-box'><div className='sbj-voicechat-member-img' style={imgstyle}></div></div>);
            }
            else {
                return (<div></div>);
            }
        });

        return (
            <div id='sbj-voicechat-member'>
                {iconDivs}
            </div>
        );
    }

}


