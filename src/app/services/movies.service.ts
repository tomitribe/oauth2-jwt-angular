import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';
import { Movie } from '../components/movie/movie.class';
import { ToasterService } from './toaster.service';

declare global {
  interface Window {
    ux: {
      SESSION_ID: string;
      ROOT_URL: string;
    };
  }
}

@Injectable({
  providedIn: 'root'
})
export class MoviesService {

  constructor(
    private $http: HttpClient,
    private $toaster: ToasterService
  ) { }

  getMovies(params?) {
    return this.$http.get(window.ux.ROOT_URL + 'rest/movies', { params })
      .pipe(
        tap(() => ({}), e => this.$toaster.onError(e))
      );
  }

  getMoviesCount(params?) {
    return this.$http.get(window.ux.ROOT_URL + 'rest/movies/count/', { params })
      .pipe(
        tap(() => ({}), e => this.$toaster.onError(e))
      );
  }

  getMovie(id: string) {
    return this.$http.get(window.ux.ROOT_URL + 'rest/movies/' + id)
      .pipe(
        tap(() => ({}), e => this.$toaster.onError(e))
      );
  }

  deleteMovie(id: string) {
    return this.$http.delete(window.ux.ROOT_URL + 'rest/movies/' + id).pipe(
      tap(
        this.$toaster.onSuccess('Movie removed.'),
        e => this.$toaster.onError(e)
      )
    );
  }

  postMovie(data: Movie) {
    if (data.id) {
      return this.editMovie('' + data.id, data);
    } else {
      return this.createMovie(data);
    }
  }

  editMovie(id: string, data: Movie) {
    return this.$http.put(window.ux.ROOT_URL + 'rest/movies/' + id, data).pipe(
      tap(
        this.$toaster.onSuccess('Movie edited.'),
        e => this.$toaster.onError(e)
      )
    );
  }

  createMovie(data: Movie) {
    return this.$http.post(window.ux.ROOT_URL + 'rest/movies/', data).pipe(
      tap(
        this.$toaster.onSuccess('Movie created.'),
        e => this.$toaster.onError(e)
      )
    );
  }

  postMovieComment(id: number, data: any) {
    return this.$http.post(window.ux.ROOT_URL + 'rest/movies/' + id + '/comment', data).pipe(
      tap(
        this.$toaster.onSuccess('Comment sent.'),
        e => this.$toaster.onError(e)
      )
    );
  }

  loadSample() {
    return this.$http.post(window.ux.ROOT_URL + 'rest/load/', {}).pipe(
      tap(
        this.$toaster.onSuccess('Sample data loaded.'),
        e => this.$toaster.onError(e)
      )
    );
  }
}
