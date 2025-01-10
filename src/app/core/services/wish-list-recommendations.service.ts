import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RecommendedWishListItem } from '../models/recommended-wish-list-item';
import { WishListItem } from '../models/wish-list-item';
import { CreateRecommendWishListItemDto } from '../models/create-recommend-wish-list-item.dto';

@Injectable({
  providedIn: 'root'
})
export class WishListRecommendationsService {
  private apiUrl = `${environment.apiUrl}/recommendwishlist`;

  constructor(private http: HttpClient) {}

  /**
   * Gets all recommended wish list items for the current user
   */
  getRecommendations(userId: number): Observable<RecommendedWishListItem[]> {
    return this.http.get<RecommendedWishListItem[]>(`${this.apiUrl}/user/${userId}`);
  }

  /**
   * Creates a new recommended wish list item
   */
  createRecommendation(dto: CreateRecommendWishListItemDto): Observable<RecommendedWishListItem> {
    console.log(dto);
    return this.http.post<RecommendedWishListItem>(`${this.apiUrl}`, dto);
  }

  /**
   * Updates a recommended wish list item
   */
  updateRecommendation(id: number, dto: Partial<CreateRecommendWishListItemDto>): Observable<RecommendedWishListItem> {
    return this.http.put<RecommendedWishListItem>(`${this.apiUrl}/${id}`, dto);
  }

  /**
   * Deletes a recommended wish list item
   */
  deleteRecommendation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
