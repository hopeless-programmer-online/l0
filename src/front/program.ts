import Parameters from "./parameters";
import Commands from "./commands";

export default class Program {
    readonly Parameters = new Parameters({ Program : this });
    readonly Commands = new Commands({ Program : this });
}
