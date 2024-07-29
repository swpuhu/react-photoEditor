import sharedVertex from './shader/sharedShader.vert.glsl';
import sharedFrag from './shader/sharedShader.frag.glsl';
import vertexPrefixChunk from './shader/vertexShaderPrefix.chunk';
import fragPrefixChunk from './shader/fragShaderPrefix.chunk';
import { Effect } from './Effect';

const presetShaders: Record<string, { vertex: string; frag: string }> = {
    sharedShader: {
        vertex: sharedVertex,
        frag: sharedFrag,
    },
};

const keys = Object.keys(presetShaders);

const effects: Record<string, Effect> = {};
for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const shader = presetShaders[key];
    shader.vertex = vertexPrefixChunk + shader.vertex;
    shader.frag = fragPrefixChunk + shader.frag;

    const effect = new Effect(shader.vertex, shader.frag);
    effects[key] = effect;
}

export default effects;
