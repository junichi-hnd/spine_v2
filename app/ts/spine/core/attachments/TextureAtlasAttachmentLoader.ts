import IAttachmentLoader from './IAttachmentLoader';
import TextureAtlas from '../texture/TextureAtlas';
import Skin from '../Skin';
import RegionAttachment from './RegionAttachment';
import MeshAttachment from './MeshAttachment';
import BoundingBoxAttachment from './BoundingBoxAttachment';
import PathAttachment from './PathAttachment';
import TextureAtlasRegion from '../texture/TextureAtlasRegion';

class TextureAtlasAttachmentLoader implements IAttachmentLoader {
    public atlas: TextureAtlas;

    constructor(atlas: TextureAtlas) {
        //
        this.atlas = atlas;
    }


    public newRegionAttachment(skin: Skin, name: string, path: string): RegionAttachment {
        const region: TextureAtlasRegion = this.atlas.findRegion(path);
        region.renderObject = region;
        if (region === null) {
            throw new Error(`Region not foutn in atlas: ${path} (region attachemtn: ${name})`);
        }
        const attachment: RegionAttachment = new RegionAttachment(name);
        attachment.setRegion(region);
        attachment.region = region;
        return attachment;
    }

    public newMeshAttachment(skin: Skin, name: string, path: string): MeshAttachment {
        const region: TextureAtlasRegion = this.atlas.findRegion(path);
        region.renderObject = region;
        if (region === null) {
            throw new Error(`Region not foutn in atlas: ${path} (region attachemtn: ${name})`);
        }
        const attachment: MeshAttachment = new MeshAttachment(name);
        attachment.region = region;
        return attachment;
    }

    public newBoundingBoxAttachment(skin: Skin, name: string): BoundingBoxAttachment {
        return new BoundingBoxAttachment(name);
    }

    public newPathAttachment(skin: Skin, name: string): PathAttachment {
        return new PathAttachment(name);
    }
}
export default TextureAtlasAttachmentLoader;
