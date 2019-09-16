import { HttpParams } from '@angular/common/http';
import { Component, HostBinding, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { combineLatest, Subject } from 'rxjs';
import { distinctUntilChanged, map, take, tap } from 'rxjs/operators';
import { MoviesService } from 'src/app/services/movies.service';
import { MovieModalComponent } from '../movie-modal/movie-modal.component';
import { Movie } from '../movie/movie.class';


@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit, OnDestroy {
  @HostBinding('class.ux-main') true;
  @ViewChild(MovieModalComponent, { static: true }) modal: MovieModalComponent;

  pages = [];
  movies = [];
  count = 0;
  activePage = 1;
  itemsPerPage = 5;

  query = {
    max: 5,
    first: 0
  };

  filters = [
    'title',
    'director',
    'genre',
    'rating',
    'year'
  ];

  search = {
    field: '',
    searchTerm: ''
  };

  $moviesCount = new Subject<number>();
  $moviesParams = new Subject<any>();

  editItem: Movie = new Movie();

  constructor(
    private $route: ActivatedRoute,
    private $movies: MoviesService,
    private router: Router
  ) { }

  openEditModal($event: MouseEvent, id: number) {
    $event.preventDefault();
    if (id) {
      this.$movies.getMovie('' + id).subscribe((movie: Movie) => {
        this.editItem = movie;
        this.modal.open();
      });
    } else {
      this.editItem = new Movie();
      this.modal.open();
    }
  }

  deleteMovie($event: MouseEvent, id: number) {
    $event.preventDefault();
    this.$movies.deleteMovie('' + id)
      .subscribe(() => this.searchMovies(true));
  }

  getPageText(i: number): string {
    switch (i) {
      case 0:
        return '<<';
      case this.count + 1:
        return '>>';
      default:
        return i.toString();
    }
  }

  getPageLink(i: number): Array<any> {
    switch (i) {
      case 0:
        return ['/main', (this.activePage > 1 ? this.activePage - 1 : this.activePage)];
      case this.count + 1:
        return ['/main', (this.activePage < this.count ? this.activePage + 1 : this.activePage)];
      default:
        return ['/main', i];
    }
  }

  setActivePage(page: number = 1) {
    page = +page;
    if (page < 1 || page > this.pages.length - 1 || this.pages.length < 3) { return; }
    this.pages.forEach(el => el.active = false);

    if (this.activePage < this.pages.length && this.activePage !== +page) {
      this.activePage = page;
    }

    if (this.pages && this.pages[this.activePage]) {
      this.pages[this.activePage].active = true;
    }

    this.query.first = (this.activePage - 1) * this.query.max;
    this.searchMovies();

    this.updateArrows();
  }

  updateArrows() {
    if (this.pages && this.pages[0] && this.pages[this.count + 1]) {
      this.pages[0].link = this.appendFilter(this.getPageLink(0));
      this.pages[this.count + 1].link = this.appendFilter(this.getPageLink(this.count + 1));
    }
  }

  updateCount(count: number) {
    this.count = count;
    this.pages = [];
    if (this.activePage > this.count) {
      this.setActivePage(count);
    }
    for (let i = 0; i <= this.count + 1; i++) {
      this.pages.push({
        number: i,
        active: i === this.activePage,
        text: this.getPageText(i),
        link: this.appendFilter(this.getPageLink(i))
      });
    }
  }

  loadSample(event: MouseEvent) {
    event.preventDefault();
    this.$movies.loadSample().subscribe(() => this.searchMovies(true));
  }

  clearFilter(event: MouseEvent) {
    event.preventDefault();
    this.search.searchTerm = '';
    this.searchTerm();
  }

  selectFilter(item: string = this.filters[0]) {
    const load = this.search.field && this.search.field !== item;
    this.search.field = item;
    if (load) {
      this.searchTerm();
    }
  }

  appendFilter(nextRoute: Array<any>) {
    if (this.search.searchTerm) {
      nextRoute.push(this.search.field, this.search.searchTerm);
    }
    return nextRoute;
  }

  searchTerm() {
    const nextRoute = ['/main', this.activePage];
    this.appendFilter(nextRoute);
    this.router.navigate(nextRoute);
  }

  fetchCount() {
    const params = this.search.searchTerm ? this.search : {};
    this.$movies.getMoviesCount(params).pipe(
      take(1),
      map((count) => +count)
    ).subscribe((count: number) => this.$moviesCount.next(count));
  }

  searchMovies(reload?: boolean) {
    const search: any = { max: '' + this.query.max, first: '' + this.query.first, reload };
    if (this.search.searchTerm) {
      search.field = this.search.field;
      search.searchTerm = this.search.searchTerm;
    }
    this.$moviesParams.next(search);
  }

  ngOnInit() {
    combineLatest([
      this.$moviesCount,
      this.$route.paramMap.pipe(
        map(({ params }: any) => params)
      )
    ]).pipe(
      untilDestroyed(this),
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
      tap(([items, { page, field, value }]) => {
        const pageCount = Math.ceil(items / this.query.max);
        this.selectFilter(field);
        this.search.searchTerm = value || '';

        if (page > pageCount && pageCount > 0) {
          this.activePage = pageCount;
          this.searchTerm();
        } else if (page < 1) {
          this.activePage = 1;
          this.searchTerm();
        }

        this.updateCount(pageCount);
        this.setActivePage(page);
      })
    ).subscribe((data: any) => {
    });

    this.$moviesParams.pipe(
      untilDestroyed(this),
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
      tap(() => this.fetchCount())
    ).subscribe(
      (search) => {
        const params = new HttpParams({
          fromObject: search
        });
        this.$movies.getMovies(params).pipe(take(1)).subscribe((movies: Array<any>) => {
          this.movies = movies;
        });
      }
    );


    this.modal
      .$modalStatus
      .pipe(untilDestroyed(this))
      .subscribe(({ type, data }) => {
        if (type === 'hide') {
          this.editItem = new Movie();
          this.searchMovies(true);
        }
      });

    this.fetchCount();
  }

  ngOnDestroy() { }

}
