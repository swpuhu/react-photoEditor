import { mat4, vec3 } from 'gl-matrix';
import { degree2rad } from '../util';
import { RenderNode } from '../renderNode/RenderNode';
import { GLRenderNode } from '../renderer/GLRenderNode';

const vec3ZERO = vec3.fromValues(0, 0, 0);
export class MNode {
    protected _localMat: mat4 = mat4.create();
    protected _worldMat: mat4 = mat4.create();
    protected _worldMatInv: mat4 = mat4.create();
    protected _tempMat: mat4 = mat4.create();
    protected _parent: MNode | null = null;
    protected _children: MNode[] = [];
    protected _position: vec3 = vec3.create();
    protected _rotation: number = 0;
    protected _scale: vec3 = vec3.fromValues(1, 1, 1);
    protected _worldPos: vec3 = vec3.create();
    protected _renderNode: RenderNode | null = null;
    protected _glRenderNode: GLRenderNode | null = null;
    protected _active: boolean = true;

    get active() {
        return this._active;
    }

    set active(v: boolean) {
        this._active = v;
    }

    get parent(): MNode | null {
        return this._parent;
    }

    get position(): vec3 {
        return vec3.clone(this._position);
    }

    set position(v: vec3) {
        this._position = v;
        this.updateLocalMatrix();
        this.updateChildrenWorldMatrixRecursively();
    }

    get rotation(): number {
        return this._rotation;
    }

    set rotation(v: number) {
        this._rotation = v;
        this.updateLocalMatrix();
        this.updateChildrenWorldMatrixRecursively();
    }

    get worldRotation(): number {
        if (!this._parent) {
            return this._rotation;
        } else {
            return this._parent.worldRotation + this._rotation;
        }
    }

    set worldRotation(v: number) {
        if (!this._parent) {
            this.rotation = v;
        } else {
            const parentWorldRotation = this._parent.worldRotation;
            const diff = v - parentWorldRotation;
            this.rotation = diff;
        }
    }

    get children(): ReadonlyArray<MNode> {
        return this._children;
    }

    get scaleX(): number {
        return this._scale[0];
    }

    get scaleY(): number {
        return this._scale[1];
    }

    constructor(public name?: string) {}

    public setPosition(x: number, y: number) {
        vec3.set(this._position, x, y, 0);
        this.position = this._position;
        this.updateLocalMatrix();
        this.updateChildrenWorldMatrixRecursively();
    }

    public setScale(scaleX: number, scaleY: number) {
        vec3.set(this._scale, scaleX, scaleY, 1);
        this.updateLocalMatrix();
        this.updateChildrenWorldMatrixRecursively();
    }

    private updateLocalMatrix(): void {
        mat4.identity(this._tempMat);
        mat4.translate(this._tempMat, this._tempMat, this._position);
        mat4.rotateZ(this._tempMat, this._tempMat, degree2rad(this._rotation));
        mat4.scale(this._localMat, this._tempMat, this._scale);
    }

    private updateChildrenWorldMatrixRecursively(): void {
        this.updateWorldMatrixSelf();
        for (let i = 0; i < this._children.length; i++) {
            const node = this._children[i];
            node.updateChildrenWorldMatrixRecursively();
        }
    }

    private updateWorldMatrixSelf(): void {
        if (!this._parent) {
            mat4.copy(this._worldMat, this._localMat);
            return;
        }
        mat4.identity(this._tempMat);
        const parentWorldMat = this._parent._worldMat;
        mat4.multiply(this._worldMat, parentWorldMat, this._localMat);
        mat4.invert(this._worldMatInv, this._worldMat);
    }

    public addChildren(...nodes: MNode[]) {
        for (let i = 0; i < nodes.length; i++) {
            nodes[i]._parent = this;
            this._children.push(nodes[i]);
            nodes[i].updateChildrenWorldMatrixRecursively();
        }
    }

    public setParent(node: MNode) {
        node.addChildren(this);
    }

    public getWorldPosition(): vec3 {
        vec3.transformMat4(this._worldPos, vec3ZERO, this._worldMat);
        return this._worldPos;
    }

    public getWorldMatrix(): mat4 {
        return this._worldMat;
    }

    public convertToWorldSpace(p: vec3, out?: vec3): vec3 {
        out = out || vec3.create();
        vec3.transformMat4(out, p, this._worldMat);
        return out;
    }

    public convertToNodeSpace(p: vec3, out?: vec3): vec3 {
        out = out || vec3.create();
        vec3.transformMat4(out, p, this._worldMatInv);
        return out;
    }

    public setRenderNode(renderNode: RenderNode | GLRenderNode) {
        if (renderNode instanceof RenderNode) {
            this._renderNode = renderNode;
        } else {
            renderNode['_node'] = this;
            this._glRenderNode = renderNode;
        }
    }

    public getRenderNode(): RenderNode | GLRenderNode | null {
        if (this._renderNode) {
            return this._renderNode;
        }
        return this._glRenderNode;
    }

    public getChildByName(name: string): MNode | null {
        if (this.name === name) {
            return this;
        }
        let result: MNode | null = null;
        for (let i = 0; i < this._children.length; i++) {
            result = this._children[i].getChildByName(name);
            if (result) {
                return result;
            }
        }

        return null;
    }

    public clone(): MNode {
        const newNode = new MNode(this.name);
        for (let i = 0; i < this.children.length; i++) {
            const newChild = this.children[i].clone();
            newNode.addChildren(newChild);
        }
        newNode._position = vec3.clone(this._position);
        newNode._rotation = this.rotation;
        newNode._scale = vec3.clone(this._scale);
        this.updateLocalMatrix();
        this.updateChildrenWorldMatrixRecursively();
        return newNode;
    }
}
