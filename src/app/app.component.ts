import { Component, Inject, HostBinding } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Router, NavigationEnd, RouterEvent, ActivatedRoute, RoutesRecognized, ActivationEnd } from '@angular/router';
import { filter, map, switchMap, mergeMap, debounce, debounceTime, tap } from 'rxjs/operators';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @HostBinding('class.ux-app') true;

  title = 'moviefun-angular';
  hideHeader = true;

  constructor(
    private translate: TranslateService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    @Inject(DOCUMENT) private document: Document
  ) {
    translate.setDefaultLang('en');
    this.router.events.pipe(
      filter((r: RouterEvent) => r instanceof ActivationEnd),
      map((r: any) => r.snapshot.data)
    ).subscribe((data: any) => this.stateChanged(data));
  }

  stateChanged(data) {
    const { id, hideHeader } = data;
    this.hideHeader = hideHeader;
    this.document.body.setAttribute('current-view', id);
  }

}
