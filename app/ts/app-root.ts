import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Index } from './components/index';
import Loader from './components/loader';
// import Avatar from './components/avatar';
import CanvasAvatar from './components/canvas-avatar';
import ColorButton from './components/color-button';

@NgModule({
  imports:      [ BrowserModule ],
  declarations: [ Index, Loader, CanvasAvatar, ColorButton],
  entryComponents: [Index],
  bootstrap:    [ Index ]
})
export class AppRoot { }
