export type WorkTypeOption = "Select Type" | "Residential" | "Commercial" | "Mixed";
export type UnitMultiplier = "Each" | "C" | "M";
export type DiscountType = "None" | "Dollar" | "Percent";

export type EstimateRow = {
  name: string;
  quantity: number;
  unitCost: number;
  unit: UnitMultiplier;
  labourUnit: number;
  labourUnitMultiplier: UnitMultiplier;
};

export type EstimateTotals = {
  materialSum: number;
  labourExtensionSum: number;
  totalLabourCost: number;
  totalMaterial: number;
  baseCost: number;
  markupAmt: number;
  overheadAmt: number;
  cost: number;
  warrantyAmt: number;
  discountAmt: number;
  estimateTotal: number;
  estimateGrandTotal: number;
  estimateTax: number;
};

export type EstimateDetails = {
  workType: WorkTypeOption;
  labourRate: number;
  rows: EstimateRow[];
  markup: number;
  overhead: number;
  warranty: number;
  esaFee: number;
  hydroFee: number;
  startDate: string;
  completionDate: string;
  depositAmount: string;
  depositTouched: boolean;
  discountType: DiscountType;
  discountValue: number;
  totals: EstimateTotals;
};

export type CustomerInfo = {
  fullName: string;
  address: string;
  projectName: string;
  projectDescription: string;
  contactMethod: string;
  phone: string;
  email: string;
};

export type EstimateSubmission = {
  date: string;
  customer: CustomerInfo;
  estimate: EstimateDetails;
};

export type AgreementDetails = {
  projectName: string;
  projectDescription: string;
  clientName: string;
  projectAddress: string;
  date: string;
  estimateTotal: string;
  estimateGrandTotal: string;
  estimateTax: string;
  depositAmount: string;
  balanceDue: string;
  startDate: string;
  completionDate: string;
};
