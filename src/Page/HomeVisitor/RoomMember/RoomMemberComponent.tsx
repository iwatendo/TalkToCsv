import * as React from 'react';
import * as ReactDOM from 'react-dom';

import * as Personal from "../../../Contents/IndexedDB/Personal";

import HomeVisitorController from "../HomeVisitorController";
import RoomMemberItemComponent from "./RoomMemberItemComponent";

import ActorInfo from "../../../Contents/Struct/ActorInfo";
import RoomActorMemberSender from '../../../Contents/Sender/RoomActorMemberSender';


/**
 * プロパティ
 */
export interface RoomMemberProp {
    controller: HomeVisitorController;
    roomActorMember: RoomActorMemberSender;
}


export default class RoomMemberComponent extends React.Component<RoomMemberProp, any> {


    /**
     * 
     */
    public render() {

        let actorMap = new Map<string, Array<ActorInfo>>();

        this.props.roomActorMember.members.map((ai) => {

            let uid = ai.uid;

            if (!actorMap.has(uid)) {
                actorMap.set(uid, new Array<ActorInfo>());
            }
            actorMap.get(uid).push(ai);

        });

        let actorTable;

        if (actorMap) {

            let list = new Array<Array<ActorInfo>>();
            actorMap.forEach((value, key) => { list.push(value) });

            actorTable = list.map((actors) => {
                let first = actors[0];
                let peerid = first.peerid;
                let uid = first.uid;
                return (<RoomMemberItemComponent key={uid} controller={this.props.controller} ownerAid={uid} ownerPeerId={peerid} actors={actors} />);
            });
        }

        return (
            <div>
                {actorTable}
            </div>
        );
    }

}
