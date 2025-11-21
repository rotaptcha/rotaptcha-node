import { drawShapes } from "./drawShapes";
import { VerifyProps } from "./types";
import { generateShortUuid, randomWithStep } from "./utils";



const rotaptcha = {

    create: (): string => {

        const rotation = randomWithStep(30, 90, 5);
        const uuid = generateShortUuid();

        localStorage.setItem(uuid, rotation.toString());
        return drawShapes(400, 400, 5, rotation, true, true);
    },
    verify: (args: VerifyProps) => {

        if (args.answer && args.uuid) {

            const actualAnswer = localStorage.getItem("uuid");

            if (actualAnswer) {

                if (parseInt(actualAnswer) === parseInt(args.answer)) {
                    return true;
                } else {
                    return false;
                }

            } else {
                return false;
            }

        }
        
        return false;


    },


}

export default rotaptcha;

