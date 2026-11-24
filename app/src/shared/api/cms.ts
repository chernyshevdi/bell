import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/** Чтение JSON, который в проде отдаёт CMS (в демо: /cms/*.json). */
@Injectable({ providedIn: 'root' })
export class CmsClient {
  private http = inject(HttpClient);
  get<T>(name: string): Observable<T> {
    return this.http.get<T>(`cms/${name}.json`);
  }
}
