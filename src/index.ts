import { drawShapes } from "./drawShapes";
import { CreateProps, Rotaptcha, VerifyProps } from "./types";
import { generateShortUuid, randomWithStep } from "./utils";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import path from "path";

interface Database {
    answers: Record<string, number>;
}

const dbPath = path.join(process.cwd(), "rotaptcha-db.json");
const defaultData: Database = { answers: {} };
const adapter = new JSONFile<Database>(dbPath);
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

