// src/types/preShipMemoLabel.ts
export type PreShipMemoLabelInput = {
  toName: string;
  toPostalCode: string;
  toFullAddress: string;

  orderId: string;
  packageId: string; // "01" など
};
