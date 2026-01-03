
export interface Rotaptcha {
    create(args: CreateProps): Promise<{image: string, token: string}>;
    verify(props: VerifyProps): Promise<boolean>;
}

export interface CaptchaConfig {
    strokeWidth?: number;
    availableColors?: string[];
    canvasBg?: string;
    noiseDensity?: number;
    secretKey: string;
    expiryTime?: number;

}

export interface CreateProps {
    width?: number;
    height?: number;
    minValue?: number;
    maxValue?: number;
    step?: number;
    wobble?: boolean;
    noise?: boolean;
    config?: CaptchaConfig;
    secretKey: string;
}

export interface VerifyProps {
    answer: string;
    token: string;
    secretKey:string;
}

