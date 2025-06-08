// restobar-event.service.ts
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RestobarEventService {
  private _refresh$ = new Subject<void>();
  refresh$ = this._refresh$.asObservable();

  notifyRefresh() {
    this._refresh$.next();
  }
}
