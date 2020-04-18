import * as React from 'react';
import * as ReactDOM from 'react-dom';

import StdUtil from "../../../Base/Util/StdUtil";
import AbstractDialogController from "../../../Contents/AbstractDialogController";

import ActorInfo from '../../../Contents/Struct/ActorInfo';

import HomeVisitorController from "../HomeVisitorController";
import ActorDialogComponent from "./ActorDialogComponent";


export default class ActorDialog extends AbstractDialogController<HomeVisitorController, ActorInfo> {


    /**
     * 
     * @param controller 
     */
    public constructor(controller: HomeVisitorController) {
        super(controller, "プロフィール", "account_box");
    }


    /**
     * 
     * @param actor 
     */
    protected Initialize(actorInfo: ActorInfo) {

        //  アクター情報の取得
        let key = actorInfo.aid;
        let element = this.ViewElement();
        ReactDOM.render(<ActorDialogComponent key={key} controller={this.Controller} actorInfo={actorInfo} />, element, () => {
        });
    }

}


