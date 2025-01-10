import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WishListItem } from '../models/wish-list-item';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WishListService {
  private apiUrl = `${environment.apiUrl}/wishlist`;

  constructor(private http: HttpClient) { }

  getAllItems(): Observable<WishListItem[]> {
    return this.http.get<WishListItem[]>(this.apiUrl);
  }

  getItemById(id: number): Observable<WishListItem> {
    return this.http.get<WishListItem>(`${this.apiUrl}/${id}`);
  }

  getUserItems(userId: number): Observable<WishListItem[]> {
    return this.http.get<WishListItem[]>(`${this.apiUrl}/user/${userId}`);
  }

  createItem(item: Omit<WishListItem, 'id'>): Observable<WishListItem> {
    return this.http.post<WishListItem>(this.apiUrl, item);
  }

  updateItem(id: number, item: Partial<WishListItem>): Observable<WishListItem> {
    return this.http.put<WishListItem>(`${this.apiUrl}/${id}`, item);
  }

  deleteItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
