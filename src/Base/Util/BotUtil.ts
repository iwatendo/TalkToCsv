

export default class BotUtil {

    /**
     * DiceBot
     * @param text 
     */
    public static Dice(text: string): string {

        let reg = new RegExp('^[0-9０-９][dDｄＤ][0-9０-９]+');
        let mat: RegExpMatchArray = text.match(reg);

        if (!mat) {
            return '';
        }

        let dicestr: string = mat[0];

        //  全角を半角に変換
        dicestr = dicestr.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s: string) => String.fromCharCode(s.charCodeAt(0) - 65248));

        let split: string[] = dicestr.toLowerCase().split('d');
        let diceCount: number = Number(split[0]);
        let diceTarget: number = Number(split[1]);

        let total: number = 0;
        let work: string = '';

        for (let i = 0; i < diceCount; i++) {
            let rand = Math.floor(Math.random() * diceTarget) + 1;
            total += rand;
            work += ',' + rand.toString();
        }

        let diceresult: string = dicestr + ' -> ' + total.toString();

        if (diceCount > 1) {
            diceresult += '[' + work.substr(1) + ']';
        }

        return diceresult;
    }

}
