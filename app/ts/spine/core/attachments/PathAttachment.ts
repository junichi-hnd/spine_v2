import VertexAttachment from './VertexAttachment';
class PathAttachment extends VertexAttachment {
    public lengths: Array<number>;
    public closed: boolean;
    public constantSpeed: boolean;

    constructor(name: string) {
        super(name);
        this.closed = false;
        this.constantSpeed = false;
    }
}
export default PathAttachment;
