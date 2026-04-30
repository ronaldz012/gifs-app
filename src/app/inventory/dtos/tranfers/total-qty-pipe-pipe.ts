import { Pipe, PipeTransform } from '@angular/core';
import {StockTransferItemDetailDto} from './stock-transfer-detail-dto';




@Pipe({ name: 'totalQty', standalone: true })
export class TotalQtyPipe implements PipeTransform {
  transform(items: StockTransferItemDetailDto[]): number {
    return items.reduce((sum, i) => sum + i.quantityRequested, 0);
  }
}

