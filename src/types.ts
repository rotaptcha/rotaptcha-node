
export interface Rotaptcha {
    create(args: CreateProps, secretKey: string): Promise<{ image: string, token: string }>;
    verify(props: VerifyProps, secretKey: string): Promise<boolean>;
}


export interface CreateProps {
    width?: number;
    height?: number;
    minValue?: number;
    maxValue?: number;
    step?: number;
    wobbleIntensity?: number;
    noise?: boolean;
    strokeWidth?: number;
    availableColors?: string[];
    canvasBg?: string;
    noiseDensity?: number;
    expiryTime?: number;
}

export interface VerifyProps {
    answer: string;
    token: string;
}

