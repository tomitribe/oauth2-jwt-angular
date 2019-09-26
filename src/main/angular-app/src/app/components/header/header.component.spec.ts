import { HttpClient, HttpClientModule } from '@angular/common/http';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { ToastrModule } from 'ngx-toastr';
import { HttpLoaderFactory } from 'src/app/app.module';
import { GravatarPipe } from 'src/app/pipes/gravatar.pipe';
import { HeaderComponent } from './header.component';
describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

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
        HeaderComponent,
        GravatarPipe]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should renger logout link', () => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('.ux-logout').href).toContain('logout');
  });
});
