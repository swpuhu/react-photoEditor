import { MColor } from './base/MColor';
import type { MNode } from './base/MNode';

export abstract class GLRenderNode {
    protected _node: MNode | undefined;
    public order = 0;
    public color: MColor = new MColor(128, 128, 128, 255);
    public abstract getVerticesByteLength(): number;
    public abstract uploadVertices(
        verticesF32View: Float32Array,
        indicesU16View: Uint16Array,
        verticesUInt8View: Uint32Array,
        byteOffset: number,
        indexOffset: number
    ): number[];
    public abstract clone(): GLRenderNode;
}
