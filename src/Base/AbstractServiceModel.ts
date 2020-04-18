import Sender from "./Container/Sender";
import IServiceModel from "./IServiceModel";
import IServiceController from "./IServiceController";


export interface OnModelLoad { (): void };
export interface OnWrite { (): void };
export interface OnRead<T> { (result: T): void };
export interface OnPearRead<T, U> { (result1: T, result2: U): void };

/*
 *
 */
export default abstract class AbstractServiceModel<T extends IServiceController> implements IServiceModel {


    private _controller: T = null;

    /**
     * コンストラクタ
     * @param serviceController
     */
    constructor(serviceController: T, callback: OnModelLoad) {
        this._controller = serviceController;
        this.Initialize(callback);
    }


    protected get Controller(): T {
        return this._controller;
    }


    protected abstract Initialize(callback: OnModelLoad);

}
