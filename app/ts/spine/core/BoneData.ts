class BoneData {

    public index: number;
    public name: string;
    public parent: BoneData;
    public length: number;
    public x: number;
    public y: number;
    public rotation: number;
    public scaleX: number;
    public scaleY: number;
    public shearX: number;
    public shearY: number;
    public inheritRotation: boolean;
    public inheritScale: boolean;



    constructor(index: number, name: string, parent: BoneData) {
        if(index < 0) {
            throw new Error('index must be >= 0.');
        }
        if(name === null) {
            throw new Error('name cannot be null.');
        }
        this.index = index;
        this.name = name;
        this.parent = parent;
        this.x = 0;
        this.y = 0;
        this.rotation = 0;
        this.scaleX = 1.0;
        this.scaleY = 1.0;
        this.shearX = 0;
        this.shearY = 0;
        this.inheritRotation = true;
        this.inheritScale = true;
    }
}
export default BoneData;
