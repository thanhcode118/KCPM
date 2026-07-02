import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthFacade } from '@/features/auth/data-access/auth.facade';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';

export const adminGuard: CanActivateFn = () => {
  const authFacade = inject(AuthFacade);
  const router = inject(Router);

  if (authFacade.isAuthenticated() && authFacade.currentUser()?.role === 'admin') {
    return true;
  }

  if (!authFacade.isRestoring() && localStorage.getItem('token')) {
    authFacade.restoreSession();
  }

  if (authFacade.isRestoring()) {
    return toObservable(authFacade.isRestoring).pipe(
      filter(isRestoring => !isRestoring),
      map(() => {
        if (authFacade.isAuthenticated() && authFacade.currentUser()?.role === 'admin') {
          return true;
        }
        return router.createUrlTree(['/login']);
      })
    );
  }

  return router.createUrlTree(['/login']);
};
