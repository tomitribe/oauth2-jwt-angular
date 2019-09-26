import { HttpClient, HttpClientModule } from '@angular/common/http';
import { async, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { ToastrModule } from 'ngx-toastr';
import { AppComponent } from './app.component';
import { HttpLoaderFactory } from './app.module';
import { HeaderComponent } from './components/header/header.component';
import { GravatarPipe } from './pipes/gravatar.pipe';


describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderFactory,
            deps: [HttpClient]
          }
        }),
        ToastrModule.forRoot()
      ],
      declarations: [
        AppComponent,
        HeaderComponent,
        GravatarPipe
      ],
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'moviefun-angular'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual('moviefun-angular');
  });
});
