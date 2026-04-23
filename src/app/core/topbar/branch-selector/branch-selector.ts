import {Component, HostListener, inject, signal} from '@angular/core';
import {BranchContextService} from '../../auth/branch-context-service';
import {Branch} from '../../auth/interfaces/Respones/LoginResponse';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-branch-selector',
  imports: [CommonModule],
  templateUrl: './branch-selector.html',
  styles: ``,
})
export class BranchSelector {
  private readonly branchContext = inject(BranchContextService);

  readonly available = this.branchContext.available;
  readonly active = this.branchContext.active;
  isOpen = signal(false);

  select(branch: Branch): void {
    this.branchContext.setActive(branch);
    this.isOpen.set(false)
  }

  @HostListener('document:click', ['$event.target'])
  onDocumentClick(target: EventTarget | null): void {
    if (!(target instanceof HTMLElement)) return;
    if (!target.closest('app-branch-selector')) {
      this.isOpen.set(false)
    }
  }
}
