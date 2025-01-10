import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { WishListSubmission } from '../models/wish-list-submission';
import { ToastrService } from 'ngx-toastr';

export interface UpdateWishListSubmissionDto {
  statusId: number;
  makeInactive: boolean;
  reason: string;
  shipmentDate?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class WishListSubmissionService {
  private apiUrl = `${environment.apiUrl}/wishlistsubmission`;

  constructor(private http: HttpClient, private toastr: ToastrService) { }

  getAllSubmissions(): Observable<WishListSubmission[]> {
    return this.http.get<WishListSubmission[]>(this.apiUrl);
  }

  getSubmissionByUserId(userId: number): Observable<WishListSubmission[]> {
    return this.http.get<WishListSubmission[]>(`${this.apiUrl}/user/${userId}`);
  }

  createSubmission(userId: number): Observable<WishListSubmission> {
    return this.http.post<WishListSubmission>(this.apiUrl, { userId }).pipe(
      tap(
        (submission) => {
          this.toastr.success('Wish list submitted successfully!', 'Success');
        },
        (error) => {
          console.error('Error creating submission:', error);
          this.toastr.error('Failed to submit wish list. Please try again.', 'Error');
        }
      )
    );
  }

  updateSubmission(id: number, updateDto: UpdateWishListSubmissionDto): Observable<WishListSubmission> {
    return this.http.put<WishListSubmission>(`${this.apiUrl}/${id}`, updateDto).pipe(
      tap(
        (submission) => {
          this.toastr.success('Wish list has been reset to first step', 'Success');
        },
        (error) => {
          console.error('Error updating submission:', error);
          this.toastr.error('Failed to process edit request. Please try again.', 'Error');
        }
      )
    );
  }
}
