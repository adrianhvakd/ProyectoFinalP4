import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

let accessToken: string | null = null;

export function tokenInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  req = req.clone({ withCredentials: true });

  if (accessToken) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`
      }
    });
  }
  
  return next(req).pipe(
    tap({
      error: (err) => {
        if (err.status === 401) {
          accessToken = null;
        }
      }
    })
  );
}

export function setToken(token: string | null) {
  accessToken = token;
}