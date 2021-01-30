import Commands from "./front/commands";
import Parameters from "./front/parameters";
import Program from "./front/program";

export default function parse(source : string) {
    return new Program({
        parameters : new Parameters({
            array : [],
        }),
        commands : new Commands({
            array : [],
        })
    })
}
