class TextureAtlasReader {
    public lines: Array<string>;
    public index: number;
    constructor(text: string) {
        this.index = 0;
        this.lines = text.split(/\r\n|\r|\n/);
    }

    public readLine(): string {
        if (this.index >= this.lines.length) {
            return null;
        }
        return this.lines[this.index++];
    }

    public readValue(): string {
        const line: string = this.readLine();
        const colon: number = line.indexOf(':');
        if (colon === -1) {
            throw new Error(`Invalid line: ${line}`);
        }
        return line.substring(colon + 1).trim();
    }

    public readTuple (tuple: Array<string>): number {
        const line: string = this.readLine();
        const colon: number = line.indexOf(':');
        if (colon === -1) {
            throw new Error(`Invalid line: ${line}`);
        }
        let i: number = 0, lastMatch: number = colon + 1;
        for (; i < 3; i++) {
            const comma: number = line.indexOf(',', lastMatch);
            if (comma === -1) {
                break;
            }
            tuple[i] = line.substr(lastMatch, comma - lastMatch).trim();
            lastMatch = comma + 1;
        }
        tuple[i] = line.substring(lastMatch).trim();
        return i + 1;
    }
}
export default TextureAtlasReader;
