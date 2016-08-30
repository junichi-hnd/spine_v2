class Pool<T> {
    private items: Array<T>(16);
    private instantiator: () => T;

    constructor (instantiator: () => T) {
        this.instantiator = instantiator;
    }

    obtain (): T {
        return this.items.length > 0 ? this.items.pop() : this.instantiator();
    }

    free (item: T): void {
        this.items.push(item);
    }

    freeAll (items: ArrayLike<T>): void {
        for (let i: number = 0; i < items.length; i++) {
            this.items[i] = items[i];
        }
    }

    clear (): void {
        this.items.length = 0;
    }
}
export default Pool;
