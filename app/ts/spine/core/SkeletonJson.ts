import IAttachmentLoader from './attachments/IAttachmentLoader';
import LinkedMesh from './LinkedMesh';
import SkeletonData from './SkeletonData';
import BoneData from './BoneData';
import SlotData from './SlotData';
import IkConstraintData from './IkConstraintData';
import TransformConstraintData from './TransformConstraintData';
import PathConstraintData from './PathConstraintData';
import {PositionMode} from './PathConstraintData';
import Skin from './Skin';
import Attachment from './attachments/Attachment';
import MeshAttachment from './attachments/MeshAttachment';
import EventData from './events/EventData';
import RegionAttachment from './attachments/RegionAttachment';
import BoundingBoxAttachment from './attachments/BoundingBoxAttachment';
import PathAttachment from './attachments/PathAttachment';
import Utils from '../utils/Utils';
import VertexAttachment from './attachments/VertexAttachment';
import ITimeline from './timeline/ITimeline';
import ColorTimeline from './timeline/ColorTimeline';
import Color from '../utils/Color';
import AttachmentTimeline from './timeline/AttachmentTimeline';
import RotateTimeline from './timeline/RotateTimeline';
import TranslateTimeline from './timeline/TranslateTimeline';
import ScaleTimeline from './timeline/ScaleTimeline';
import ShearTimeline from './timeline/ShearTimeline';
import IkConstraintTimeline from './timeline/IkConstraintTimeline';
import TransformConstraintTimeline from './timeline/TransformConstraintTimeline';
import PathConstraintPositionTimeline from './timeline/PathConstraintPositionTimeline';
import PathConstraintSpacingTimeline from './timeline/PathConstraintSpacingTimeline';
import {SpacingMode} from './PathConstraintData';
import PathConstraintMixTimeline from './timeline/PathConstraintMixTimeline';
import DeformTimeline from './timeline/DeformTimeline';
import DrawOrderTimeline from './timeline/DrawOrderTimeline';
import EventTimeline from './timeline/EventTimeline';
import Event from './events/Event';
import Animation from './Animation';
import {BlendMode} from './BlendMode';
import {RotateMode} from './PathConstraintData';
import CurveTimeline from './timeline/CurveTimeline';

class SkeletonJson {
    public attachmentLoader: IAttachmentLoader;
    public scale: number;

    private linkedMeshes: Array<LinkedMesh> = new Array<LinkedMesh>();

    constructor (attachmentLoader: IAttachmentLoader) {
        this.attachmentLoader = attachmentLoader;
        this.scale = 1.0;
    }

    public readSkeletonData (json: string): SkeletonData {
        const scale: number = this.scale;
        const skeletonData: SkeletonData = new SkeletonData();
        const root: any = JSON.parse(json);

        const skeletonMap: any = root.skeleton;
        // Skeleton
        if (skeletonMap !== null) {
            skeletonData.hash = skeletonMap.hash;
            skeletonData.version = skeletonMap.spine;
            skeletonData.width = skeletonMap.width;
            skeletonData.height = skeletonMap.height;
            skeletonData.imagesPath = skeletonMap.images;
        }

        // Bones
        if (root.bones) {
            for (let i: number = 0; i < root.bones.length; i++) {
                const boneMap: any = root.bones[i];

                let parent: BoneData = null;
                const parentName: string = this.getValue(boneMap, 'parent', null);
                if (parentName !== null) {
                    parent = skeletonData.findBone(parentName);
                    if (parent === null) {
                        throw new Error(`Parent bone not found: ${parentName}`);
                    }
                }
                const data: BoneData = new BoneData(skeletonData.bones.length, boneMap.name, parent);
                data.length = this.getValue(boneMap, 'length', 0) * scale;
                data.x = this.getValue(boneMap, 'x', 0) * scale;
                data.y = this.getValue(boneMap, 'y', 0) * scale;
                data.rotation = this.getValue(boneMap, 'rotation', 0);
                data.scaleX = this.getValue(boneMap, 'scaleX', 1);
                data.scaleY = this.getValue(boneMap, 'scaleY', 1);
                data.shearX = this.getValue(boneMap, 'shearX', 0);
                data.shearY = this.getValue(boneMap, 'shearY', 0);
                data.inheritRotation = this.getValue(boneMap, 'inheritRotation', true);
                data.inheritScale = this.getValue(boneMap, 'inheritScale', true);

                skeletonData.bones.push(data);
            }
        }

        // Slots.
        if (root.slots) {
            for (let i: number = 0; i < root.slots.length; i++) {
                const slotMap: any = root.slots[i];
                const slotName: string = slotMap.name;
                const boneName: string = slotMap.bone;
                const boneData: BoneData = skeletonData.findBone(boneName);
                if (boneData === null) {
                    throw new Error(`Slot bone not found: ${boneName}`);
                }
                const data: SlotData = new SlotData(skeletonData.slots.length, slotName, boneData);
                const color: string = slotMap.color ? slotMap.color : null;
                if (color !== null) {
                    data.color.setFromString(color);
                }

                data.attachmentName = this.getValue(slotMap, 'attachment', null);
                data.blendMode = SkeletonJson.blendModeFromString(this.getValue(slotMap, 'blend', 'normal'));
                skeletonData.slots.push(data);
            }
        }

        // IK constraints
        if (root.ik) {
            for (let i: number = 0; i < root.ik.length; i++) {
                const constraintMap: any = root.ik[i];
                const data: IkConstraintData = new IkConstraintData(constraintMap.name);
                for (let j: number = 0; j < constraintMap.bones.length; j++) {
                    const boneName: any = constraintMap.bones[j];
                    const bone: BoneData = skeletonData.findBone(boneName);
                    if (bone === null) {
                        throw new Error(`IK bone not found: ${boneName}`);
                    }
                    data.bones.push(bone);
                }
                const targetName: string = constraintMap.target;
                data.target = skeletonData.findBone(targetName);
                if (data.target === null) {
                    throw new Error(`IK target bone not found: ${targetName}`);
                }

                data.bendDirection = this.getValue(constraintMap, 'bendPositive', true) ? 1 : -1;
                data.mix = constraintMap.mix ? constraintMap.mix : 1;

                skeletonData.ikConstraints.push(data);
            }
        }

        // Transform constraints.
        if (root.transform) {
            for (let i: number = 0; i < root.transform.length; i++) {
                const constraintMap: any = root.transform[i];
                const data: TransformConstraintData = new TransformConstraintData(constraintMap.name);
                for (let j: number = 0; j < constraintMap.bones.length; j++) {
                    const boneName: any = constraintMap.bones[j];
                    const bone: BoneData = skeletonData.findBone(boneName);
                    if (bone === null) {
                        throw new Error(`Transform constraint bone not found: ${boneName}`);
                    }
                    data.bones.push(bone);
                }

                const targetName: string = constraintMap.target;
                data.target = skeletonData.findBone(targetName);
                if (data.target === null) {
                    throw new Error(`Transform constraint target bone not found: ${targetName}`);
                }

                data.offsetRotation = this.getValue(constraintMap, 'rotation', 0);
                data.offsetX = this.getValue(constraintMap, 'x', 0) * scale;
                data.offsetY = this.getValue(constraintMap, 'y', 0) * scale;
                data.offsetScaleX = this.getValue(constraintMap, 'scaleX', 0);
                data.offsetScaleY = this.getValue(constraintMap, 'scaleY', 0);
                data.offsetShearY = this.getValue(constraintMap, 'shearY', 0);

                data.rotateMix = this.getValue(constraintMap, 'rotateMix', 1);
                data.translateMix = this.getValue(constraintMap, 'translateMix', 1);
                data.scaleMix = this.getValue(constraintMap, 'scaleMix', 1);
                data.shearMix = this.getValue(constraintMap, 'shearMix', 1);

                skeletonData.transformConstraints.push(data);
            }
        }

        // Path constraints.
        if (root.path) {
            for (let i: number = 0; i < root.path.length; i++) {
                const constraintMap: any = root.path[i];
                const data: PathConstraintData = new PathConstraintData(constraintMap.name);

                for (let j: number = 0; j < constraintMap.bones.length; j++) {
                    const boneName: any = constraintMap.bones[j];
                    const bone: BoneData = skeletonData.findBone(boneName);
                    if (bone === null) {
                        throw new Error(`Transform constraint bone not found: ${boneName}`);
                    }
                    data.bones.push(bone);
                }

                const targetName: string = constraintMap.target;
                data.target = skeletonData.findSlot(targetName);
                if (data.target === null) {
                    throw new Error(`Path target slot not found: ${targetName}`);
                }

                data.positionMode = SkeletonJson.positionModeFromString(this.getValue(constraintMap, 'positionMode', 'percent'));
                data.spacingMode = SkeletonJson.spacingModeFromString(this.getValue(constraintMap, 'spacingMode', 'length'));
                data.rotateMode = SkeletonJson.rotateModeFromString(this.getValue(constraintMap, 'rotateMode', 'tangent'));
                data.offsetRotation = this.getValue(constraintMap, 'rotation', 0);
                data.position = this.getValue(constraintMap, 'position', 0);

                if (data.positionMode === PositionMode.Fixed) {
                    data.position *= scale;
                }
                data.spacing = this.getValue(constraintMap, 'spacing', 0);
                if (data.spacingMode === SpacingMode.Length || data.spacingMode === SpacingMode.Fixed) {
                    data.spacing *= scale;
                }
                data.rotateMix = this.getValue(constraintMap, 'rotateMix', 1);
                data.translateMix = this.getValue(constraintMap, 'translateMix', 1);
                skeletonData.pathConstraints.push(data);
            }
        }

        // Skins.
        if (root.skins) {
            for (let skinName in root.skins) {
                if(root.skins.hasOwnProperty(skinName)) {
                    const skinMap: any = root.skins[skinName];
                    const skin: Skin = new Skin(skinName);
                    for (let slotName in skinMap) {
                        if(skinMap.hasOwnProperty(slotName)) {
                            const slotIndex: number = skeletonData.findSlotIndex(slotName);
                            if (slotIndex === -1) {
                                throw new Error(`Slot not found: ${slotName}`);
                            }
                            const slotMap: any = skinMap[slotName];
                            for (let entryName in slotMap) {
                                if(slotMap.hasOwnProperty(entryName)) {
                                    const attachment: Attachment = this.readAttachment(slotMap[entryName], skin, slotIndex, entryName);
                                    if (attachment !== null) {
                                        skin.addAttachment(slotIndex, entryName, attachment);
                                    }
                                }
                            }
                        }
                    }
                    skeletonData.skins.push(skin);
                    if (skin.name === 'default') {
                        skeletonData.defaultSkin = skin;
                    }
                }
            }
        }

        // Linked meshes.
        for (let i: number = 0, n: number = this.linkedMeshes.length; i < n; i++) {
            const linkedMesh: LinkedMesh = this.linkedMeshes[i];
            const skin: Skin = linkedMesh.skin == null ? skeletonData.defaultSkin : skeletonData.findSkin(linkedMesh.skin);
            if (skin === null) {
                throw new Error(`Skin not found: ${linkedMesh.skin}`);
            }
            const parent: Attachment = skin.getAttachment(linkedMesh.slotIndex, linkedMesh.parent);
            if (parent === null) {
                throw new Error(`Parent mesh not found: ${linkedMesh.parent}`);
            }
            linkedMesh.mesh.setParentMesh(<MeshAttachment> parent);
            linkedMesh.mesh.updateUVs();
        }
        this.linkedMeshes.length = 0;

        // Events.
        if (root.events) {
            for (let eventName in root.events) {
                if(root.events.hasOwnProperty(eventName)) {
                    const eventMap: any = root.events[eventName];
                    const data: EventData = new EventData(eventName);
                    data.intValue = this.getValue(eventMap, 'int', 0);
                    data.floatValue = this.getValue(eventMap, 'float', 0);
                    data.stringValue = this.getValue(eventMap, 'string', null);
                    skeletonData.events.push(data);
                }
            }
        }

        // Animations.
        if (root.animations) {
            for (let animationName in root.animations) {
                if(root.animations.hasOwnProperty(animationName)) {
                    const animationMap: any = root.animations[animationName];
                    this.readAnimation(animationMap, animationName, skeletonData);
                }
            }
        }
        return skeletonData;
    }

    public readAttachment(map: any, skin: Skin, slotIndex: number, name: string): Attachment {
        const scale: number = this.scale;
        name = this.getValue(map, 'name', name);

        const type: string = String(this.getValue(map, 'type', 'region'));
        let path: any;

        if(type === 'region') {
            path = this.getValue(map, 'path', name);
            const region: RegionAttachment = this.attachmentLoader.newRegionAttachment(skin, name, path);
            if (region === null) {
                return null;
            }
            region.path = path;
            region.x = this.getValue(map, 'x', 0) * scale;
            region.y = this.getValue(map, 'y', 0) * scale;
            region.scaleX = this.getValue(map, 'scaleX', 1);
            region.scaleY = this.getValue(map, 'scaleY', 1);
            region.rotation = this.getValue(map, 'rotation', 0);
            region.width = map.width * scale;
            region.height = map.height * scale;

            const color: string = this.getValue(map, 'color', null);
            if (color !== null) {
                region.color.setFromString(color);
            }
            region.updateOffset();
            return region;
        } else if(type === 'boundingbox') {
            const box: BoundingBoxAttachment = this.attachmentLoader.newBoundingBoxAttachment(skin, name);
            if (box === null) {
                return null;
            }
            this.readVertices(map, box, map.vertexCount << 1);
            return box;
        } else if(type === 'mesh' || type === 'linkedmesh') {
            path = this.getValue(map, 'path', name);
            const mesh: MeshAttachment = this.attachmentLoader.newMeshAttachment(skin, name, path);
            if (mesh === null) {
                return null;
            }
            mesh.path = path;

            const color: any = this.getValue(map, 'color', null);
            if (color !== null) {
                mesh.color.setFromString(color);
            }

            let parent: string = this.getValue(map, 'parent', null);
            if (parent !== null) {
                mesh.inheritDeform = this.getValue(map, 'deform', true);
                this.linkedMeshes.push(new LinkedMesh(mesh, <string> this.getValue(map, 'skin', null), slotIndex, parent));
                return mesh;
            }

            let uvs: Array<number> = map.uvs;
            this.readVertices(map, mesh, uvs.length);
            mesh.triangles = map.triangles;
            mesh.regionUVs = uvs;
            mesh.updateUVs();

            mesh.hullLength = this.getValue(map, 'hull', 0) * 2;
            return mesh;
        } else if(type === 'path') {
            path = this.attachmentLoader.newPathAttachment(skin, name);
            if (path === null) {
                return null;
            }
            path.closed = this.getValue(map, 'closed', false);
            path.constantSpeed = this.getValue(map, 'constantSpeed', true);

            const vertexCount: any = map.vertexCount;
            this.readVertices(map, path, vertexCount << 1);

            const lengths: Array<number> = Utils.newArray(vertexCount / 3, 0);
            for (let i: number = 0; i < map.lengths.length; i++) {
                lengths[i++] = map.lengths[i] * scale;
            }
            path.lengths = lengths;
            return path;
        }

        /*switch (type) {
            case 'region': {
                const path: any = this.getValue(map, 'path', name);
                const region: RegionAttachment = this.attachmentLoader.newRegionAttachment(skin, name, path);
                if (region === null) {
                    return null;
                }
                region.path = path;
                region.x = this.getValue(map, 'x', 0) * scale;
                region.y = this.getValue(map, 'y', 0) * scale;
                region.scaleX = this.getValue(map, 'scaleX', 1);
                region.scaleY = this.getValue(map, 'scaleY', 1);
                region.rotation = this.getValue(map, 'rotation', 0);
                region.width = map.width * scale;
                region.height = map.height * scale;

                const color: string = this.getValue(map, 'color', null);
                if (color !== null) {
                    region.color.setFromString(color);
                }
                region.updateOffset();
                return region;
            }
            case 'boundingbox': {
                const box: BoundingBoxAttachment = this.attachmentLoader.newBoundingBoxAttachment(skin, name);
                if (box === null) {
                    return null;
                }
                this.readVertices(map, box, map.vertexCount << 1);
                return box;
            }
            case 'mesh':
            case 'linkedmesh': {
                const path: any = this.getValue(map, 'path', name);
                const mesh: MeshAttachment = this.attachmentLoader.newMeshAttachment(skin, name, path);
                if (mesh === null) {
                    return null;
                }
                mesh.path = path;

                const color: any = this.getValue(map, 'color', null);
                if (color !== null) {
                    mesh.color.setFromString(color);
                }

                let parent: string = this.getValue(map, 'parent', null);
                if (parent !== null) {
                    mesh.inheritDeform = this.getValue(map, 'deform', true);
                    this.linkedMeshes.push(new LinkedMesh(mesh, <string> this.getValue(map, 'skin', null), slotIndex, parent));
                    return mesh;
                }

                let uvs: Array<number> = map.uvs;
                this.readVertices(map, mesh, uvs.length);
                mesh.triangles = map.triangles;
                mesh.regionUVs = uvs;
                mesh.updateUVs();

                mesh.hullLength = this.getValue(map, 'hull', 0) * 2;
                return mesh;
            }
            case 'path': {
                const path: PathAttachment = this.attachmentLoader.newPathAttachment(skin, name);
                if (path === null) {
                    return null;
                }
                path.closed = this.getValue(map, 'closed', false);
                path.constantSpeed = this.getValue(map, 'constantSpeed', true);

                const vertexCount: any = map.vertexCount;
                this.readVertices(map, path, vertexCount << 1);

                const lengths: Array<number> = Utils.newArray(vertexCount / 3, 0);
                for (let i: number = 0; i < map.lengths.length; i++) {
                    lengths[i++] = map.lengths[i] * scale;
                }
                path.lengths = lengths;
                return path;
            }
            default:
                throw new Error(`Cannot find yout type: ${type}`);
                break;
        }*/
        return null;
    }

    public readVertices(map: any, attachment: VertexAttachment, verticesLength: number): void {
        const scale: number = this.scale;
        attachment.worldVerticesLength = verticesLength;
        const vertices: Array<number> = map.vertices;
        if (verticesLength === vertices.length) {
            if (scale !== 1) {
                for (let i: number = 0, n: number = vertices.length; i < n; i++) {
                    vertices[i] *= scale;
                }
            }
            attachment.vertices = Utils.toFloatArray(vertices);
            return;
        }
        const weights: Array<number> = [];
        const bones: Array<number> = [];
        for (let i: number = 0, n: number = vertices.length; i < n;) {
            const boneCount: number = vertices[i++];
            bones.push(boneCount);
            for (let nn: number = i + boneCount * 4; i < nn; i += 4) {
                bones.push(vertices[i]);
                weights.push(vertices[i + 1] * scale);
                weights.push(vertices[i + 2] * scale);
                weights.push(vertices[i + 3]);
            }
        }
        attachment.bones = bones;
        attachment.vertices = Utils.toFloatArray(weights);
    }

    public readAnimation(map: any, name: string, skeletonData: SkeletonData): void {
        const scale: number = this.scale;
        const timelines: Array<ITimeline> = [];
        let duration: number = 0;
        // Slot timelines.
        if (map.slots) {
            for (let slotName in map.slots) {
                if(map.slots.hasOwnProperty(slotName)) {
                    const slotMap: any = map.slots[slotName];
                    const slotIndex: number = skeletonData.findSlotIndex(slotName);
                    if (slotIndex === -1) {
                        throw new Error(`Slot not found: ${slotName}`);
                    }
                    let timeline: ColorTimeline | AttachmentTimeline | RotateTimeline;
                    let frameIndex: number = 0;
                    for (let timelineName in slotMap) {
                        if(slotMap.hasOwnProperty(timelineName)) {
                            const timelineMap: any = slotMap[timelineName];
                            if(timelineName === 'color') {
                                timeline = new ColorTimeline(timelineMap.length);
                                timeline.slotIndex = slotIndex;
                                frameIndex = 0;
                                for (let i: number = 0; i < timelineMap.length; i++) {
                                    let valueMap: any = timelineMap[i];
                                    const color: Color = new Color();
                                    color.setFromString(valueMap.color);
                                    timeline.setFrame(frameIndex, valueMap.time, color.r, color.g, color.b, color.a);
                                    this.readCurve(valueMap, timeline, frameIndex);
                                    frameIndex++;
                                }
                                timelines.push(timeline);
                                duration = Math.max(duration, timeline.frames[(timeline.getFrameCount() - 1) * ColorTimeline.ENTRIES]);
                            } else if(timelineName === 'attachment') {
                                timeline = new AttachmentTimeline(timelineMap.length);
                                timeline.slotIndex = slotIndex;
                                frameIndex = 0;
                                for (let i: number = 0; i < timelineMap.length; i++) {
                                    let valueMap: any = timelineMap[i];
                                    timeline.setFrame(frameIndex++, valueMap.time, valueMap.name);
                                }
                                timelines.push(timeline);
                                duration = Math.max(duration, timeline.frames[timeline.getFrameCount() - 1]);
                            } else {
                                // throw new Error('Invalid timeline type for a slot: ' + timelineName + ' (' + slotName + ')');
                                throw new Error(`Invalid timeline type for a slot: ${timelineName} ( ${slotName})`);
                            }
                        }
                    }
                }
            }
        }

        if(map.bones) {
            for(let boneName in map.bones) {
                if(map.bones.hasOwnProperty(boneName)) {
                    const boneMap: any = map.bones[boneName];
                    const boneIndex: number = skeletonData.findBoneIndex(boneName);
                    if (boneIndex === -1) {
                        throw new Error(`Bone not found: ${boneName}`);
                    }
                    for(let timelineName in boneMap) {
                        if(boneMap.hasOwnProperty(timelineName)) {
                            const timelineMap: any = boneMap[timelineName];
                            if (timelineName === 'rotate') {
                                const timeline: RotateTimeline = new RotateTimeline(timelineMap.length);
                                timeline.boneIndex = boneIndex;
                                let frameIndex: number = 0;
                                for (let i: number = 0; i < timelineMap.length; i++) {
                                    const valueMap: any = timelineMap[i];
                                    timeline.setFrame(frameIndex, valueMap.time, valueMap.angle);
                                    this.readCurve(valueMap, timeline, frameIndex);
                                    frameIndex++;
                                }
                                timelines.push(timeline);
                                duration = Math.max(duration, timeline.frames[(timeline.getFrameCount() - 1) * RotateTimeline.ENTRIES]);
                            } else if(timelineName === 'translate' || timelineName === 'scale' || timelineName === 'shear') {
                                let timeline: TranslateTimeline = null;
                                let timelineScale: number = 1;
                                if (timelineName === 'scale') {
                                    timeline = new ScaleTimeline(timelineMap.length);
                                } else if (timelineName === 'shear') {
                                    timeline = new ShearTimeline(timelineMap.length);
                                } else {
                                    timeline = new TranslateTimeline(timelineMap.length);
                                    timelineScale = scale;
                                }
                                timeline.boneIndex = boneIndex;

                                let frameIndex: number = 0;
                                for (let i: number = 0; i < timelineMap.length; i++) {
                                    let valueMap: any = timelineMap[i];
                                    const x: number = this.getValue(valueMap, 'x', 0);
                                    const y: number = this.getValue(valueMap, 'y', 0);
                                    timeline.setFrame(frameIndex, valueMap.time, x * timelineScale, y * timelineScale);
                                    this.readCurve(valueMap, timeline, frameIndex);
                                    frameIndex++;
                                }
                                timelines.push(timeline);
                                duration = Math.max(duration, timeline.frames[(timeline.getFrameCount() - 1) * TranslateTimeline.ENTRIES]);
                            } else {
                                throw new Error(`Invalid timeline type for a bone: ${timelineName} (${boneName}`);
                            }
                        }
                    }
                }

            }
        }

        // IK constraint timelines.
        if (map.ik) {
            for (let constraintName in map.ik) {
                if(map.ik.hasOwnProperty(constraintName)) {
                    const constraintMap: any = map.ik[constraintName];
                    const constraint: IkConstraintData = skeletonData.findIkConstraint(constraintName);
                    const timeline: IkConstraintTimeline = new IkConstraintTimeline(constraintMap.length);
                    timeline.ikConstraintIndex = skeletonData.ikConstraints.indexOf(constraint);
                    let frameIndex: number = 0;
                    for (let i: number = 0; i < constraintMap.length; i++) {
                        const valueMap: any = constraintMap[i];
                        timeline.setFrame(frameIndex, valueMap.time, this.getValue(valueMap, 'mix', 1),
                            this.getValue(valueMap, 'bendPositive', true) ? 1 : -1);
                        this.readCurve(valueMap, timeline, frameIndex);
                        frameIndex++;
                    }
                    timelines.push(timeline);
                    duration = Math.max(duration, timeline.frames[(timeline.getFrameCount() - 1) * IkConstraintTimeline.ENTRIES]);
                }
            }
        }

        // Transform constraint timelines.
        if (map.transform) {
            for (let constraintName in map.transform) {
                if(map.transform.hasOwnProperty(constraintName)) {
                    const constraintMap: any = map.transform[constraintName];
                    const constraint: TransformConstraintData = skeletonData.findTransformConstraint(constraintName);
                    const timeline: TransformConstraintTimeline = new TransformConstraintTimeline(constraintMap.length);
                    timeline.transformConstraintIndex = skeletonData.transformConstraints.indexOf(constraint);
                    let frameIndex: number = 0;
                    for (let i: number = 0; i < constraintMap.length; i++) {
                        const valueMap: any = constraintMap[i];
                        timeline.setFrame(frameIndex, valueMap.time, this.getValue(valueMap, 'rotateMix', 1),
                            this.getValue(valueMap, 'translateMix', 1), this.getValue(valueMap, 'scaleMix', 1), this.getValue(valueMap, 'shearMix', 1));
                        this.readCurve(valueMap, timeline, frameIndex);
                        frameIndex++;
                    }
                    timelines.push(timeline);
                    duration = Math.max(duration,
                        timeline.frames[(timeline.getFrameCount() - 1) * TransformConstraintTimeline.ENTRIES]);
                }
            }
        }//map.transform

        // Path constraint timelines.
        if (map.paths) {
            for (let constraintName in map.paths) {
                if(map.paths.hasOwnProperty(constraintName)) {
                    const constraintMap: any = map.paths[constraintName];
                    const index: number = skeletonData.findPathConstraintIndex(constraintName);
                    if (index === -1) {
                        throw new Error(`Path constraint not found: ${constraintName}`);
                    }
                    const data: PathConstraintData = skeletonData.pathConstraints[index];
                    for (let timelineName in constraintMap) {
                        if(constraintMap.hasOwnProperty(timelineName)) {
                            const timelineMap: any = constraintMap[timelineName];
                            if (timelineName === 'position' || timelineName === 'spacing') {
                                let timeline: PathConstraintPositionTimeline = null;
                                let timelineScale: number = 1;
                                if (timelineName === 'spacing') {
                                    timeline = new PathConstraintSpacingTimeline(timelineMap.length);
                                    if (data.spacingMode === SpacingMode.Length || data.spacingMode === SpacingMode.Fixed) {
                                        timelineScale = scale;
                                    }
                                } else {
                                    timeline = new PathConstraintPositionTimeline(timelineMap.length);
                                    if (data.positionMode === PositionMode.Fixed) {
                                        timelineScale = scale;
                                    }
                                }
                                timeline.pathConstraintIndex = index;
                                let frameIndex: number = 0;
                                for (let i: number = 0; i < timelineMap.length; i++) {
                                    const valueMap: any = timelineMap[i];
                                    timeline.setFrame(frameIndex, valueMap.time, this.getValue(valueMap, timelineName, 0) * timelineScale);
                                    this.readCurve(valueMap, timeline, frameIndex);
                                    frameIndex++;
                                }
                                timelines.push(timeline);
                                duration = Math.max(duration, timeline.frames[(timeline.getFrameCount() - 1) * PathConstraintPositionTimeline.ENTRIES]);
                            } else if (timelineName === 'mix') {
                                const timeline: PathConstraintMixTimeline = new PathConstraintMixTimeline(timelineMap.length);
                                timeline.pathConstraintIndex = index;
                                let frameIndex: number = 0;
                                for (let i: number = 0; i < timelineMap.length; i++) {
                                    const valueMap: any = timelineMap[i];
                                    timeline.setFrame(frameIndex, valueMap.time, this.getValue(valueMap, 'rotateMix', 1),
                                        this.getValue(valueMap, 'translateMix', 1));
                                    this.readCurve(valueMap, timeline, frameIndex);
                                    frameIndex++;
                                }
                                timelines.push(timeline);
                                duration = Math.max(duration,
                                    timeline.frames[(timeline.getFrameCount() - 1) * PathConstraintMixTimeline.ENTRIES]);
                            }
                        }
                    }
                }
            }
        }//map.paths

        // Deform timelines.
        if (map.deform) {
            for (let deformName in map.deform) {
                if(map.deformName.hasOwnProperty(deformName)) {
                    const deformMap: any = map.deform[deformName];
                    const skin: Skin = skeletonData.findSkin(deformName);
                    if (skin === null) {
                        throw new Error(`Skin not found: ${deformName}`);
                    }
                    for (let slotName in deformMap) {
                        if(deformMap.hasOwnProperty(slotName)) {
                            const slotMap: any = deformMap[slotName];
                            const slotIndex: number = skeletonData.findSlotIndex(slotName);
                            if (slotIndex === -1) {
                                throw new Error(`Slot not found: ${slotMap.name}`);
                            }


                            for (let timelineName in slotMap) {
                                if(slotMap.hasOwnProperty(timelineName)) {
                                    const timelineMap: any = slotMap[timelineName];
                                    const attachment: VertexAttachment = <VertexAttachment>skin.getAttachment(slotIndex, timelineName);
                                    if (attachment === null) {
                                        throw new Error(`Deform attachment not found: ${timelineMap.name}`);
                                    }
                                    const weighted: boolean = attachment.bones !== null;
                                    const vertices: ArrayLike<number> = attachment.vertices;
                                    const deformLength: number = weighted ? vertices.length / 3 * 2 : vertices.length;

                                    const timeline: DeformTimeline = new DeformTimeline(timelineMap.length);
                                    timeline.slotIndex = slotIndex;
                                    timeline.attachment = attachment;

                                    let frameIndex: number = 0;
                                    for (let j: number = 0; j < timelineMap.length; j++) {
                                        const valueMap: any = timelineMap[j];
                                        let deform: ArrayLike<number> = [];
                                        const verticesValue: Array<Number> = this.getValue(valueMap, 'vertices', null);
                                        if (verticesValue === null) {
                                            deform = weighted ? Utils.newFloatArray(deformLength) : vertices;
                                        } else {
                                            deform = Utils.newFloatArray(deformLength);
                                            const start: number = <number>this.getValue(valueMap, 'offset', 0);
                                            Utils.arrayCopy(verticesValue, 0, deform, start, verticesValue.length);
                                            if (scale !== 1) {
                                                for (let i: number = start, n: number = i + verticesValue.length; i < n; i++) {
                                                    deform[i] *= scale;
                                                }
                                            }
                                            if (!weighted) {
                                                for (let i: number = 0; i < deformLength; i++) {
                                                    deform[i] += vertices[i];
                                                }
                                            }
                                        }

                                        timeline.setFrame(frameIndex, valueMap.time, deform);
                                        this.readCurve(valueMap, timeline, frameIndex);
                                        frameIndex++;
                                    }
                                    timelines.push(timeline);
                                    duration = Math.max(duration, timeline.frames[timeline.getFrameCount() - 1]);
                                }
                            }
                        }
                    }
                }
            }
        }// map.deform

        // Draw order timeline.
        const drawOrderNode: Array<any> = map.drawOrder ? map.drawOrder : map.draworder;
        if (drawOrderNode != null) {
            const timeline: DrawOrderTimeline = new DrawOrderTimeline(drawOrderNode.length);
            const slotCount: number = skeletonData.slots.length;
            let frameIndex: number = 0;

            for (let j: number = 0; j < drawOrderNode.length; j++) {
                const drawOrderMap: any = drawOrderNode[j];
                let drawOrder: Array<number> = null;
                const offsets: Array<any> = this.getValue(drawOrderMap, 'offsets', null);
                if (offsets !== null) {
                    drawOrder = Utils.newArray<number>(slotCount, -1);
                    const unchanged: Array<number> = Utils.newArray<number>(slotCount - offsets.length, 0);
                    let originalIndex: number = 0, unchangedIndex: number = 0;
                    for (let i: number = 0; i < offsets.length; i++) {
                        const offsetMap: any = offsets[i];
                        const slotIndex: number = skeletonData.findSlotIndex(offsetMap.slot);
                        if (slotIndex === -1) {
                            throw new Error(`Slot not found: ${offsetMap.slot}`);
                        }
                        // Collect unchanged items.
                        while (originalIndex !== slotIndex) {
                            unchanged[unchangedIndex++] = originalIndex++;
                        }
                        // Set changed items.
                        drawOrder[originalIndex + offsetMap.offset] = originalIndex++;
                    }
                    // Collect remaining unchanged items.
                    while (originalIndex < slotCount) {
                        unchanged[unchangedIndex++] = originalIndex++;
                    }
                    // Fill in unchanged items.
                    for (let i: number = slotCount - 1; i >= 0; i--) {
                        if (drawOrder[i] === -1) {
                            drawOrder[i] = unchanged[--unchangedIndex];
                        }
                    }
                }
                timeline.setFrame(frameIndex++, drawOrderMap.time, drawOrder);
            }
            timelines.push(timeline);
            duration = Math.max(duration, timeline.frames[timeline.getFrameCount() - 1]);
        }


        // Event timeline.
        if (map.events) {
            const timeline: EventTimeline = new EventTimeline(map.events.length);
            let frameIndex: number = 0;
            for (let i: number = 0; i < map.events.length; i++) {
                const eventMap: any = map.events[i];
                const eventData: EventData = skeletonData.findEvent(eventMap.name);
                if (eventData === null) {
                    throw new Error(`Event not found: ${eventMap.name}`);
                }
                const event: Event = new Event(eventMap.time, eventData);
                event.intValue = this.getValue(eventMap, 'int', eventData.intValue);
                event.floatValue = this.getValue(eventMap, 'float', eventData.floatValue);
                event.stringValue = this.getValue(eventMap, 'string', eventData.stringValue);
                timeline.setFrame(frameIndex++, event);
            }
            timelines.push(timeline);
            duration = Math.max(duration, timeline.frames[timeline.getFrameCount() - 1]);
        }// map.events
        if (isNaN(duration)) {
            throw new Error('Error while parsing animation, duration is NaN');
        }

        skeletonData.animations.push(new Animation(name, timelines, duration));
    }

    public readCurve (map: any, timeline: CurveTimeline, frameIndex: number): void {
        if(!map.curve) {
            return;
        }
        if(map.curve === 'stepped') {
            timeline.setStepped(frameIndex);
        } else if(Object.prototype.toString.call(map.curve) === '[object Array]') {
            const curve: Array<number> = map.curve;
            timeline.setCurve(frameIndex, curve[0], curve[1], curve[2], curve[3]);
        }
    }

    public getValue(map: any, prop: string, defaultValue: any): any {
        return typeof map[prop] !== 'undefined' ? map[prop] : defaultValue;
    }

    public static blendModeFromString(str: string): any {
        str = str.toLowerCase();
        if (str === 'normal') {
            return BlendMode.Normal;
        }
        if (str === 'additive') {
            return BlendMode.Additive;
        }
        if (str === 'multiply') {
            return BlendMode.Multiply;
        }
        if (str === 'screen') {
            return BlendMode.Screen;
        }
        throw new Error(`Unknown blend mode: ${str}`);
    }

    public static positionModeFromString (str: string): any {
        str = str.toLowerCase();
        if (str === 'fixed') {
            return PositionMode.Fixed;
        }
        if (str === 'percent') {
            return PositionMode.Percent;
        }
        throw new Error(`Unknown position mode: ${str}`);
    }

    public static spacingModeFromString (str: string): any {
        str = str.toLowerCase();
        if (str === 'length') {
            return SpacingMode.Length;
        }
        if (str === 'fixed') {
            return SpacingMode.Fixed;
        }
        if (str === 'percent') {
            return SpacingMode.Percent;
        }
        throw new Error(`Unknown position mode: ${str}`);
    }

    public static rotateModeFromString (str: string): any {
        str = str.toLowerCase();
        if (str === 'tangent') {
            return RotateMode.Tangent;
        }
        if (str === 'chain') {
            return RotateMode.Chain;
        }
        if (str === 'chainscale') {
            return RotateMode.ChainScale;
        }
        throw new Error(`Unknown rotate mode: ${str}`);
    }
}
export default SkeletonJson;
