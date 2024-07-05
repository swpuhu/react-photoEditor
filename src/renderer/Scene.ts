import { Application, Assets, Container, Mesh, Shader, Texture } from 'pixi.js';

import sharedVertex from './shader/sharedShader.vert.glsl';
import sharedFrag from './shader/sharedShader.frag.glsl';
import { createRectGeometry } from './util';

export class Scene {
    private _app: Application;
    constructor(canvas: HTMLCanvasElement, container?: HTMLElement) {
        this._app = new Application();
        this._app.init({
            background: '#1099bb',
            resizeTo: container ? container : window,
            canvas,
            antialias: true,
        });
        this.__shaderTest();
    }

    private async __shaderTest(): Promise<void> {
        const geo = createRectGeometry(200, 200);

        const texture = (await Assets.load('/avatar.jpg')) as Texture;

        const shader = Shader.from({
            gl: {
                vertex: sharedVertex,
                fragment: sharedFrag,
            },
            resources: {
                uTexture: texture.source,
            },
        });
        const quad = new Mesh({
            geometry: geo,
            shader,
        });
        const parentContainer = new Container({
            x: 300,
            y: 200,
            rotation: (10 / 180) * Math.PI,
        });
        parentContainer.addChild(quad);
        this._app.stage.addChild(parentContainer);
    }

    destroy() {
        this._app.destroy();
    }
}
