import { Component, computed, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { LabelSheet } from './label-sheet/label-sheet';
import {LabelData} from '../../../interfaces/reception-labels';
import {ReceptionLabelsDto} from '../../../dtos/receptions/reception-labels-dto';
import { PrintHeader } from '../../../../../shared/components/print/print-header';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-print-labels',
  standalone: true,
  imports: [PrintHeader, LabelSheet],
  template: `
    <div class="print-page">

      <app-print-header
        [title]="'Recepción #' + receptionId()"
        [subtitle]="subtitle()"
        [disabled]="loading() || !!error()"
        [backUrl]="backUrl()"
      />

      <div class="print-content">
        @if (loading()) {
          <div class="state">
            <div class="spinner"></div>
            <span>Preparando etiquetas...</span>
          </div>
        }

        @if (error()) {
          <div class="state">
            <p>{{ error() }}</p>
            <button (click)="loadData()" class="retry">Reintentar</button>
          </div>
        }

        @if (!loading() && !error()) {
          <app-label-sheet [labels]="allLabels()" />
        }
      </div>

    </div>
  `,
  styles: [`
    .print-page {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background: #f3f4f6;
    }
    .print-content {
      flex: 1;
      overflow-y: auto;
      padding: 24px 0;
    }
    .state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 64px;
      color: #6b7280;
      font-size: 0.875rem;
    }
    .spinner {
      width: 32px;
      height: 32px;
      border: 2px solid #d1d5db;
      border-top-color: #374151;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .retry {
      color: #2563eb;
      font-size: 0.875rem;
      text-decoration: underline;
      cursor: pointer;
    }

    @media print {
      .print-page { background: white; }
      .print-content { overflow: visible; padding: 0; }
      @page { size: A4 portrait; margin: 0; }
    }
  `],
})
export default class PrintLabelsPage implements OnInit {
  private http  = inject(HttpClient);
  private route = inject(ActivatedRoute);

  receptionId = signal<GUID>('');
  backUrl     = signal('');
  reception   = signal<ReceptionLabelsDto | null>(null);
  loading     = signal(true);
  error       = signal<string | null>(null);

  allLabels = computed<LabelData[]>(() => {
    const data = this.reception();
    if (!data) return [];
    return data.items.flatMap(item =>
      Array.from({ length: item.quantity }, (): LabelData => ({
        variantId:   item.variantId,
        sku:         item.sku,
        productName: item.productName,
        brandName:   item.brandName,
        size:        item.size,
        color:       item.color,
        gender:      item.gender,
        price:       item.price,
        receptionId: data.receptionId,
      }))
    );
  });

  subtitle = computed(() => {
    const total = this.allLabels().length;
    if (!total) return '';
    return `${total} etiqueta${total !== 1 ? 's' : ''}`;
  });

  ngOnInit(): void {
    const id   = this.route.snapshot.paramMap.get('id') ?? '';
    const back = this.route.snapshot.queryParamMap.get('back') ?? '';
    this.receptionId.set(id);
    this.backUrl.set(back);
    this.loadData();
    // Ensure printing-specific class is toggled when user prints via browser
    window.addEventListener('beforeprint', this.handleBeforePrint);
    window.addEventListener('afterprint', this.handleAfterPrint);
  }

  ngOnDestroy(): void {
    window.removeEventListener('beforeprint', this.handleBeforePrint);
    window.removeEventListener('afterprint', this.handleAfterPrint);
  }

  private handleBeforePrint = (): void => {
    try { document.body.classList.add('printing-labels'); } catch (e) {}
  };

  private handleAfterPrint = (): void => {
    try { document.body.classList.remove('printing-labels'); } catch (e) {}
  };

  loadData(): void {
    this.loading.set(true);
    this.error.set(null);
    this.http
      .get<ReceptionLabelsDto>(`${this.url}/api/Reception/${this.receptionId()}/labels`
      )
      .subscribe({
        next:  data => { this.reception.set(data); this.loading.set(false); },
        error: ()   => { this.error.set('No se pudieron cargar las etiquetas.'); this.loading.set(false); },
      });
  }
  url = environment.BACKEND_URL;
}
