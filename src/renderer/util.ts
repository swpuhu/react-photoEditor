import { Geometry } from 'pixi.js';

export function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

export function createRectGeometry(
    width: number,
    height: number,
    anchorX = 0.5,
    anchorY = 0.5
) {
    return new Geometry({
        attributes: {
            aPosition: [
                -width * anchorX,
                -height * anchorY, // x, y
                width * (1 - anchorX),
                -height * anchorY, // x, y
                width * (1 - anchorX),
                height * (1 - anchorY), // x, y,
                -width * anchorX,
                height * (1 - anchorY), // x, y,
            ],
            aUV: [0, 0, 1, 0, 1, 1, 0, 1],
        },
        indexBuffer: [0, 1, 2, 0, 2, 3],
    });
}
