import SkeletonData from './SkeletonData';
import IMap from './IMap';
import Animation from './Animation';
class AnimationStateData {

    public skeletonData: SkeletonData;
    public animationToMixTime: IMap<number>;
    public defaultMix: number;

    constructor(skeletonData: SkeletonData) {
        //
        if(skeletonData === null) {
            throw new Error('skeletonData cannot be null.');
        }
        this.skeletonData = skeletonData;
        this.animationToMixTime = {};
        this.defaultMix = 0;
    }

    public setMix(fromName: string, toName: string, duration: number): void {
        const from: Animation = this.skeletonData.findAnimation(fromName);
        if (from === null) {
            throw new Error(`Animation not found: ${fromName}`);
        }
        const to: Animation = this.skeletonData.findAnimation(toName);
        if (to === null) {
            throw new Error(`Animation not found: ${toName}`);
        }
        this.setMixWith(from, to, duration);
    }

    public setMixWith(from: Animation, to: Animation, duration: number): void {
        if(from === null) {
            throw new Error('from cannot be null.');
        }
        if(to === null) {
            throw new Error('to cannot be null.');
        }
        const key: string = `${from.name}${to.name}`;
        this.animationToMixTime[key] = duration;
    }

    public getMix(from: Animation, to: Animation): number {
        const key: string = `${from.name}${to.name}`;
        const value: number = this.animationToMixTime[key];
        return typeof value === 'undefined' ? this.defaultMix : value;
    }
}
export default AnimationStateData;
