import { Effect } from './Effect';
import presetShaders from './presetShaders';

export class Renderer {
    private gl: WebGLRenderingContext;
    private effects: Record<string, Effect> = {};
    constructor(gl: WebGLRenderingContext) {
        this.gl = gl;
        this.compilePresetShaders();
    }

    compilePresetShaders(): void {
        const gl = this.gl;
        if (!gl) {
            return;
        }

        const keys = Object.keys(presetShaders);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const effect = presetShaders[key];
            effect.compileShader(gl);
        }
        console.log(presetShaders);
        this.effects = presetShaders;
    }

    public destroy() {
        const keys = Object.keys(this.effects);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            this.effects[key].destroy(this.gl);
        }
    }
}
