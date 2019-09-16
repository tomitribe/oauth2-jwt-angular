import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { of, Subject } from 'rxjs';
import { catchError, take } from 'rxjs/operators';
import { MoviesService } from 'src/app/services/movies.service';

declare var $: any;

@Component({
  selector: 'app-movie-modal',
  templateUrl: './movie-modal.component.html',
  styleUrls: ['./movie-modal.component.scss']
})
export class MovieModalComponent implements OnInit, OnDestroy {

  @Input() item: any;

  currentYear: number = new Date().getFullYear();
  $modalStatus = new Subject<any>();

  constructor(
    private $movies: MoviesService
  ) { }

  close() {
    $('#movieModal').modal('hide');
  }

  open() {
    $('#movieModal').modal();
  }

  onSubmit(f) {
    this.$movies.postMovie({ id: this.item && this.item.id, ...f.form.value })
      .pipe(take(1), catchError(({ status, message }) => {
        return of({ status, message } as any);
      })).subscribe(
        (result: any) => {
          if (result.id) {
            this.close();
          }
        }
      );
  }

  ngOnInit() {
    $('#movieModal')
      .on('show.bs.modal', ({ type, data }) => {
        this.$modalStatus.next({ type, data });
      })
      .on('hide.bs.modal', ({ type, data }) => {
        this.$modalStatus.next({ type, data });
      });
  }

  ngOnDestroy() {
  }

}
