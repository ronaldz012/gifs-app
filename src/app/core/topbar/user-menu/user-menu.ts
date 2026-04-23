import {Component, HostListener, inject} from '@angular/core';
import {AuthService} from '../../auth/auth-service';
import {Router} from '@angular/router';
import {CurrentUserService} from '../../auth/current-user-service';

@Component({
  selector: 'app-user-menu',
  imports: [],
  templateUrl: './user-menu.html',
  styles: ``,
})
export class UserMenu {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly currentUser = inject(CurrentUserService);

  isOpen = false;

  logout(): void {
    this.auth.logout();
    void this.router.navigate(['/login']);
  }

  @HostListener('document:click', ['$event.target'])
  onDocumentClick(target: EventTarget | null): void {
    if (!(target instanceof HTMLElement)) return;
    if (!target.closest('app-user-menu')) {
      this.isOpen = false;
    }
  }

  get initials(): string {
    return this.currentUser.username
      .split(' ')
      .map(w => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }
}
