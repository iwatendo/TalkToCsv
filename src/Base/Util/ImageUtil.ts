

import ImageInfo from "../Container/ImageInfo";

interface OnImageResize { (img: ImageInfo): void }


export default class ImageUtil {

    /**
     * 画像データのリサイズ
     * @param baseImage
     * @param width
     * @param height
     * @param callback
     */
    public static ImgB64Resize(baseImage: ImageInfo, width: number, height: number, callback: OnImageResize) {

        let imgB64_src = baseImage.src;

        // Image Type
        let img_type = imgB64_src.substring(5, imgB64_src.indexOf(";"));

        // Source Image
        let img = new Image();

        img.onload = function () {

            // New Canvas
            let canvas: HTMLCanvasElement = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;

            // Draw (Resize)
            let ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Destination Image
            let imgB64_dst = canvas.toDataURL(img_type);

            baseImage.src = imgB64_dst;
            callback(baseImage);
        };
        img.src = imgB64_src;
    }


    /**
     * 画像データの圧縮
     * @param baseImage
     * @param callback
     */
    public static ImgB64Compress(baseImage: ImageInfo, callback: OnImageResize) {

        //  再起処理
        if (baseImage.src.length > (1024 * 128)) {
            ImageUtil.ImgB64CompressLoop(baseImage, (n) => {
                ImageUtil.ImgB64Compress(n, callback);
            });
        }
        else {
            callback(baseImage);
        }
    }


    /**
     * 画像データのリサイズ
     * @param baseImage
     * @param callback
     */
    public static ImgB64CompressLoop(baseImage: ImageInfo, callback: OnImageResize) {

        let imgB64_src = baseImage.src;

        // Image Type
        let img_type = imgB64_src.substring(5, imgB64_src.indexOf(";"));

        // Source Image
        let img = new Image();

        img.onload = function () {

            let W: number = img.width / 2;
            let H: number = img.height / 2;

            let width: number = img.width;
            let height: number = img.height;

            let canvas: HTMLCanvasElement = document.createElement('canvas');
            canvas.width = W;
            canvas.height = H;
            let ctx = canvas.getContext('2d');

            let canvasc2 = document.createElement("canvas");
            let ctx2 = canvasc2.getContext("2d")

            canvasc2.width = width;
            canvasc2.height = height;

            let optw: number = ImageUtil.getOptSize(width, W);
            let opth: number = ImageUtil.getOptSize(height, H);
            ctx2.drawImage(img, 0, 0, width, height, 0, 0, optw, opth);
            width = optw;
            height = opth;

            ctx.drawImage(canvasc2, 0, 0, width, height, 0, 0, W, H);

            // Destination Image
            let imgB64_dst = canvas.toDataURL(img_type);

            baseImage.src = imgB64_dst;
            callback(baseImage);
        };
        img.src = imgB64_src;
    }


    /**
     * 
     * @param orig
     * @param target
     */
    private static getOptSize(orig: number, target: number): number {
        return target * Math.pow(2, Math.floor(Math.log(orig / target) / Math.LN2) - 1);
    }


    /**
     * ドラッグされたアイテムが画像か判定
     */
    public static IsImageDrag(event: DragEvent) {

        let data = event.dataTransfer;

        if (data.types.length > 0) {

            for(let i in data.types){
                let t = data.types[i];
                if (t.indexOf('Files') === 0) return true;
                if (t.indexOf('text/html') === 0) return true;
            }
        }

        return false;
    }

}