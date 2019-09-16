import { Pipe, PipeTransform } from '@angular/core';
import md5 from 'blueimp-md5';

@Pipe({
  name: 'gravatar'
})
export class GravatarPipe implements PipeTransform {

  transform(value: string, ...args: any[]): any {
    const gr = (value || '').trim();
    if (!gr || !gr.length) {
      return '//www.gravatar.com/avatar/?s=90';
    } else {
      return '//www.gravatar.com/avatar/' + md5(gr) + '?s=90&d=retro';
    }
  }

}
