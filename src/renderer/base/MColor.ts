export class MColor {
    constructor(
        public r: number,
        public g: number,
        public b: number,
        public a: number
    ) {}

    get val(): number {
        return ((this.a << 24) >>> 0) + (this.b << 16) + (this.g << 8) + this.r;
    }

    mix(c1: MColor, c2: MColor, factor: number, out?: MColor): MColor {
        if (!out) {
            out = new MColor(0, 0, 0, 0);
        }

        out.r = c1.r * (1 - factor) + c2.r * factor;
        out.g = c1.g * (1 - factor) + c2.g * factor;
        out.b = c1.b * (1 - factor) + c2.b * factor;
        out.a = c1.a * (1 - factor) + c2.a * factor;
        return out;
    }
}
