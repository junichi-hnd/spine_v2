abstract class Attachment {
    private name: string;

    constructor(name: string) {
        if(name === null) {
            throw new Error('name cannot be null.');
        }
        this.name = name;
    }
}
export default Attachment;
