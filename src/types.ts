
export interface Rotaptcha {
    create(args: CreateProps): string;
    verify(props: VerifyProps): boolean;
}


export interface CreateProps {

    width: number;
    height: number;
    minValue?: number;
    maxValue?: number;
    step?: number;
    strokeWidth?: number;
    wobble?: boolean;
    noise?: boolean;

}

export interface VerifyProps {
    answer?: string;
    token?: string;
    uuid: string;
}

