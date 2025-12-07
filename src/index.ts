import { drawShapes } from "./drawShapes";
import { CreateProps, Rotaptcha, VerifyProps } from "./types";
import { generateShortUuid, randomWithStep } from "./utils";
import { Low, Memory } from "lowdb";

interface Database {
    answers: Record<string, number>;
}

const defaultData: Database = { answers: {} };
const adapter = new Memory<Database>();
const db = new Low<Database>(adapter, defaultData);

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
    }: CreateProps): Promise<string> => {
        
        const rotation = randomWithStep(minValue, maxValue, step);
        const uuid = generateShortUuid();
        
        await db.read();
        db.data!.answers[uuid] = rotation;
        await db.write();
        
        return drawShapes(width, height, strokeWidth, rotation, wobble, noise);
    },
    
    verify: async (args: VerifyProps): Promise<boolean> => {
        
        if (args.answer && args.uuid) {
            
            await db.read();
            const actualAnswer = db.data?.answers[args.uuid];
            
            if (actualAnswer !== undefined) {
                
                if (actualAnswer === parseInt(args.answer)) {
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

