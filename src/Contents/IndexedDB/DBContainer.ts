
import * as Personal from "./Personal";
import * as Home from "./Home";
import * as Timeline from "./Timeline";
import { OnModelLoad } from "../../Base/AbstractServiceModel";

export default class DBContainer {

    public PersonalDB: Personal.DB;
    public HomeDB: Home.DB;
    public TimelineDB: Timeline.DB;

    /**
     * 
     */
    public constructor() {
        this.PersonalDB = new Personal.DB();
        this.HomeDB = new Home.DB();
        this.TimelineDB = new Timeline.DB();
    }


    /**
     * 初期化処理
     * @param callback 
     */
    public RemoveAll(callback: OnModelLoad) {

        this.PersonalDB.Remove(() => {
            this.HomeDB.Remove(() => {
                this.TimelineDB.Remove(() => {
                });
            });
        });
    }


    /**
     * IndexedDBへの接続
     * @param callback 
     * @param isBootInit 
     */
    public ConnectAll(callback: OnModelLoad) {

        this.PersonalDB.Connect(() => {
            this.HomeDB.Connect(() => {
                this.TimelineDB.Connect(() => {
                    callback();
                });
            });
        });
    }
}
