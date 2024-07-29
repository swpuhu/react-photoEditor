import { MNode } from './base/MNode';
import { GLRenderNode } from './GLRenderNode';
import { mat4 } from 'gl-matrix';
import { Camera } from './base/Camera';

const MAX_INDEX_COUNT = 65535;
const MAX_VERTEX_COUNT = 174800;
const MAX_VERTEX_BYTE_COUNT = MAX_VERTEX_COUNT * Float32Array.BYTES_PER_ELEMENT;
export class GLRenderer {
    private programMap: Record<
        string,
        [WebGLProgram, WebGLShader, WebGLShader]
    > = {};

    private __verticesGLBuffer!: WebGLBuffer;
    private __indicesGLBuffer!: WebGLBuffer;
    private __verticesArrayBuffer!: ArrayBuffer;
    private __indicesArrayBuffer!: ArrayBuffer;
    private __verticesUInt32View!: Uint32Array;
    private __verticesF32View!: Float32Array;
    private __indicesUInt16View!: Uint16Array;
    private __viewMat: mat4 = mat4.create();
    private __projMat: mat4 = mat4.create();
    private __currentProgram: WebGLProgram | null = null;
    private vertexByteOffset = 0;
    private indexOffset = 0;
    private __renderQueue: GLRenderNode[] = [];

    constructor(
        private gl: WebGLRenderingContext,
        public width: number,
        public height: number
    ) {
        this.__initBuffer();
        this.__initMatrix();
        this.gl.clearColor(1, 1, 1, 1);
    }

    private __initMatrix(): void {
        const halfWidth = this.width / 2;
        const halfHeight = this.height / 2;
        mat4.ortho(
            this.__projMat,
            -halfWidth,
            halfWidth,
            -halfHeight,
            halfHeight,
            -1,
            1
        );

        mat4.identity(this.__viewMat);
    }

    private __initBuffer(): void {
        const gl = this.gl;
        this.__verticesArrayBuffer = new ArrayBuffer(
            MAX_VERTEX_COUNT * Float32Array.BYTES_PER_ELEMENT
        );
        this.__indicesArrayBuffer = new ArrayBuffer(
            MAX_INDEX_COUNT * Int16Array.BYTES_PER_ELEMENT
        );
        this.__verticesUInt32View = new Uint32Array(this.__verticesArrayBuffer);
        this.__verticesF32View = new Float32Array(this.__verticesArrayBuffer);
        this.__indicesUInt16View = new Uint16Array(this.__indicesArrayBuffer);

        const verticesBuffer = gl.createBuffer();
        const indicesBuffer = gl.createBuffer();
        if (!verticesBuffer || !indicesBuffer) {
            throw new Error('cannot create buffer');
        }
        this.__verticesGLBuffer = verticesBuffer;
        this.__indicesGLBuffer = indicesBuffer;
    }

    public getProgramByName(name: string): WebGLProgram | null {
        if (this.programMap[name]) {
            return this.programMap[name][2];
        }

        return null;
    }

    private visitRecursive(node: MNode) {
        if (!node.active) {
            return;
        }
        const renderNode = node.getRenderNode();
        if (renderNode && renderNode instanceof GLRenderNode) {
            this.__renderQueue.push(renderNode);
        }
        const children = node.children;
        for (let i = 0; i < children.length; i++) {
            this.visitRecursive(children[i]);
        }
    }

    private submitRender(): void {
        const gl = this.gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.__verticesGLBuffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            this.__verticesArrayBuffer,
            gl.DYNAMIC_DRAW
        );

        gl.enableVertexAttribArray(0);

        gl.vertexAttribPointer(
            0,
            2,
            gl.FLOAT,
            false,
            5 * Float32Array.BYTES_PER_ELEMENT,
            0
        );
        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(
            1,
            2,
            gl.FLOAT,
            false,
            5 * Float32Array.BYTES_PER_ELEMENT,
            2 * Float32Array.BYTES_PER_ELEMENT
        );
        gl.enableVertexAttribArray(2);
        gl.vertexAttribPointer(
            2,
            4,
            gl.UNSIGNED_BYTE,
            true,
            5 * Float32Array.BYTES_PER_ELEMENT,
            4 * Float32Array.BYTES_PER_ELEMENT
        );

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.__indicesGLBuffer);
        gl.bufferData(
            gl.ELEMENT_ARRAY_BUFFER,
            this.__indicesArrayBuffer,
            gl.DYNAMIC_DRAW
        );

        gl.drawElements(gl.TRIANGLES, this.indexOffset, gl.UNSIGNED_SHORT, 0);

        this.__clearSubmitInfo();
    }

    private __clearSubmitInfo(): void {
        this.vertexByteOffset = 0;
        this.indexOffset = 0;
        this.__renderQueue.length = 0;
    }

    private updatePublicUniform(camera: Camera): void {
        if (!this.__currentProgram) {
            return;
        }
        const projLoc = this.gl.getUniformLocation(
            this.__currentProgram,
            'u_proj'
        );
        const viewLoc = this.gl.getUniformLocation(
            this.__currentProgram,
            'u_view'
        );
        this.gl.uniformMatrix4fv(projLoc, false, this.__projMat);
        this.gl.uniformMatrix4fv(viewLoc, false, camera.getViewMat());
    }

    private __renderQueueRender(): void {
        this.__sortRenderOrder();
        for (let i = 0; i < this.__renderQueue.length; i++) {
            const renderNode = this.__renderQueue[i];

            const verticesByteLen = renderNode.getVerticesByteLength();
            if (
                verticesByteLen + this.vertexByteOffset >
                MAX_VERTEX_BYTE_COUNT
            ) {
                this.submitRender();
            }

            [this.vertexByteOffset, this.indexOffset] =
                renderNode.uploadVertices(
                    this.__verticesF32View,
                    this.__indicesUInt16View,
                    this.__verticesUInt32View,
                    this.vertexByteOffset,
                    this.indexOffset
                );
        }
    }

    private __sortRenderOrder(): void {
        this.__renderQueue.sort((a, b) => a.order - b.order);
    }

    public render(node: MNode, camera: Camera) {
        const program = this.getProgramByName('common');
        this.gl.useProgram(program);
        this.__currentProgram = program;
        this.updatePublicUniform(camera);
        this.visitRecursive(node);
        this.__renderQueueRender();
        this.submitRender();
    }

    public clear(): void {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    }
}
