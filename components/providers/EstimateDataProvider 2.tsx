"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type {
  AgreementDetails,
  EstimateSubmission,
} from "@/types/estimate";
import { useEstimateDraft } from "@/src/hooks/useEstimateDraft";

type EstimateContextValue = {
  estimateData: EstimateSubmission | null;
  setEstimateData: (data: EstimateSubmission | null) => void;
  agreementData: AgreementDetails | null;
  setAgreementData: (data: AgreementDetails | null) => void;
  clearEstimateData: () => void;
};

const EstimateDataContext = createContext<EstimateContextValue | undefined>(
  undefined
);

export function EstimateDataProvider({ children }: { children: ReactNode }) {
  const [estimateData, setEstimateDataState] =
    useState<EstimateSubmission | null>(null);
  const [agreementData, setAgreementDataState] =
    useState<AgreementDetails | null>(null);

  const { draft, saveDraft, clearDraft } = useEstimateDraft();

  // On first load, if we have no estimateData but do have a draft, hydrate from draft
  useEffect(() => {
    if (!estimateData && draft) {
      setEstimateDataState(draft);
    }
  }, [draft, estimateData]);

  const setEstimateData = (data: EstimateSubmission | null) => {
    setEstimateDataState(data);
    if (data) {
      void saveDraft(data);
    } else {
      void clearDraft();
    }
  };

  const setAgreementData = (data: AgreementDetails | null) => {
    setAgreementDataState(data);
  };

  const clearEstimateData = () => {
    setEstimateDataState(null);
    setAgreementDataState(null);
    void clearDraft();
  };

  const value: EstimateContextValue = {
    estimateData,
    setEstimateData,
    agreementData,
    setAgreementData,
    clearEstimateData,
  };

  return (
    <EstimateDataContext.Provider value={value}>
      {children}
    </EstimateDataContext.Provider>
  );
}

export function useEstimateData() {
  const ctx = useContext(EstimateDataContext);
  if (!ctx) {
    throw new Error(
      "useEstimateData must be used within an EstimateDataProvider"
    );
  }
  return ctx;
}
