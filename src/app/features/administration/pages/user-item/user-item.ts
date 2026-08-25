import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GetUserResponse } from '../../dtos/users/get-user-response';

@Component({
  selector: 'app-user-item',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="row-enter px-4 py-3 flex flex-wrap items-center gap-y-2
             transition-colors duration-150 hover:bg-bg-muted"
      style="grid-template-columns: 1fr 1fr 7.5rem 5rem"
    >
      <div class="w-full lg:w-auto lg:flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <p class="text-sm font-medium text-text-main truncate">{{ user().fullName || (user().firstName + ' ' + user().lastName) }}</p>
          @if (user().isAdmin) {
            <span class="tag-warning text-[10px] leading-none tracking-normal uppercase">Admin</span>
          }
        </div>
      </div>
      <span class="w-full lg:w-auto lg:flex-1 text-sm text-text-muted truncate">{{ user().email }}</span>
      <div class="w-full lg:w-[7.5rem]">
        <span class="pill-success text-[10px] font-semibold"
              [class.!hidden]="!user().isActive">Activo</span>
        <span class="pill-neutral text-[10px] font-semibold"
              [class.!hidden]="user().isActive">Inactivo</span>
      </div>
      <a class="w-full lg:w-[5rem] btn-link"
         [routerLink]="['/admin', 'users', user().id]">
        <span class="btn-link-text">Ver más</span>
        <span class="material-icons text-base">chevron_right</span>
      </a>
    </div>
  `,
  styles: `
    @keyframes slide-up {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .row-enter { animation: slide-up 220ms ease both; }
  `,
})
export default class UserItem {
  user = input.required<GetUserResponse>();
}
