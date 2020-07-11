import Sender from "../Container/Sender";
import { encode, decode } from "@msgpack/msgpack";
import BinarySender from "../Container/BinarySender";


export default class SWMsgPack {

    /**
     * 
     * @param sender 
     */
    public static Encode(sender: Sender): Uint8Array {

        let bs = sender as BinarySender;

        let data = encode(sender);
        let dataSize = data.byteLength;
        let binarySize = (bs && bs.binary ? bs.binary.byteLength : 0);
        let allSize = dataSize + binarySize;
        let result = new Uint8Array(allSize + 8);

        result[0] = (dataSize >> 24) & 0xFF;
        result[1] = (dataSize >> 16) & 0xFF;
        result[2] = (dataSize >> 8) & 0xFF;
        result[3] = (dataSize >> 0) & 0xFF;

        result[4] = (binarySize >> 24) & 0xFF;
        result[5] = (binarySize >> 16) & 0xFF;
        result[6] = (binarySize >> 8) & 0xFF;
        result[7] = (binarySize >> 0) & 0xFF;

        result.set(data, 8);
        if (binarySize > 0) {
            result.set(new Uint8Array(bs.binary), 8 + dataSize);
        }
        return result;
    }


    /**
     * 
     * @param data 
     */
    public static Decode(data: any): Sender | BinarySender {

        if (data) {
            let wd = new Uint8Array(data);
            let dataSize = (wd[0] << 24) + (wd[1] << 16) + (wd[2] << 8) + wd[3];
            let binarySize = (wd[4] << 24) + (wd[5] << 16) + (wd[6] << 8) + wd[7];
            let md = wd.slice(8, dataSize + 8);

            if(binarySize === 0){
                return decode(md) as Sender;
            }
            else{
                let result = decode(md) as BinarySender;
                result.binary = wd.slice(dataSize + 8, dataSize + binarySize + 8);
                return result;
            }
        }

        return undefined;
    }


    /**
     * 
     * @param blob 
     */
    public static BlobToArray(blob: Blob): Promise<string | ArrayBuffer> {

        return new Promise<string | ArrayBuffer>((resolve) => {
            var reader = new FileReader();

            reader.onloadend = function () {
                resolve(reader.result);
            };

            reader.readAsArrayBuffer(blob);
        });
    }

}
