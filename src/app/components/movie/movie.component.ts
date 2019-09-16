import { Component, HostBinding, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { distinctUntilChanged, filter, map, switchMap, take } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';
import { MoviesService } from 'src/app/services/movies.service';
import { MovieModalComponent } from '../movie-modal/movie-modal.component';
import { Movie } from './movie.class';

@Component({
  selector: 'app-movie',
  templateUrl: './movie.component.html',
  styleUrls: ['./movie.component.scss']
})
export class MovieComponent implements OnInit, OnDestroy {
  @HostBinding('class.ux-movie-page') true;
  @ViewChild(MovieModalComponent, { static: true }) modal: MovieModalComponent;

  movie: Movie = new Movie();
  editItem: Movie = new Movie();
  comment = { id: 0, email: 'email@example.com', value: '' };

  constructor(private $route: ActivatedRoute,
    private $movies: MoviesService,
    private $auth: AuthService,
    private router: Router) { }

  openEditModal() {
    this.$movies.getMovie('' + this.movie.id).subscribe((movie: Movie) => {
      this.editItem = movie;
      this.modal.open();
    });
  }

  deleteMovie() {
    this.$movies.deleteMovie('' + this.movie.id).subscribe(() => this.router.navigate(['/main', 1]));
  }

  setMovie(movie) {
    this.movie = movie;
    this.movie.comments.sort((a: any, b: any) => {
      return (new Date(a.timestamp)).valueOf() - (new Date(b.timestamp)).valueOf();
    });
  }

  sendComment({ value }) {
    if (!value || !value.comment || !this.movie.id) {
      return;
    }
    this.$movies.postMovieComment(this.movie.id, value.comment)
      .pipe(take(1))
      .subscribe((movie: Movie) => {
        this.setMovie(movie);
        this.comment.value = '';
      });
  }

  ngOnInit() {
    this.$auth.$authData
      .pipe(
        untilDestroyed(this)
      )
      .subscribe(({ email }) => {
        this.comment.email = email;
      });

    this.$route.paramMap.pipe(
      untilDestroyed(this),
      map(({ params }: any) => params && params.id),
      distinctUntilChanged(),
      switchMap(id => this.$movies.getMovie(id))
    ).subscribe((movie: Movie) => {
      this.setMovie(movie);
    });

    this.modal
      .$modalStatus
      .pipe(untilDestroyed(this),
        filter(({ type }) => type === 'hide'),
        switchMap(() => this.$movies.getMovie('' + this.movie.id))
      )
      .subscribe((movie) => {
        this.setMovie(movie);
      });
  }

  ngOnDestroy() {
  }

}
