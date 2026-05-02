import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router'; // Importamos el router
import { ProductService } from '../../../services/product-service';
import { ListProductDto } from '../../../interfaces/listProductDto';
import ProductItem from './product-item/product-item';
import { SkeletonList } from '../../../../core/ui/skeleton-list/skeleton-list';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [ProductItem, SkeletonList],
  template: `
      @if (loading()) {
      <app-skeleton-list [rows]="4" [columns]="3" />
    } @else if (products().length === 0) {
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-12 flex flex-col items-center gap-3">
        <span class="text-3xl opacity-30">👕</span>
        <p class="text-sm text-gray-400">No hay productos registrados.</p>
      </div>
    } @else {
      <ul class="flex flex-col gap-2.5">
        @for (p of products(); track p.id; let i = $index) {
          <app-product-item
            class="row-enter"
            [style.animation-delay.ms]="i * 30"
            [product]="p"
            [index]="i"
            (viewDetail)="goToDetail($event)"
            (viewStock)="goToStock($event)"
            (viewMovements)="goToMovements($event)"
          />
        }
  </ul>
}
  `,
  styles: [`
    @keyframes slide-up {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .row-enter { animation: slide-up 220ms ease both; }
  `]
})
export default class ProductList implements OnInit {
  private productService = inject(ProductService);
  private router = inject(Router);

  // Ahora el estado de los productos vive aquí
  products = signal<ListProductDto[]>([]);
  loading = signal(false);

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading.set(true);
    this.productService
      .getProducts({ isPaged: true, page: 1, pageSize: 20, sortDirection: 'asc', sortBy: 'Name' })
      .subscribe({
        next: data => {
          this.products.set(data.items);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  // Métodos de navegación: En lugar de emitir, navegamos
  goToDetail(id: number): void {
    this.router.navigate(['dashboard','inventory','products', id, 'detail']);
  }

  goToStock(id: number): void {
    this.router.navigate(['products', id, 'stock']);
  }

  goToMovements(id: number): void {
    this.router.navigate(['products', id, 'movements']);
  }
}
