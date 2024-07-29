import { initWebGL } from './renderUtil';

export class Effect {
    private shaders: WebGLShader[] = [];
    private program: WebGLProgram | null = null;
    private __attributeInfos: Record<
        string,
        {
            type: number;
            location: number;
        }
    > = {};
    private __uniformInfos: Record<
        string,
        {
            type: number;
            location: WebGLUniformLocation;
        }
    > = {};

    get compiled(): boolean {
        return !!this.program;
    }
    constructor(private vertexStr: string, private fragStr: string) {}

    public compileShader(gl: WebGLRenderingContext): void {
        const [program, vertexShader, fragShader] = initWebGL(
            gl,
            this.vertexStr,
            this.fragStr
        );
        this.program = program;
        if (vertexShader) {
            this.shaders.push(vertexShader);
        }
        if (fragShader) {
            this.shaders.push(fragShader);
        }

        if (this.program) {
            const activeUniformCount = gl.getProgramParameter(
                this.program,
                gl.ACTIVE_UNIFORMS
            );

            const activeAttributeCount = gl.getProgramParameter(
                this.program,
                gl.ACTIVE_ATTRIBUTES
            );

            for (let i = 0; i < activeAttributeCount; i++) {
                const info = gl.getActiveAttrib(this.program, i);
                if (!info) {
                    continue;
                }
                this.__attributeInfos[info.name] = {
                    type: info.type,
                    location: i,
                };
            }

            for (let i = 0; i < activeUniformCount; i++) {
                const info = gl.getActiveUniform(this.program, i);
                if (!info) {
                    continue;
                }
                const location = gl.getUniformLocation(this.program, info.name);
                if (!location) {
                    continue;
                }
                this.__uniformInfos[info.name] = {
                    type: info.type,
                    location,
                };
            }
        }
    }

    destroy(gl: WebGLRenderingContext): void {
        this.shaders.forEach(shader => gl.deleteShader(shader));
        this.shaders.length = 0;
        if (this.program) {
            gl.deleteProgram(this.program);
            this.program = null;
        }
    }
}
