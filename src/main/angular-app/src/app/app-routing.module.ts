import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { LogoutComponent } from './components/logout/logout.component';
import { MainComponent } from './components/main/main.component';
import { MovieComponent } from './components/movie/movie.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { AuthGuard } from './services/auth-guard.service';


const routes: Routes = [
  { path: '', redirectTo: 'main/1', pathMatch: 'full', data: { id: 'ux-default' } },
  { path: 'login', component: LoginComponent, data: { id: 'ux-login', hideHeader: true } },
  { path: 'logout', component: LogoutComponent, data: { id: 'ux-logout', hideHeader: true } },
  { path: 'main', redirectTo: 'main/1', canActivate: [AuthGuard], pathMatch: 'full', data: { id: 'ux-main' } },
  { path: 'main/:page', component: MainComponent, canActivate: [AuthGuard], pathMatch: 'full', data: { id: 'ux-main' } },
  { path: 'main/:page/:field/:value', component: MainComponent, canActivate: [AuthGuard], pathMatch: 'full', data: { id: 'ux-main' } },
  { path: 'movie/:id', component: MovieComponent, canActivate: [AuthGuard], data: { id: 'ux-movie' } },
  { path: '**', component: NotFoundComponent, data: { id: 'ux-not-found', hideHeader: true } }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
