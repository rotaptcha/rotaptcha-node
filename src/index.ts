import { drawShapes } from "./drawShapes";
import { CreateProps, Rotaptcha, VerifyProps } from "./types";
import { generateShortUuid, randomWithStep } from "./utils";
import { decryptCaptchaToken, encryptCaptchaToken } from "./security-utils";
import { defaultConfig } from "./utils";


const rotaptcha: Rotaptcha = {
    create: async({
        width = 400,
        height = 400,
        minValue = 20,
        maxValue = 90,
        step = 10,
        wobbleIntensity = 3,
        noise = true,
        strokeWidth = defaultConfig.strokeWidth,
        availableColors = defaultConfig.availableColors,
        canvasBg = defaultConfig.canvasBg,
        noiseDensity = defaultConfig.noiseDensity,
        expiryTime = 5

    }: CreateProps, secretKey: string): Promise<{ image: string, token: string }> => {

    // Merge user config with defaults
    // const finalConfig = { ...defaultConfig, ...config };

    const rotation = randomWithStep(minValue, maxValue, step);
    const uuid = generateShortUuid();

    const payload = {
        jti: uuid,
        answer: rotation,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (expiryTime * 60) // 5 minutes expiry
    };

    const token = await encryptCaptchaToken(
        payload,
        secretKey
    );

    return {
        image: await drawShapes(
            width,
            height,
            strokeWidth,
            availableColors,
            canvasBg,
            noiseDensity,
            rotation,
            wobbleIntensity,
            noise
        ),
        token: token
    };
},

verify: async (args: VerifyProps, secretKey: string): Promise<boolean> => {

    const solution = await decryptCaptchaToken(args.token, secretKey);

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

