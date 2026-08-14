import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import BrandList from './brand-list';
import CategoryList from './category-list';
import ColorList from './color-list';
import SizeList from './size-list';
import { BrandService } from '@features/inventory/services/brand-service';
import { CategoryService } from '@features/inventory/services/category-service';
import { ColorService } from '@features/inventory/services/color-service';
import { SizeService } from '@features/inventory/services/size-service';

export enum CatalogTab {
  Marcas = 'marcas',
  Categorias = 'categorias',
  Colores = 'colores',
  Tallas = 'tallas',
}

const TABS: { key: CatalogTab; label: string }[] = [
  { key: CatalogTab.Marcas, label: 'Marcas' },
  { key: CatalogTab.Categorias, label: 'Categorías' },
  { key: CatalogTab.Colores, label: 'Colores' },
  { key: CatalogTab.Tallas, label: 'Tallas' },
];

@Component({
  selector: 'app-catalogs-page',
  imports: [BrandList, CategoryList, ColorList, SizeList, RouterLink],
  template: `
    <div class="flex flex-col gap-4 w-full">
      <!-- Header: volver + título -->
      <div class="flex items-center gap-3">
        <a routerLink="/inventory/products" class="btn-icon">
          <span class="material-icons text-base">arrow_back</span>
        </a>
        <h1 class="text-lg font-black text-text-main">Catálogos</h1>
      </div>

      <!-- Tabs -->
      <div class="flex gap-1 border-b border-border">
        @for (tab of TABS; track tab.key) {
          <button
            type="button"
            (click)="activeTab.set(tab.key)"
            class="px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px
                   hover:text-text-main focus:outline-none"
            [class.text-accent-ui]="activeTab() === tab.key"
            [class.border-accent-ui]="activeTab() === tab.key"
            [class.text-text-muted]="activeTab() !== tab.key"
            [class.border-transparent]="activeTab() !== tab.key"
          >
            {{ tab.label }}
          </button>
        }
      </div>

      @if (activeTab() === CatalogTab.Marcas) {
        <app-brand-list />
      } @else if (activeTab() === CatalogTab.Categorias) {
        <app-category-list />
      } @else if (activeTab() === CatalogTab.Colores) {
        <app-color-list />
      } @else {
        <app-size-list />
      }
    </div>
  `,
})
export default class CatalogsPage {
  readonly TABS = TABS;
  readonly CatalogTab = CatalogTab;
  activeTab = signal<CatalogTab>(CatalogTab.Marcas);

  private brandService = inject(BrandService);
  private categoryService = inject(CategoryService);
  private colorService = inject(ColorService);
  private sizeService = inject(SizeService);

  constructor() {
    this.brandService.load();
    this.categoryService.load();
    this.colorService.load();
    this.sizeService.load();
  }
}
