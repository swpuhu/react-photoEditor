function createShader(
    gl: WebGLRenderingContext,
    type: number,
    source: string
): WebGLShader | null {
    const shader = gl.createShader(type);
    if (!shader) {
        throw new Error('create shader failed!');
    }
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    }
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
}

export function initWebGL(
    gl: WebGLRenderingContext,
    vertStr: string,
    fragStr: string
): [WebGLProgram | null, WebGLShader | null, WebGLShader | null] {
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertStr);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragStr);
    if (!vertexShader || !fragmentShader) {
        return [null, null, null];
    }
    const program = gl.createProgram();
    if (!program) {
        throw new Error('create program failed!');
    }
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
        return [program, vertexShader, fragmentShader];
    }
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return [null, null, null];
}
