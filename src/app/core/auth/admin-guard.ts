import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { CurrentUserService } from '@features/auth/services/current-user-service';

export const adminGuard: CanActivateFn = () => {
  const currentUser = inject(CurrentUserService);
  const router = inject(Router);

  if (currentUser.user()?.isAdmin) return true;
  return router.createUrlTree(['/unauthorized']);
};
