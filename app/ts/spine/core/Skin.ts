/*
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
 */
import Attachment from './attachments/Attachment';
import IMap from './IMap';
import Skeleton from './Skeleton';
import Slot from './Slot';
class Skin {
    public name: string;
    public attachments: Array<IMap<Attachment>>;

    constructor(name: string) {
        if(name === null) {
            throw new Error('name cannot be null.');
        }
        this.name = name;
    }

    public addAttachment(slotIndex: number, name: string, attachment: Attachment): void {
        if(attachment === null) {
            throw new Error('attachment cannot be null.');
        }
        const attachments: Array<IMap<Attachment>> = this.attachments;
        if(slotIndex >= attachments.length) {
            attachments.length = slotIndex + 1;
        }
        if(!attachments[slotIndex]) {
            attachments[slotIndex] = {};
        }
        attachments[slotIndex][name] = attachment;
    }

    public getAttachment(slotIndex: number, name: string): Attachment {
        const dictionary: any = this.attachments[slotIndex];
        return dictionary ? dictionary[name] : null;
    }

    /**
     * Attach each attachment in this skin if the corresponding attachment in the old skin is currently attached.
     * @param skeleton
     * @param oldSkin
     */
    public attachAll(skeleton: Skeleton, oldSkin: Skin): void {
        let slotIndex: number = 0;
        for(let i: number = 0; i < skeleton.slots.length; i++) {
            const slot: Slot = skeleton.slots[i];
            const slotAttachment: Attachment = slot.getAttachment();
            if(slotAttachment && slotIndex < oldSkin.attachments.length) {
                const dictionary: any = oldSkin.attachments[slotIndex];
                for(let key in dictionary) {
                    if(dictionary.hasOwnProperty(key)) {
                        const skinAttachment: Attachment = dictionary[key];
                        if(slotAttachment === skinAttachment) {
                            const attachment: Attachment = this.getAttachment(slotIndex, name);
                            if(attachment !== null) {
                                slot.setAttachment(attachment);
                            }
                            break;
                        }
                    }
                }
            }
            slotIndex++;
        }
    }
}
export default Skin;
