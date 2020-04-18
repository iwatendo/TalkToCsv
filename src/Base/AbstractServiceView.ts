import Sender from "./Container/Sender";
import IServiceController from "./IServiceController";
import IServiceView from "./IServiceView";

export interface OnViewLoad { (): void };

/*
 *
 */
export default abstract class AbstractServiceView<T extends IServiceController> implements IServiceView {


    private _controller: T = null;


    /**
     * コンストラクタ
     * @param serviceController
     */
    constructor(serviceController: T, callback: OnViewLoad) {
        this._controller = serviceController;
        this.Initialize(callback);
    }


    protected get Controller(): T {
        return this._controller;
    }


    protected abstract Initialize(callback: OnViewLoad);

}
