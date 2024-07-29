import { Effect } from './Effect';

export class Material {
    constructor(
        public effect: Effect,
        public properties: Record<string, any>,
        public renderOptions: any
    ) {}

    public setRenderOption(gl: WebGLRenderingContext) {}
}
