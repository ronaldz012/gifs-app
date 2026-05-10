import {TransferDirection, TransferStatus} from './transfer-enums';
import {BaseQueryDto} from '../base-query-dto';

export interface StockTransferListDto {
  id: GUID;
  direction : TransferDirection;
  counterpartBranchName: string;
  requesterName: string;
  status: TransferStatus;
  totalItem: number;
  totalQuantity: number;
  createdAt: Date;
  resolvedAt: Date | null;
}
export interface TransferQueryParams extends BaseQueryDto{

  status?: TransferStatus[];
  direction?: TransferDirection;
  dateFrom?: string;
  dateTo?: string;

}
