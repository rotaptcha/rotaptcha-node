import { drawShapes } from "./drawShapes";
import { CreateProps, Rotaptcha, VerifyProps } from "./types";
import { generateShortUuid, randomWithStep } from "./utils";
import { decryptCaptchaToken, encryptCaptchaToken } from "./security-utils";

// Default config object
const defaultConfig = {
    strokeWidth: 6,
    availableColors: [
        'rgb(198, 231, 159)',
        'rgb(230, 103, 171)',
        'rgb(147, 128, 230)',
        'rgb(255, 190, 152)',
        'rgb(191, 230, 11)',
        'rgb(88, 106, 175)',
        'rgb(230, 122, 63)',
        'rgb(223, 230, 73)'
    ],
    canvasBg: "rgb(230, 230, 230)",
    noiseDensity: 5,
    expiryTime : 5 // 5 minutes
};

const rotaptcha: Rotaptcha = {
    create: async ({
        width = 400,
        height = 400,
        minValue = 20,
        maxValue = 90,
        step = 10,
        wobble = false,
        noise = true,
        config,
        secretKey
    }: CreateProps): Promise<{image: string, token: string}> => {
        
        // Merge user config with defaults
        const finalConfig = { ...defaultConfig, ...config };
        
        const rotation = randomWithStep(minValue, maxValue, step);
        const uuid = generateShortUuid();
        
        const payload  = {
            jti : uuid,
            answer : rotation,
            iat : Math.floor(Date.now() / 1000),
            exp : Math.floor(Date.now() / 1000) + (finalConfig.expiryTime * 60) // 5 minutes expiry
        };

        const token = await encryptCaptchaToken(
            payload,
            secretKey
        );

        return { 
            image: await drawShapes(
                width, 
                height, 
                finalConfig.strokeWidth, 
                finalConfig.availableColors, 
                finalConfig.canvasBg, 
                finalConfig.noiseDensity, 
                rotation, 
                wobble, 
                noise
            ), 
            token: token 
        };
    },

    verify: async (args: VerifyProps): Promise<boolean> => {
        
        const solution = await decryptCaptchaToken(args.token, args.secretKey);

        if (solution && Object.keys(solution).length > 0) {
            // First check if token has expired
            if (solution.exp >= Math.floor(Date.now() / 1000)) {
                // Then check if answer is correct
                if (parseInt(args.answer) === solution.answer) {
                    return true;
                }
            }
        }

        return false;
    }
};

export default rotaptcha;

