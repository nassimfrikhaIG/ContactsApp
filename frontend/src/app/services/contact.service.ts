import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Contact, ContactFilter } from '../models/contact.model';

@Injectable({ providedIn: 'root' })
export class ContactService {
  private apiUrl = `${environment.apiUrl}/contacts`;

  constructor(private http: HttpClient) {}

  getContacts(filter: ContactFilter = {}): Observable<any> {
    let params = new HttpParams();
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, String(value));
      }
    });
    return this.http.get(this.apiUrl, { params });
  }

  getContact(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  createContact(contact: Contact): Observable<any> {
    return this.http.post(this.apiUrl, contact);
  }

  updateContact(id: string, contact: Partial<Contact>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, contact);
  }

  deleteContact(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  bulkDelete(ids: string[]): Observable<any> {
    return this.http.delete(`${this.apiUrl}/bulk`, { body: { ids } });
  }

  toggleFavorite(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/favorite`, {});
  }

  exportCSV(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export`, { responseType: 'blob' });
  }

  importCSV(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/import`, formData);
  }

  getStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats`);
  }

  getTags(): Observable<any> {
    return this.http.get(`${this.apiUrl}/tags`);
  }

  getGroups(): Observable<any> {
    return this.http.get(`${this.apiUrl}/groups`);
  }
}
