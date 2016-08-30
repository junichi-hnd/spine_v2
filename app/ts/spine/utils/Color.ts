class Color {
    public r: number;
    public g: number;
    public b: number;
    public a: number;
    constructor(r: number = 0, g: number = 0, b: number = 0, a: number = 0) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    public set(r: number, g: number, b: number, a: number): void {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
        this.clamp();
    }

    public setFromColor(c: Color): void {
        this.r = c.r;
        this.g = c.g;
        this.b = c.b;
        this.a = c.a;
    }

    public setFromString(hex: string): void {
        hex = hex.charAt(0) === '#' ? hex.substr(1) : hex;
        this.r = parseInt(hex.substr(0, 2), 16) / 255.0;
        this.g = parseInt(hex.substr(2, 2), 16) / 255.0;
        this.b = parseInt(hex.substr(4, 2), 16) / 255.0;
        this.a = (hex.length !== 8 ? 255 : parseInt(hex.substr(6, 2), 16)) / 255.0;
    }

    public add(r: number, g: number, b: number, a: number): void {
        this.r += r;
        this.g += g;
        this.b += b;
        this.a += a;
        this.clamp();
    }

    public clamp(): Color {
        if (this.r < 0) {
            this.r = 0;
        } else if (this.r > 1) {
            this.r = 1;
        }

        if (this.g < 0) {
            this.g = 0;
        } else if (this.g > 1) {
            this.g = 1;
        }

        if (this.b < 0) {
            this.b = 0;
        } else if (this.b > 1) {
            this.b = 1;
        }

        if (this.a < 0) {
            this.a = 0;
        } else if (this.a > 1) {
            this.a = 1;
        }
        return this;
    }
}
export default Color;
