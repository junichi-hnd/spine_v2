/// <reference path="../../typings/index.d.ts" />
import 'rxjs/Rx';
import 'zone.js/dist/zone';
import 'reflect-metadata';

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { enableProdMode } from '@angular/core';

import { AppRoot } from './app-root';
import '../styles/_base/_structure';
enableProdMode();
platformBrowserDynamic().bootstrapModule(AppRoot);
// bootstrap(Main, []);
