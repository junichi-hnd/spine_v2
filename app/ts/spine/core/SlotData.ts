import BoneData from './BoneData';
import Color from '../utils/Color';
import {BlendMode} from './BlendMode';

class SlotData {
    public index: number;
    public name: string;
    public boneData: BoneData;
    public color: Color;
    public attachmentName: string;
    public blendMode: BlendMode;

    constructor (index: number, name: string, boneData: BoneData) {
        if(index < 0) {
            throw new Error('index must be >= 0.');
        }
        if(name === null) {
            throw new Error('name cannnot be null.');
        }
        if(boneData === null) {
            throw new Error('boneData cannot be null.');
        }
        this.index = index;
        this.name = name;
        this.boneData = boneData;
    }
}
export default SlotData;
