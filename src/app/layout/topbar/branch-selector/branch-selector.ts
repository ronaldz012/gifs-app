import { Component, HostListener, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';

import { CommonModule } from '@angular/common';
import { BranchContextService } from '@core/services/branch-context-service';
import { Branch } from '@features/auth/models/LoginResponse';
import { SideBarService } from '@layout/services/side-bar-service';

@Component({
  selector: 'app-branch-selector',
  imports: [CommonModule],
  templateUrl: './branch-selector.html',
  styles: ``,
})
export class BranchSelector implements OnInit {
  ngOnInit(): void {
    console.log('local storage readed rfrom selector: ', localStorage.getItem('branches'));
  }
  private readonly branchContext = inject(BranchContextService);
  private readonly sidebarSvc = inject(SideBarService);
  private readonly router = inject(Router);
  readonly available = this.branchContext.available;
  readonly active = this.branchContext.active;
  isOpen = signal(false);

  select(branch: Branch): void {
    this.branchContext.setActive(branch);
    this.isOpen.set(false);
    this.sidebarSvc.close();
    void this.router.navigate(['/dashboard']);
  }

  @HostListener('document:click', ['$event.target'])
  onDocumentClick(target: EventTarget | null): void {
    if (!(target instanceof HTMLElement)) return;
    if (!target.closest('app-branch-selector')) {
      this.isOpen.set(false);
    }
  }
}
