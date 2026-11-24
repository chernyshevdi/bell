import { Component } from '@angular/core';
import { HomePageComponent } from '@pages/home';
import { HeaderComponent } from '@widgets/header';
import { ModalHostComponent } from '@widgets/modals';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HeaderComponent, HomePageComponent, ModalHostComponent],
  template: `
    <app-header />
    <app-home-page />
    <app-modal-host />
  `,
})
export class AppComponent {}
