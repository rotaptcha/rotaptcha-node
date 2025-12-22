import { drawShapes } from "./drawShapes";
import { CreateProps, Rotaptcha, VerifyProps } from "./types";
import { generateShortUuid, randomWithStep } from "./utils";
import Loki from "lokijs";


// LokiJS setup
const db = new Loki("rotaptcha.db.json");
const answersCollection = db.addCollection<Record<string, any>>("answers");


const rotaptcha: Rotaptcha = {
    create: async ({
        width = 400,
        height = 400,
        minValue = 30,
        maxValue = 90,
        step = 5,
        strokeWidth = 5,
        wobble = false,
        noise = true
    }: CreateProps): Promise<{image: string, token: string}> => {
        const rotation = randomWithStep(minValue, maxValue, step);
        const uuid = generateShortUuid();
        answersCollection.insert({ uuid, rotation });
        return { image: await drawShapes(width, height, strokeWidth, rotation, wobble, noise), token: uuid };
    },

    verify: async (args: VerifyProps): Promise<boolean> => {
        if (args.answer && args.uuid) {
            const found = answersCollection.findOne({ uuid: args.uuid });
            if (found && found.rotation === parseInt(args.answer)) {
                return true;
            }
        }
        return false;
    },
};

export default rotaptcha;

