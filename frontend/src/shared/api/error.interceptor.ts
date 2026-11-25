import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { catchError, throwError } from 'rxjs';

import { paths } from '@shared/routes';

import { AuthEvents } from './auth.events';
import { parseApiErrors } from './errors';
import { TokenStorage } from './token.storage';

const PUBLIC_PREFIXES = [
  '/login',
  '/register',
  '/password-reset',
];

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenStorage = inject(TokenStorage);
  const authEvents = inject(AuthEvents);
  const router = inject(Router);
  const messages = inject(MessageService);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        tokenStorage.clear();
        authEvents.emitUnauthorized();
        const current = router.url.split('?')[0];
        const isPublic = PUBLIC_PREFIXES.some((path) => current === path || current.startsWith(`${path}/`));
        if (!isPublic) {
          void router.navigateByUrl(paths.login);
        }
        return throwError(() => error);
      }

      if (error instanceof HttpErrorResponse && error.status !== 0) {
        const text = parseApiErrors(error);
        if (error.status !== 403) {
          messages.add({
            severity: 'error',
            summary: 'Ошибка',
            detail: text.join('\n'),
            life: 5000,
          });
        }
      }

      return throwError(() => error);
    }),
  );
};
