import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthEvents {
  private readonly unauthorizedSubject = new Subject<void>();
  readonly unauthorized$ = this.unauthorizedSubject.asObservable();

  emitUnauthorized(): void {
    this.unauthorizedSubject.next();
  }
}
