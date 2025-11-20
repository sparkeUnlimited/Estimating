// src/types/estimate.ts

export type WorkTypeOption = "Select Type" | "Residential" | "Commercial" | "Mixed";

export type DiscountType = "None" | "Dollar" | "Percent";

export type EstimateRow = {
  name: string;
  quantity: number;
  unitCost: number;
  unit: "Each" | "C" | "M";
  labourUnit: number;
  labourUnitMultiplier: "Each" | "C" | "M";

  // NEW: numeric grouping for customer-facing sections
  groupIndex: number;      // 1, 2, 3, ...
  groupTitle?: string;     // e.g. "Panel Upgrade", "Basement Lighting"
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

export type EstimateStatus = "draft" | "ready_for_review" | "sent" | "accepted";

export type EstimateSubmission = {
  estimateId?: string;
  status?: EstimateStatus;
  date: string;
  customer: {
    fullName: string;
    address: string;
    projectName: string;
    projectDescription: string;
    contactMethod: string;
    phone: string;
    email: string;
  };
  estimate: {
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
