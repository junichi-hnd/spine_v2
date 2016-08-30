class Utils {
    static SUPPORTS_TYPED_ARRAYS: boolean = typeof(Float32Array) !== 'undefined';

    static arrayCopy<T> (source: ArrayLike<T>, sourceStart: number, dest: ArrayLike<T>, destStart: number, numElements: number): void {
        for (let i: number = sourceStart, j: number = destStart; i < sourceStart + numElements; i++, j++) {
            dest[j] = source[i];
        }
    }

    static setArraySize<T> (array: Array<T>, size: number, value: any = 0): Array<T> {
        let oldSize: number = array.length;
        if (oldSize === size) {
            return array;
        }
        array.length = size;
        if (oldSize < size) {
            for (let i: number = oldSize; i < size; i++) {
                array[i] = value;
            }
        }
        return array;
    }

    static newArray<T> (size: number, defaultValue: T): Array<T> {
        let array: Array<T> = new Array<T>(size);
        for (let i: number = 0; i < size; i++) {
            array[i] = defaultValue;
        }
        return array;
    }

    static newFloatArray (size: number): ArrayLike<number> {
        if (Utils.SUPPORTS_TYPED_ARRAYS) {
            return new Float32Array(size);
        } else {
            let array: Array<number> = new Array<number>(size);
            for (let i: number = 0; i < array.length; i++) {
                array[i] = 0;
            }
            return array;
        }
    }

    static toFloatArray (array: Array<number>): any {
        return Utils.SUPPORTS_TYPED_ARRAYS ? new Float32Array(array) : array;
    }
}
export default Utils;
