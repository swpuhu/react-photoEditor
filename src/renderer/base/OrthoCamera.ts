import { mat4 } from 'gl-matrix';
import { Camera } from './Camera';

export class OrthoCamera extends Camera {
    protected override _viewMat: mat4 = mat4.create();
    constructor(
        left: number,
        right: number,
        bottom: number,
        top: number,
        near: number,
        far: number,
        name = 'orthoCamera'
    ) {
        super(name);
        mat4.ortho(this._viewMat, left, right, bottom, top, near, far);
    }
}
