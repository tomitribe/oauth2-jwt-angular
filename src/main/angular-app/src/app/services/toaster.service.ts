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
      this.toastr.error('This action is forbidden for current user.', 'Forbidden');
    } else {
      this.toastr.error(error.message || (error.status + error.statusText), 'Error ' + error.status);
    }
    throw error;
  }

  onSuccess(message: string) {
    return () => {
      this.toastr.success(message, 'Success');
    };
  }
}
