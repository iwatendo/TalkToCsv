import Sender from "../Container/Sender";
import { encode, decode } from "@msgpack/msgpack";


export default class SWMsgPack {

    /**
     * 
     * @param sender 
     */
    public static Encode(sender: Sender): Uint8Array {
        let data = encode(sender);
        let size = data.byteLength;
        let result = new Uint8Array(data.byteLength + 4);
        result[0] = (size >> 24) & 0xFF;
        result[1] = (size >> 16) & 0xFF;
        result[2] = (size >> 8) & 0xFF;
        result[3] = (size >> 0) & 0xFF;
        result.set(data, 4);
        return result;
    }

    /**
     * 
     * @param data 
     */
    public static Decode(data: any): Sender | undefined {

        if (data) {
            let wd = new Uint8Array(data);
            let size = (wd[0] << 24) + (wd[1] << 16) + (wd[2] << 8) + wd[3];
            let md = wd.slice(4, size + 4);
            return decode(md) as Sender;
        }

        return undefined;

    }
}
