import { drawShapes } from "./drawShapes";
import { CreateProps, Rotaptcha, VerifyProps } from "./types";
import { generateShortUuid, randomWithStep } from "./utils";

const rotaptcha: Rotaptcha = {
    
    create: ({
        width = 400,
        height = 400,
        minValue = 30,
        maxValue = 90,
        step = 5,
        strokeWidth = 5,
        wobble = false,
        noise = true
    }: CreateProps): string => {
        
        const rotation = randomWithStep(minValue, maxValue, step);
        const uuid = generateShortUuid();
        
        localStorage.setItem(uuid, rotation.toString());
        return drawShapes(width, height, strokeWidth, rotation, wobble, noise);
    },
    
    verify: (args: VerifyProps): boolean => {
        
        if (args.answer && args.uuid) {
            
            const actualAnswer = localStorage.getItem(args.uuid);
            
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

