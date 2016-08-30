import BoneData from './BoneData';
import SlotData from './SlotData';
import Skin from './Skin';
import EventData from './events/EventData';
import Animation from './Animation';
import IkConstraintData from './IkConstraintData';
import TransformConstraintData from './TransformConstraintData';
import PathConstraintData from './PathConstraintData';
class SkeletonData {
    public name: string;
    public bones: Array<BoneData>;
    public slots: Array<SlotData>;
    public skins: Array<Skin>;
    public defaultSkin: Skin;
    public events: Array<EventData>;
    public animations: Array<Animation>;
    public ikConstraints: Array<IkConstraintData>;
    public transformConstraints: Array<TransformConstraintData>;
    public pathConstraints: Array<PathConstraintData>;

    public width: number;
    public height: number;
    public version: string;
    public hash: string;
    public imagesPath: string;


    public findBone (boneName: string): BoneData {
        if (boneName === null) {
            throw new Error('boneName cannot be null.');
        }
        const bones: Array<BoneData> = this.bones;
        for (let i: number = 0, n: number = bones.length; i < n; i++) {
            const bone: BoneData = bones[i];
            if (bone.name === boneName) {
                return bone;
            }
        }
        return null;
    }

    public findBoneIndex (boneName: string): number {
        if (boneName === null) {
            throw new Error('boneName cannot be null.');
        }
        const bones: Array<BoneData> = this.bones;
        for (let i: number = 0, n: number = bones.length; i < n; i++) {
            if (bones[i].name === boneName) {
                return i;
            }
        }
        return -1;
    }

    public findSlot (slotName: string): SlotData {
        if (slotName === null) {
            throw new Error('slotName cannot be null.');
        }
        const slots: Array<SlotData> = this.slots;
        for (let i: number = 0, n: number = slots.length; i < n; i++) {
            const slot: SlotData = slots[i];
            if (slot.name === slotName) {
                return slot;
            }
        }
        return null;
    }

    public findSlotIndex(slotName: string): number {
        if (slotName == null) {
            throw new Error('slotName cannot be null.');
        }
        const slots: Array<SlotData> = this.slots;
        for (let i: number = 0, n: number = slots.length; i < n; i++) {
            if (slots[i].name === slotName) {
                return i;
            }
        }
        return -1;
    }

    public findSkin(skinName: string): Skin {
        if (skinName === null) {
            throw new Error('skinName cannot be null.');
        }
        const skins: Array<Skin> = this.skins;
        for (let i: number = 0, n: number = skins.length; i < n; i++) {
            const skin: Skin = skins[i];
            if (skin.name === skinName) {
                return skin;
            }
        }
        return null;
    }

    public findEvent(eventDataName: string): EventData {
        if (eventDataName === null) {
            throw new Error('eventDataName cannot be null.');
        }
        const events: Array<EventData> = this.events;
        for (let i: number = 0, n: number = events.length; i < n; i++) {
            const event: EventData = events[i];
            if (event.name === eventDataName) {
                return event;
            }
        }
        return null;
    }

    public findAnimation (animationName: string): Animation {
        if (animationName === null) {
            throw new Error('animationName cannot be null.');
        }
        const animations: Array<Animation> = this.animations;
        for (let i: number = 0, n: number = animations.length; i < n; i++) {
            const animation: Animation = animations[i];
            if (animation.name === animationName) {
                return animation;
            }
        }
        return null;
    }

    public findIkConstraint (constraintName: string): IkConstraintData {
        if (constraintName === null) {
            throw new Error('constraintName cannot be null.');
        }
        const ikConstraints: Array<IkConstraintData> = this.ikConstraints;
        for (let i: number = 0, n: number = ikConstraints.length; i < n; i++) {
            const constraint: IkConstraintData = ikConstraints[i];
            if (constraint.name === constraintName) {
                return constraint;
            }
        }
        return null;
    }

    public findTransformConstraint (constraintName: string): TransformConstraintData {
        if (constraintName === null) {
            throw new Error('constraintName cannot be null.');
        }
        const transformConstraints: Array<TransformConstraintData> = this.transformConstraints;
        for (let i: number = 0, n: number = transformConstraints.length; i < n; i++) {
            const constraint: TransformConstraintData = transformConstraints[i];
            if (constraint.name === constraintName) {
                return constraint;
            }
        }
        return null;
    }

    public findPathConstraint (constraintName: string): PathConstraintData {
        if (constraintName === null) {
            throw new Error('constraintName cannot be null.');
        }
        const pathConstraints: Array<PathConstraintData> = this.pathConstraints;
        for (let i: number = 0, n: number = pathConstraints.length; i < n; i++) {
            const constraint: PathConstraintData = pathConstraints[i];
            if (constraint.name === constraintName) {
                return constraint;
            }
        }
        return null;
    }

    public findPathConstraintIndex (pathConstraintName: string): number {
        if (pathConstraintName === null) {
            throw new Error('pathConstraintName cannot be null.');
        }
        const pathConstraints: Array<PathConstraintData> = this.pathConstraints;
        for (let i: number = 0, n: number = pathConstraints.length; i < n; i++) {
            if (pathConstraints[i].name === pathConstraintName) {
                return i;
            }
        }
        return -1;
    }
}
export default SkeletonData;
