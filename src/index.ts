import { drawShapes } from "./shapes";

export function rotaptcha(): string {


    return drawShapes(400, 400, 5, 0, true, true);
}
