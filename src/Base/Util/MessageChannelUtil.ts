import Sender from "../Container/Sender";
import IServiceController from "../IServiceController";

interface OnMsg { (sender: Sender): void }


export default class MessageChannelUtil {

    private static _ownerPort: MessagePort = null;
    private static _ports = new Map<string, MessagePort>();
    private static _msg: string;


    /**
     * 
     * @param func 
     */
    public static SetOwner(onmsg: OnMsg) {
        var port: MessagePort;
        window.onmessage = (e: MessageEvent) => {
            let key = e.data;
            port = e.ports[0];
            if (port) {
                this._ports.set(key, port);
                port.postMessage(this._msg);
                port.onmessage = (e) => {
                    onmsg(JSON.parse(e.data) as Sender);
                }
            }
            else {
                if (this._ports.has(key)) {
                    this._ports.delete(key);
                }
            }
        }
    }


    /**
     * 
     * @param controller 
     * @param onmsg 
     */
    public static SetChild(controller: IServiceController, onmsg: OnMsg) {
        var mc = new MessageChannel();
        var port = mc.port1;
        let key = controller.ControllerName();
        if (controller.SwPeer) {
            key += controller.SwPeer.PeerId;
        }
        window.parent.postMessage(key, location.origin, [mc.port2]);
        port.onmessage = (e) => {
            if (e && e.data) {
                onmsg(JSON.parse(e.data) as Sender);
            }
        }
        this._ownerPort = port;
    }


    /**
     * 
     * @param key 
     */
    public static RemoveChild(key: string) {
        window.parent.postMessage(key, location.origin);
    }



    /**
     * 
     */
    public static Post(sender: Sender) {
        this._msg = JSON.stringify(sender);
        this._ports.forEach((port, key) => {
            port.postMessage(this._msg);
        });
    }


    /**
     * 
     * @param value 
     */
    public static PostOwner(sender: Sender) {
        let value = JSON.stringify(sender);
        this._ownerPort.postMessage(value);
    }

}