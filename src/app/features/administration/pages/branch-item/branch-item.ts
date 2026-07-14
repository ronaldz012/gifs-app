import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BranchListItemDto } from '../../dtos/branches/branch-list-item-dto';

@Component({
  selector: 'app-branch-item',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a
      class="row-enter px-4 py-3 flex flex-wrap items-center gap-y-2
             transition-colors duration-150 hover:bg-bg-muted
             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus-ring focus-visible:ring-inset"
      [routerLink]="['/admin', 'branches', branch().id]"
      style="grid-template-columns: 1fr 1fr 7.5rem 5rem"
    >
      <div class="w-full lg:w-auto lg:flex-1 min-w-0">
        <p class="text-sm font-medium text-text-main truncate">{{ branch().name }}</p>
      </div>
      <span class="w-full lg:w-auto lg:flex-1 text-sm text-text-muted truncate">{{ branch().place || '—' }}</span>
      <div class="w-full lg:w-[7.5rem]">
        <span class="pill-success text-[10px] font-semibold"
              [class.!hidden]="!branch().isActive">Activo</span>
        <span class="pill-neutral text-[10px] font-semibold"
              [class.!hidden]="branch().isActive">Inactivo</span>
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
export default class BranchItem {
  branch = input.required<BranchListItemDto>();
}