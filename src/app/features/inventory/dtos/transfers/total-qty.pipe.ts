import { Pipe, PipeTransform } from '@angular/core';
import {StockTransferItemDetailDto} from './stock-transfer-detail-dto';

@Pipe({ name: 'totalQty', standalone: true })
export class TotalQtyPipe implements PipeTransform {
  transform(items: StockTransferItemDetailDto[] | null | undefined): number {
    if (!items || items.length === 0) return 0;
    return items.reduce((sum, i) => sum + (i.quantityRequested ?? 0), 0);
  }
}
