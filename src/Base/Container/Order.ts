

/**
 * 並び順を設定するインターフェイス
 */
export interface IOrder {
    order: number;
}


/**
 * 並び順用のUtil
 */
export class Order {

    /**
     * 指定されたリストのOrder最大値＋１を取得する
     */
    public static New<T extends IOrder>(list: Array<T>): number {

        let result: number = 0;

        list.forEach(n => {
            if (result < n.order) {
                result = n.order;
            }
        });

        return (result + 1);
    }


    /**
     * リスト内の位置を取得
     */
    public static GetOrder<T extends IOrder>(list: Array<T>, item: T): number {
        let order = 1;
        for (let n in list) {
            if (item.order === list[n].order) {
                return order;
            }
            order++;
        }
        return item.order;
    }


    /**
     * Orderを1から付け直す
     */
    public static ReNumber<T extends IOrder>(list: Array<T>) {
        let order = 1;
        for (let n in list) {
            list[n].order = order++;
        }
    }


    /**
     * Order順でのソート処理
     */
    public static Sort<T extends IOrder>(list: Array<T>) {
        list.sort((a, b) => (a.order - b.order));
    }


    /**
     *  並び順の変更処理
     */
    public static Swap<T extends IOrder>(list: Array<T>, dragItem: T, dropItem: T): Array<T> {

        let dragOrder = Order.GetOrder<T>(list, dragItem);
        let dropOrder = Order.GetOrder<T>(list, dropItem);

        //  削除処理等がされた場合
        //  Order番号に歯抜けが発生する為、番号を振り直す
        Order.ReNumber(list);

        let result = Array<T>();
        let order: number = 0;

        list.forEach(cur => {
            if (cur.order === dragOrder) {
                cur.order = dropOrder;
            }
            else {
                order += 1;
                if (order === dropOrder) order += 1;
                cur.order = order;
            }
            result.push(cur);
        });

        Order.Sort(result);

        return result;
    }

}