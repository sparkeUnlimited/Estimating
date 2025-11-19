"use client";

import { useEffect, useState, useCallback } from "react";
import type { EstimateSubmission } from "@/types/estimate";

const DB_NAME = "sparke-estimates";
const DB_VERSION = 1;
const STORE_NAME = "estimateDrafts";
const DRAFT_KEY = "current";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      return reject(new Error("IndexedDB not available"));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error || new Error("Failed to open IndexedDB"));
    };
  });
}

async function idbGetDraft(): Promise<EstimateSubmission | null> {
  try {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const getReq = store.get(DRAFT_KEY);

      getReq.onsuccess = () => {
        resolve((getReq.result as EstimateSubmission) || null);
      };
      getReq.onerror = () => reject(getReq.error);
    });
  } catch (err) {
    console.error("idbGetDraft error", err);
    return null;
  }
}

async function idbSaveDraft(draft: EstimateSubmission): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const putReq = store.put(draft, DRAFT_KEY);

      putReq.onsuccess = () => resolve();
      putReq.onerror = () => reject(putReq.error);
    });
  } catch (err) {
    console.error("idbSaveDraft error", err);
  }
}

async function idbClearDraft(): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const delReq = store.delete(DRAFT_KEY);

      delReq.onsuccess = () => resolve();
      delReq.onerror = () => reject(delReq.error);
    });
  } catch (err) {
    console.error("idbClearDraft error", err);
  }
}

export function useEstimateDraft() {
  const [draft, setDraft] = useState<EstimateSubmission | null>(null);

  // Load on mount (only in browser)
  useEffect(() => {
    let cancelled = false;

    if (typeof window === "undefined") return;

    (async () => {
      const result = await idbGetDraft();
      if (!cancelled) {
        setDraft(result);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const saveDraft = useCallback(async (submission: EstimateSubmission) => {
    setDraft(submission);
    await idbSaveDraft(submission);
  }, []);

  const clearDraft = useCallback(async () => {
    setDraft(null);
    await idbClearDraft();
  }, []);

  return { draft, saveDraft, clearDraft };
}
