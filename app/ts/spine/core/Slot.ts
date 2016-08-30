import Color from '../utils/Color';
import Attachment from './attachments/Attachment';
import SlotData from './SlotData';
import Bone from './Bone';

class Slot {
    public data: SlotData;
    public bone: Bone;
    public color: Color;
    public attachmentVertices: Array<number>;

    private attachment: Attachment;
    private attachmentTime: number;

    constructor(data: SlotData, bone: Bone) {
        if(data === null) {
            throw new Error('data cannot be null');
        }

        if(bone === null) {
            throw new Error('bone cannot be null');
        }

        this.data = data;
        this.bone = bone;
        this.color = new Color();
        this.setToSetupPose();
    }

    public getAttachment (): Attachment {
        return this.attachment;
    }

    public setAttachment (attachment: Attachment): void {
        if (this.attachment === attachment) {
            return;
        }
        this.attachment = attachment;
        this.attachmentTime = this.bone.skeleton.time;
        this.attachmentVertices.length = 0;
    }

    public setAttachmentTime (time: number): void {
        this.attachmentTime = this.bone.skeleton.time - time;
    }

    /**
     * Returns the time since the attachment was set.
     * @returns {number}
     */
    public getAttachmentTime (): number {
        return this.bone.skeleton.time - this.attachmentTime;
    }

    public setToSetupPose (): void {
        this.color.setFromColor(this.data.color);
        if (this.data.attachmentName === null) {
            this.attachment = null;
        } else {
            this.attachment = null;
            this.setAttachment(this.bone.skeleton.getAttachment(this.data.index, this.data.attachmentName));
        }
    }
}
export default Slot;
