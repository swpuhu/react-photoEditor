import { mat4 } from 'gl-matrix';
import { MNode } from './MNode';

export class Camera extends MNode {
    protected _viewMat = mat4.create();
    constructor(name = 'camera') {
        super(name);
    }

    public getViewMat(): mat4 {
        return this._worldMatInv;
    }
}
