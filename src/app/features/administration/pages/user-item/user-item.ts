import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GetUserResponse } from '../../dtos/users/get-user-response';

@Component({
  selector: 'app-user-item',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a
      class="row-enter px-4 py-3 flex flex-wrap items-center gap-y-2
             transition-colors duration-150 hover:bg-bg-muted
             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus-ring focus-visible:ring-inset"
      style="grid-template-columns: 1fr 10rem 1fr 7.5rem 5rem"
      [routerLink]="['/admin', 'users', user().id]"
    >
      <div class="w-full lg:w-auto lg:flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <p class="text-sm font-medium text-text-main truncate">{{ user().fullName || user().username }}</p>
          @if (user().isAdmin) {
            <span class="tag-warning text-[10px] leading-none tracking-normal uppercase">Admin</span>
          }
        </div>
      </div>
      <span class="w-full lg:w-[10rem] text-sm text-text-muted truncate">{{ user().username }}</span>
      <span class="w-full lg:w-auto lg:flex-1 text-sm text-text-muted truncate">{{ user().email }}</span>
      <div class="w-full lg:w-[7.5rem]">
        <span class="pill-success text-[10px] font-semibold"
              [class.!hidden]="!user().isActive">Activo</span>
        <span class="pill-neutral text-[10px] font-semibold"
              [class.!hidden]="user().isActive">Inactivo</span>
      </div>
      <span class="w-full lg:w-[5rem] flex items-center gap-1 text-xs font-medium text-accent-ui">
        Ver
        <span class="material-icons text-base">chevron_right</span>
      </span>
    </a>
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
