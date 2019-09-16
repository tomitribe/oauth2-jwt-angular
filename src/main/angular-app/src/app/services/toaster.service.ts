import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class ToasterService {

  constructor(private toastr: ToastrService) {
  }

  onError(error: HttpErrorResponse) {
    if (error.status === 403) {
      this.error('This action is forbidden for current user.', 'Forbidden');
    } else if (error.status !== 400) {
      this.error((error.error && error.error.error_description) || error.message || (error.status + error.statusText), error.error || ('Error ' + error.status));
    }
    throw error;
  }

  onSuccess(message: string, title = 'Success') {
    return () => {
      this.toastr.success(message, title);
    };
  }

  error(message: string, title = 'Error') {
    this.toastr.error(message, title);
  }

  warn(message: string, title = 'Warning') {
    this.toastr.warning(message, title);
  }
}
