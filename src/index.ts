import { drawShapes } from "./drawShapes";
import { CreateProps, Rotaptcha, VerifyProps } from "./types";
import { generateShortUuid, randomWithStep } from "./utils";
import Loki from "lokijs";


// LokiJS setup
const db = new Loki("rotaptcha.db.json");
const answersCollection = db.addCollection<Record<string, any>>("answers");

// Config object for stroke styling
const config = {
    strokeWidth: 5,
    availableColors: ['#A47864', '#6667AB', '#F5DF4D', '#FFBE98', '#88B04B', '#5F4B8B', '#E27A3F', '#DF5A49'],
    canvasBg : "#e6e6e6",
    noiseDensity: 4
};

const rotaptcha: Rotaptcha = {
    create: async ({
        width = 400,
        height = 400,
        minValue = 20,
        maxValue = 90,
        step = 10,
        wobble = false,
        noise = true
    }: CreateProps): Promise<{image: string, token: string}> => {
        const rotation = randomWithStep(minValue, maxValue, step);
        const uuid = generateShortUuid();
        answersCollection.insert({ uuid, rotation });
        return { image: await drawShapes(width, height, config.strokeWidth, config.availableColors, config.canvasBg, config.noiseDensity, rotation, wobble, noise), token: uuid };
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

