class SplitParams {
  SplitType: string;
  SplitValue: 45;
  SplitEntityId: string;
}

export class TransactionParams {
  ID: number;
  Amount: number;
  Currency: string;
  CustomerEmail: string;
  SplitInfo: SplitParams[];
}
