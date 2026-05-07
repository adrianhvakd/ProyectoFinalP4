import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { ApiService } from '../services/api.service';
import { map, of } from 'rxjs';

let sessionValidated = false;
let validatingSession = false;

export const authGuard: CanActivateFn = (route, state) => {
  const apiService = inject(ApiService);
  const router = inject(Router);

  if (apiService.isAuthenticated()) {
    return true;
  }

  if (sessionValidated) {
    router.navigate(['/login']);
    return false;
  }

  if (validatingSession) {
    return of(false);
  }

  validatingSession = true;

  return apiService.validateSession().pipe(
    map((user) => {
      sessionValidated = true;
      validatingSession = false;
      
      if (user) {
        return true;
      }
      router.navigate(['/login']);
      return false;
    })
  );
};

export const adminGuard: CanActivateFn = (route, state) => {
  const apiService = inject(ApiService);
  const router = inject(Router);

  if (apiService.isAdmin()) {
    return true;
  }

  if (sessionValidated && !apiService.isAuthenticated()) {
    router.navigate(['/dashboard']);
    return false;
  }

  if (validatingSession) {
    return of(false);
  }

  validatingSession = true;

  return apiService.validateSession().pipe(
    map((user) => {
      sessionValidated = true;
      validatingSession = false;

      if (user?.role === 'ADMIN') {
        return true;
      }
      router.navigate(['/dashboard']);
      return false;
    })
  );
};

export const guestGuard: CanActivateFn = (route, state) => {
  const apiService = inject(ApiService);
  const router = inject(Router);

  if (!apiService.isAuthenticated()) {
    if (sessionValidated) {
      return true;
    }

    if (validatingSession) {
      return of(false);
    }

    validatingSession = true;

    return apiService.validateSession().pipe(
      map((user) => {
        sessionValidated = true;
        validatingSession = false;

        if (!user) {
          return true;
        }
        router.navigate(['/dashboard']);
        return false;
      })
    );
  }

  router.navigate(['/dashboard']);
  return false;
};