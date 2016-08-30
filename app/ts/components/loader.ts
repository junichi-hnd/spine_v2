import { Component, Input } from '@angular/core';

const styles: any = require('../../styles/_loading');

@Component({
    selector: 'loader',
    template: `<div class={{className}}>
                 <div class=${styles.loader}>
                    <svg class=${styles.circular} viewBox="25 25 50 50">
                        <circle class=${styles.path} cx="50" cy="50" r="20" fill="none" stroke-width="2" stroke-miterlimit="10"/>
                    </svg>
                    </div>
               </div>`
})

class Loader {
    @Input() isShow: boolean;
    private className: string;

    ngOnInit(): void {
        this.className = styles.showbox;
    }

    ngOnChanges(): void {
        // console.log(`ngChanges ${this.isShow}`);
        // this.className = !this.isShow ? styles.loadingStop : styles.loadingStart;
        this.className = !this.isShow ? styles.hidebox : styles.showbox;
        // console.log(`class name is ${this.className}`);
    }
}
export default Loader;
