class Vector2 {
    public x: number;
    public y: number;

    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }

    public set(x: number, y: number): Vector2 {
        this.x = x;
        this.y = y;
        return this;
    }
}
export default Vector2;
