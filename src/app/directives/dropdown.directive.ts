import { Directive, HostBinding, HostListener } from '@angular/core';

@Directive({
  selector: '[appDropdown]'
})
export class DropdownDirective {
  constructor() { }
  @HostBinding('class.show') isOpen = false;
  @HostListener('click') toogle($event) {
    console.log($event);
    this.isOpen = !this.isOpen;
  }
}
