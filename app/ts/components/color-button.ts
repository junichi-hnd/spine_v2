import { Component, Input, Output, EventEmitter } from '@angular/core';
import Event from '../events/Event';

const styles: any = require('../../styles/_button');

@Component({
    selector: 'colorbtn',
    template: `<button class={{className}} (click)='changeColor($event)'>{{label}}</button>`
})

class ColorButton {
    @Input() label: string;
    @Input() color: string;
    @Output() onChangeColor: any = new EventEmitter();
    private className: string;

    ngOnInit(): void {
        this.className = styles[this.color];
    }

    changeColor(event: any): void {
        event.preventDefault();
        this.onChangeColor.emit(this.label);
        // console.log(`change color ${this.label}`);
    }
}
export default ColorButton;
