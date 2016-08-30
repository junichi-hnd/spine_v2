
import BoneData from './BoneData';
import SlotData from './SlotData';


export enum PositionMode  {
    Fixed, Percent
}

export enum SpacingMode {
    Length, Fixed, Percent
}

export enum RotateMode {
    Tangent, Chain, ChainScale
}

class PathConstraintData {
    public name: string;
    public bones: Array<BoneData>;
    public target: SlotData;
    public positionMode: PositionMode;
    public spacingMode: SpacingMode;
    public rotateMode: RotateMode;
    public offsetRotation: number;
    public position: number;
    public spacing: number;
    public rotateMix: number;
    public translateMix: number;

    constructor(name: string) {
        this.name = name;
    }
}
export default PathConstraintData;
