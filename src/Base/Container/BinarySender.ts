import Sender from "./Sender";

export default abstract class BinarySender extends Sender {

    constructor(type: string) {
        super(type);
    }

    binary: ArrayBuffer;
}