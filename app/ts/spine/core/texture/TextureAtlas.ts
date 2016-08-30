import IDisposable from '../IDisposable';
import TextureAtlasPage from './TextureAtlasPage';
import TextureAtlasRegion from './TextureAtlasRegion';
import TextureAtlasReader from './TextureAtlasReader';
import Texture from './Texture';
import {TextureWrap} from './TextureWrap';
class TextureAtlas implements IDisposable {

    public pages: Array<TextureAtlasPage>;
    public regions: Array<TextureAtlasRegion>;

    constructor(atlasText: string, textureLoader: (path: string) => any) {
        this.load = this.load.bind(this);
        this.pages = new Array<TextureAtlasPage>();
        this.regions = new Array<TextureAtlasRegion>();
        this.load(atlasText, textureLoader);
    }

    private load(atlasText: string, textureLoader: (path: string) => any): void {
        if(textureLoader === null) {
            throw new Error('textureLoader cannot be null.');
        }
        const reader: TextureAtlasReader = new TextureAtlasReader(atlasText);
        const tuple: Array<string> = new Array<string>(4);
        let page:TextureAtlasPage = null;
        while (true) {
            let line: string = reader.readLine();
            if (line === null) {
                break;
            }

            line = line.trim();
            console.log(`line is ${line}`);
            if (line.length === 0) {
                page = null;
            } else if (!page) {
                console.log('a');
                page = new TextureAtlasPage();
                page.name = line;

                if (reader.readTuple(tuple) === 2) { // size is only optional for an atlas packed with an old TexturePacker.
                    page.width = parseInt(tuple[0], 10);
                    page.height = parseInt(tuple[1], 10);
                    reader.readTuple(tuple);
                }
                // page.format = Format[tuple[0]]; we don't need format in WebGL
                reader.readTuple(tuple);
                page.minFilter = Texture.filterFromString(tuple[0]);
                page.magFilter = Texture.filterFromString(tuple[1]);

                const direction: string = reader.readValue();
                page.uWrap = TextureWrap.ClampToEdge;
                page.vWrap = TextureWrap.ClampToEdge;
                if (direction === 'x') {
                    page.uWrap = TextureWrap.Repeat;
                } else if (direction === 'y') {
                    page.vWrap = TextureWrap.Repeat;
                } else if (direction === 'xy') {
                    page.uWrap = page.vWrap = TextureWrap.Repeat;
                }
                page.texture = textureLoader(line);
                // page.texture.setFilters(page.minFilter, page.magFilter);
                // page.texture.setWraps(page.uWrap, page.vWrap);
                // page.width = page.texture.getImage().width;
                // page.height = page.texture.getImage().height;
                this.pages.push(page);
            } else {
                console.log('b');
                const region:TextureAtlasRegion = new TextureAtlasRegion();
                region.name = line;
                region.page = page;

                region.rotate = reader.readValue() === 'true';

                reader.readTuple(tuple);
                const x: number = parseInt(tuple[0], 10);
                const y: number = parseInt(tuple[1], 10);

                reader.readTuple(tuple);
                const width: number = parseInt(tuple[0], 10);
                const height: number = parseInt(tuple[1], 10);

                region.u = x / page.width;
                region.v = y / page.height;
                if (region.rotate) {
                    region.u2 = (x + height) / page.width;
                    region.v2 = (y + width) / page.height;
                } else {
                    region.u2 = (x + width) / page.width;
                    region.v2 = (y + height) / page.height;
                }
                region.x = x;
                region.y = y;
                region.width = Math.abs(width);
                region.height = Math.abs(height);

                if (reader.readTuple(tuple) === 4) { // split is optional
                    // region.splits = new Vector.<int>(parseInt(tuple[0]), parseInt(tuple[1]), parseInt(tuple[2]), parseInt(tuple[3]));
                    if (reader.readTuple(tuple) === 4) { // pad is optional, but only present with splits
                        //region.pads = Vector.<int>(parseInt(tuple[0]), parseInt(tuple[1]), parseInt(tuple[2]), parseInt(tuple[3]));
                        reader.readTuple(tuple);
                    }
                }

                region.originalWidth = parseInt(tuple[0], 10);
                region.originalHeight = parseInt(tuple[1], 10);
                reader.readTuple(tuple);
                region.offsetX = parseInt(tuple[0], 10);
                region.offsetY = parseInt(tuple[1], 10);

                region.index = parseInt(reader.readValue(), 10);

                region.texture = page.texture;
                this.regions.push(region);
            }
        }
    }

    public findRegion (name: string): TextureAtlasRegion {
        for (let i: number = 0; i < this.regions.length; i++) {
            if (this.regions[i].name === name) {
                return this.regions[i];
            }
        }
        return null;
    }

    public dispose(): void {
        for (let i: number = 0; i < this.pages.length; i++) {
            this.pages[i].texture.dispose();
        }
    }
}
export default TextureAtlas;
