/******************************************************************************
 * Spine Runtimes Software License
 * Version 2.5
 *
 * Copyright (c) 2013-2016, Esoteric Software
 * All rights reserved.
 *
 * You are granted a perpetual, non-exclusive, non-sublicensable, and
 * non-transferable license to use, install, execute, and perform the Spine
 * Runtimes software and derivative works solely for personal or internal
 * use. Without the written permission of Esoteric Software (see Section 2 of
 * the Spine Software License Agreement), you may not (a) modify, translate,
 * adapt, or develop new applications using the Spine Runtimes or otherwise
 * create derivative works or improvements of the Spine Runtimes or (b) remove,
 * delete, alter, or obscure any trademarks or any copyright, trademark, patent,
 * or other intellectual property or proprietary rights notices on or in the
 * Software, including any copy thereof. Redistributions in binary or source
 * form must include this license and terms.
 *
 * THIS SOFTWARE IS PROVIDED BY ESOTERIC SOFTWARE 'AS IS' AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO
 * EVENT SHALL ESOTERIC SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES, BUSINESS INTERRUPTION, OR LOSS OF
 * USE, DATA, OR PROFITS) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER
 * IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 *****************************************************************************/
import Bone from './Bone';
import Slot from './Slot';
import IkConstraint from './IkConstraint';
import TransformConstraint from './TransformConstraint';
import SkeletonData from './SkeletonData';
import PathConstraint from './PathConstraint';
import IUpdatable from './IUpdatable';
import Skin from './Skin';
import Color from '../utils/Color';
import BoneData from "./BoneData";
import SlotData from "./SlotData";
import IkConstraintData from "./IkConstraintData";
import Attachment from "./attachments/Attachment";
import PathAttachment from "./attachments/PathAttachment";
import TransformConstraintData from "./TransformConstraintData";
import PathConstraintData from "./PathConstraintData";
import Utils from "../utils/Utils";
import Vector2 from "../utils/Vector2";
import RegionAttachment from "./attachments/RegionAttachment";
import MeshAttachment from "./attachments/MeshAttachment";

class Skeleton {
    public data: SkeletonData;
    public bones: Array<Bone>;
    public slots: Array<Slot>;
    public drawOrder: Array<Slot>;
    public ikConstraints: Array<IkConstraint>;
    public ikConstraintsSorted: Array<IkConstraint>;
    public transformConstraints: Array<TransformConstraint>;
    public pathConstraints: Array<PathConstraint>;
    public _updateCache: Array<IUpdatable>;
    public skin: Skin;
    public color: Color;
    public time: number = 0;
    public flipX: boolean = false;
    public flipY: boolean = false;
    public x: number = 0;
    public y: number = 0;

    constructor(data: SkeletonData) {
        if (data === null) {
            throw new Error('data cannot be null.');
        }
        this.data = data;
        this.bones = new Array<Bone>();

        for (let i: number = 0; i < data.bones.length; i++) {
            const boneData: BoneData = data.bones[i];
            let bone: Bone;
            if (boneData.parent == null) {
                bone = new Bone(boneData, this, null);
            } else {
                const parent: Bone = this.bones[boneData.parent.index];
                bone = new Bone(boneData, this, parent);
                parent.children.push(bone);
            }
            this.bones.push(bone);
        }

        this.slots = new Array<Slot>();
        this.drawOrder = new Array<Slot>();
        for (let i: number = 0; i < data.slots.length; i++) {
            const slotData: SlotData = data.slots[i];
            const bone: Bone = this.bones[slotData.boneData.index];
            const slot: Slot = new Slot(slotData, bone);
            this.slots.push(slot);
            this.drawOrder.push(slot);
        }

        this.ikConstraints = new Array<IkConstraint>();
        this.ikConstraintsSorted = new Array<IkConstraint>();
        for (let i: number = 0; i < data.ikConstraints.length; i++) {
            const ikConstraintData: IkConstraintData = data.ikConstraints[i];
            this.ikConstraints.push(new IkConstraint(ikConstraintData, this));
        }

        this.transformConstraints = new Array<TransformConstraint>();
        for (let i: number = 0; i < data.transformConstraints.length; i++) {
            const transformConstraintData: TransformConstraintData = data.transformConstraints[i];
            this.transformConstraints.push(new TransformConstraint(transformConstraintData, this));
        }

        this.pathConstraints = new Array<PathConstraint>();
        for (let i: number = 0; i < data.pathConstraints.length; i++) {
            const pathConstraintData: PathConstraintData = data.pathConstraints[i];
            this.pathConstraints.push(new PathConstraint(pathConstraintData, this));
        }

        this.color = new Color(1, 1, 1, 1);
        this.updateCache();
    }

    public updateCache(): void {
        const updateCache: Array<IUpdatable> = this._updateCache;
        updateCache.length = 0;

        const bones: Array<Bone> = this.bones;
        for (let i = 0, n = bones.length; i < n; i++) {
            bones[i].sorted = false;
        }
        // IK first, lowest hierarchy depth first.
        const ikConstraints: Array<IkConstraint> = this.ikConstraintsSorted;
        ikConstraints.length = 0;
        for (let i = 0; i < this.ikConstraints.length; i++) {
            ikConstraints.push(this.ikConstraints[i]);
        }
        const ikCount: number = ikConstraints.length;
        for (let i: number = 0, level: number = 0, n: number = ikCount; i < n; i++) {
            const ik: IkConstraint = ikConstraints[i];
            let bone: Bone = ik.bones[0].parent;
            for (level = 0; bone !== null; level++) {
                bone = bone.parent;
            }
            ik.level = level;
        }

        for (let i: number = 1, ii: number = 0; i < ikCount; i++) {
            const ik: IkConstraint = ikConstraints[i];
            const level: number = ik.level;
            for (ii = i - 1; ii >= 0; ii--) {
                const other: IkConstraint = ikConstraints[ii];
                if (other.level < level) {
                    break;
                }
                ikConstraints[ii + 1] = other;
            }
            ikConstraints[ii + 1] = ik;
        }

        for (let i: number = 0, n: number = ikConstraints.length; i < n; i++) {
            const constraint: IkConstraint = ikConstraints[i];
            const target: Bone = constraint.target;
            this.sortBone(target);

            const constrained: Array<Bone> = constraint.bones;
            let parent = constrained[0];
            this.sortBone(parent);

            updateCache.push(constraint);

            this.sortReset(parent.children);
            constrained[constrained.length - 1].sorted = true;
        }

        const pathConstraints: Array<PathConstraint> = this.pathConstraints;
        for (let i: number = 0, n: number = pathConstraints.length; i < n; i++) {
            const constraint: PathConstraint = pathConstraints[i];

            const slot: Slot = constraint.target;
            const slotIndex: number = slot.data.index;
            const slotBone: Bone = slot.bone;
            if (this.skin !== null) {
                this.sortPathConstraintAttachment(this.skin, slotIndex, slotBone);
            }
            if (this.data.defaultSkin !== null && this.data.defaultSkin !== this.skin) {
                this.sortPathConstraintAttachment(this.data.defaultSkin, slotIndex, slotBone);
            }

            for (let ii: number = 0, nn: number = this.data.skins.length; ii < nn; ii++) {
                this.sortPathConstraintAttachment(this.data.skins[ii], slotIndex, slotBone);
            }

            const attachment: Attachment = slot.getAttachment();
            if (attachment instanceof PathAttachment) {
                this.sortPathConstraintAttachmentWith(attachment, slotBone);
            }

            const constrained: Array<Bone> = constraint.bones;
            const boneCount: number = constrained.length;
            for (let ii: number = 0; ii < boneCount; ii++) {
                this.sortBone(constrained[ii]);
            }
            updateCache.push(constraint);

            for (let ii: number = 0; ii < boneCount; ii++) {
                this.sortReset(constrained[ii].children);
            }

            for (let ii: number = 0; ii < boneCount; ii++) {
                constrained[ii].sorted = true;
            }
        }

        const transformConstraints: Array<TransformConstraint> = this.transformConstraints;
        for (let i: number = 0, n: number = transformConstraints.length; i < n; i++) {
            const constraint: TransformConstraint = transformConstraints[i];

            this.sortBone(constraint.target);

            const constrained: Array<Bone> = constraint.bones;
            const boneCount: number = constrained.length;
            for (let ii: number = 0; ii < boneCount; ii++) {
                this.sortBone(constrained[ii]);
            }

            updateCache.push(constraint);

            for (let ii: number = 0; ii < boneCount; ii++) {
                this.sortReset(constrained[ii].children);
            }

            for (let ii: number = 0; ii < boneCount; ii++) {
                constrained[ii].sorted = true;
            }
        }

        for(let i: number = 0, n = bones.length; i < n; i++) {
            this.sortBone(bones[i]);
        }
    }

    public sortPathConstraintAttachment (skin: Skin, slotIndex: number, slotBone: Bone): void {
        const attachments: any = skin.attachments[slotIndex];
        if (!attachments) {
            return;
        }
        for (let key in attachments) {
            this.sortPathConstraintAttachmentWith(attachments[key], slotBone);
        }
    }

    public sortPathConstraintAttachmentWith (attachment: Attachment, slotBone: Bone): void {
        if (!(attachment instanceof PathAttachment)) {
            return;
        }
        const pathBones: Array<number> = (<PathAttachment>attachment).bones;
        if (pathBones === null) {
            this.sortBone(slotBone);
        } else {
            const bones: Array<Bone> = this.bones;
            for (let i: number = 0; i < pathBones.length; i++) {
                let boneIndex = pathBones[i];
                this.sortBone(bones[boneIndex]);
            }
        }
    }

    public sortBone (bone: Bone): void {
        if (bone.sorted) {
            return
        }
        const parent: Bone = bone.parent;
        if (parent !== null) {
            this.sortBone(parent);
        }
        bone.sorted = true;
        this._updateCache.push(bone);
    }

    public sortReset (bones: Array<Bone>): void {
        for (let i: number = 0, n: number = bones.length; i < n; i++) {
            const bone: Bone = bones[i];
            if (bone.sorted) {
                this.sortReset(bone.children);
            }
            bone.sorted = false;
        }
    }

    /**
     * Updates the world transform for each bone and applies constraints.
     */
    public updateWorldTransform () {
        const updateCache: Array<IUpdatable> = this._updateCache;
        for (let i: number = 0, n: number = updateCache.length; i < n; i++) {
            updateCache[i].update();
        }
    }

    /**
     * Sets the bones, constraints, and slots to their setup pose values.
     */
    public setToSetupPose (): void {
        this.setBonesToSetupPose();
        this.setSlotsToSetupPose();
    }

    /**
     * Sets the bones and constraints to their setup pose values.
     */
    public setBonesToSetupPose (): void {
        const bones: Array<Bone> = this.bones;
        for (let i: number = 0, n: number = bones.length; i < n; i++) {
            bones[i].setToSetupPose();
        }

        const ikConstraints: Array<IkConstraint> = this.ikConstraints;
        for (let i: number = 0, n: number = ikConstraints.length; i < n; i++) {
            const constraint: IkConstraint = ikConstraints[i];
            constraint.bendDirection = constraint.data.bendDirection;
            constraint.mix = constraint.data.mix;
        }

        const transformConstraints: Array<TransformConstraint> = this.transformConstraints;
        for (let i: number = 0, n: number = transformConstraints.length; i < n; i++) {
            const constraint: TransformConstraint = transformConstraints[i];
            const data: TransformConstraintData = constraint.data;
            constraint.rotateMix = data.rotateMix;
            constraint.translateMix = data.translateMix;
            constraint.scaleMix = data.scaleMix;
            constraint.shearMix = data.shearMix;
        }

        const pathConstraints: Array<PathConstraint> = this.pathConstraints;
        for (let i: number = 0, n: number = pathConstraints.length; i < n; i++) {
            const constraint: PathConstraint = pathConstraints[i];
            const data: PathConstraintData = constraint.data;
            constraint.position = data.position;
            constraint.spacing = data.spacing;
            constraint.rotateMix = data.rotateMix;
            constraint.translateMix = data.translateMix;
        }
    }

    public setSlotsToSetupPose(): void {
        const slots: Array<Slot> = this.slots;
        Utils.arrayCopy(slots, 0, this.drawOrder, 0, slots.length);
        for (let i: number = 0, n: number = slots.length; i < n; i++) {
            slots[i].setToSetupPose();
        }
    }

    /**
     *
     * @returns {any}   may return null.
     */
    public getRootBone(): Bone {
        if (this.bones.length === 0) {
            return null;
        }
        return this.bones[0];
    }

    /**
     *
     * @param boneName
     * @returns {any}   may be null.
     */
    public findBone (boneName: string): Bone {
        if (boneName === null) {
            throw new Error('boneName cannot be null.');
        }
        const bones: Array<Bone> = this.bones;
        for (let i: number = 0, n: number = bones.length; i < n; i++) {
            const bone: Bone = bones[i];
            if (bone.data.name === boneName) {
                return bone;
            }
        }
        return null;
    }

    /**
     *
     * @param boneName
     * @returns {number}        -1 if the bone was not found.
     */
    public findBoneIndex (boneName: string) {
        if (boneName === null) {
            throw new Error("boneName cannot be null.");
        }
        const bones: Array<Bone> = this.bones;
        for (let i: number = 0, n: number = bones.length; i < n; i++) {
            if (bones[i].data.name === boneName) {
                return i;
            }
        }
        return -1;
    }

    /**
     *
     * @param slotName
     * @returns {any}       may be null.
     */
    public findSlot(slotName: string): Slot {
        if (slotName === null) {
            throw new Error('slotName cannot be null.');
        }
        const slots: Array<Slot> = this.slots;
        for (let i: number = 0, n: number = slots.length; i < n; i++) {
            const slot: Slot = slots[i];
            if (slot.data.name === slotName) {
                return slot;
            }
        }
        return null;
    }

    /**
     *
     * @param slotName      {string}
     * @returns {number}    -1 if the bone was not found.
     */
    public findSlotIndex(slotName: string): number {
        if (slotName === null) {
            throw new Error('slotName cannot be null.');
        }
        const slots: Array<Slot> = this.slots;
        for (let i: number = 0, n: number = slots.length; i < n; i++)
            if (slots[i].data.name === slotName) {
                return i;
            }
        return -1;
    }

    /**
     * Sets a skin by name.
     * @param skinName
     * @see #setSkin(Skin)
     */
    public setSkinByName (skinName: string): void {
        const skin: Skin = this.data.findSkin(skinName);
        if (skin === null) {
            throw new Error(`Skin not found: ${skinName}`);
        }
        this.setSkin(skin);
    }

    /**
     * Sets the skin used to look up attachments before looking in the {@link SkeletonData#getDefaultSkin() default skin}.
     * Attachments from the new skin are attached if the corresponding attachment from the old skin was attached. If there was no
     * old skin, each slot's setup mode attachment is attached from the new skin.
     * @param newSkin   newSkin May be null.
     */
    public setSkin (newSkin: Skin): void {
        if (newSkin !== null) {
            if (this.skin !== null) {
                newSkin.attachAll(this, this.skin);
            } else {
                const slots: Array<Slot> = this.slots;
                for (let i: number = 0, n: number = slots.length; i < n; i++) {
                    const slot: Slot = slots[i];
                    const name: string = slot.data.attachmentName;
                    if (name !== null) {
                        const attachment: Attachment = newSkin.getAttachment(i, name);
                        if (attachment !== null) {
                            slot.setAttachment(attachment);
                        }
                    }
                }
            }
        }
        this.skin = newSkin;
    }

    /**
     *
     * @param slotName
     * @param attachmentName
     * @returns {any}   may be null.
     */
    public getAttachmentByName (slotName: string, attachmentName: string): Attachment {
        return this.getAttachment(this.data.findSlotIndex(slotName), attachmentName);
    }

    /**
     *
     * @param slotIndex
     * @param attachmentName
     * @returns {any}   may be null.
     */
    public getAttachment (slotIndex: number, attachmentName: string): Attachment {
        if (attachmentName === null) {
            throw new Error('attachmentName cannot be null.');
        }

        if (this.skin !== null) {
            const attachment: Attachment = this.skin.getAttachment(slotIndex, attachmentName);
            if (attachment !== null) {
                return attachment;
            }
        }
        if (this.data.defaultSkin !== null) {
            return this.data.defaultSkin.getAttachment(slotIndex, attachmentName);
        }
        return null;
    }

    /**
     *
     * @param slotName
     * @param attachmentName    {string}    may be null.
     */
    public setAttachment (slotName: string, attachmentName: string): void {
        if (slotName === null) {
            throw new Error('slotName cannot be null.');
        }
        const slots: Array<Slot> = this.slots;
        for (let i: number = 0, n: number = slots.length; i < n; i++) {
            const slot: Slot = slots[i];
            if (slot.data.name === slotName) {
                let attachment: Attachment = null;
                if (attachmentName !== null) {
                    attachment = this.getAttachment(i, attachmentName);
                    if (attachment == null) {
                        throw new Error(`Attachment not found: ${attachmentName}, for slot: ${slotName}`);
                    }
                }
                slot.setAttachment(attachment);
                return;
            }
        }
        throw new Error(`Slot not fount: ${slotName}`);
    }

    /**
     * @param constraintName
     * @returns {any}   may be null.
     */
    public findIkConstraint (constraintName: string): IkConstraint {
        if (constraintName === null) {
            throw new Error('constraintName cannot be null.');
        }
        const ikConstraints: Array<IkConstraint> = this.ikConstraints;
        for (let i: number = 0, n: number = ikConstraints.length; i < n; i++) {
            const ikConstraint: IkConstraint = ikConstraints[i];
            if (ikConstraint.data.name === constraintName) {
                return ikConstraint;
            }
        }
        return null;
    }

    /**
     *
     * @param constraintName
     * @returns {any}   may be null.
     */
    public findTransformConstraint (constraintName: string): TransformConstraint {
        if (constraintName === null) {
            throw new Error('constraintName cannot be null.');
        }
        const transformConstraints: Array<TransformConstraint> = this.transformConstraints;
        for (let i: number = 0, n: number = transformConstraints.length; i < n; i++) {
            const constraint: TransformConstraint = transformConstraints[i];
            if (constraint.data.name === constraintName) {
                return constraint;
            }
        }
        return null;
    }

    /**
     *
     * @param constraintName
     * @returns {any}       may be null.
     */
    public findPathConstraint (constraintName: string) {
        if (constraintName === null) {
            throw new Error('constraintName cannot be null.');
        }
        const pathConstraints: Array<PathConstraint> = this.pathConstraints;
        for (let i: number = 0, n: number = pathConstraints.length; i < n; i++) {
            const constraint: PathConstraint = pathConstraints[i];
            if (constraint.data.name === constraintName) {
                return constraint;
            }
        }
        return null;
    }

    public getBounds(offset: Vector2, size: Vector2): void {
        if (offset === null) {
            throw new Error('offset cannot be null.');
        }
        if (size === null) {
            throw new Error('size cannot be null.');
        }
        const drawOrder: Array<Slot> = this.drawOrder;
        let minX: number = Number.POSITIVE_INFINITY, minY: number = Number.POSITIVE_INFINITY, maxX: number = Number.NEGATIVE_INFINITY, maxY: number = Number.NEGATIVE_INFINITY;
        for (let i: number = 0, n: number = drawOrder.length; i < n; i++) {
            const slot = drawOrder[i];
            let vertices: ArrayLike<number> = null;
            const attachment = slot.getAttachment();
            if (attachment instanceof RegionAttachment) {
                vertices = (<RegionAttachment>attachment).updateWorldVertices(slot, false);
            } else if (attachment instanceof MeshAttachment) {
                vertices = (<MeshAttachment>attachment).updateWorldVertices(slot, true);
            }
            if (vertices !== null) {
                for (let ii: number = 0, nn: number = vertices.length; ii < nn; ii += 8) {
                    const x: number = vertices[ii];
                    const y: number = vertices[ii + 1];
                    minX = Math.min(minX, x);
                    minY = Math.min(minY, y);
                    maxX = Math.max(maxX, x);
                    maxY = Math.max(maxY, y);
                }
            }
        }
        offset.set(minX, minY);
        size.set(maxX - minX, maxY - minY);
    }
    public update (delta: number): void {
        this.time += delta;
    }
}

export default Skeleton;