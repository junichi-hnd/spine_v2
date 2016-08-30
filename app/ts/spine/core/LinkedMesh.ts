import MeshAttachment from './attachments/MeshAttachment';
class LinkedMesh {
    public parent: string;
    public skin: string;
    public slotIndex: number;
    public mesh: MeshAttachment;

    constructor (mesh: MeshAttachment, skin: string, slotIndex: number, parent: string) {
        this.mesh = mesh;
        this.skin = skin;
        this.slotIndex = slotIndex;
        this.parent = parent;
    }
}
export default LinkedMesh;
