class MathUtils {
    static PI: number = 3.1415927;
    static PI2: number = MathUtils.PI * 2;
    static radiansToDegrees: number = 180 / MathUtils.PI;
    static radDeg: number = MathUtils.radiansToDegrees;
    static degreesToRadians: number = MathUtils.PI / 180;
    static degRad: number = MathUtils.degreesToRadians;

    static clamp(value: number, min: number, max: number): number {
        if(value < min) {
            return min;
        }
        if(value > max) {
            return max;
        }
        return value;
    }

    static cosDeg (degrees: number): number {
        return Math.cos(degrees * MathUtils.degRad);
    }

    static sinDeg (degrees: number): number {
        return Math.sin(degrees * MathUtils.degRad);
    }

    static signum (value: number): number {
        return value >= 0 ? 1 : -1;
    }

    static toInt (x: number): number {
        return x > 0 ? Math.floor(x) : Math.ceil(x);
    }
}
export default MathUtils;
