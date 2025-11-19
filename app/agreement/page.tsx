"use client";
import Layout from "@/layout/Layout";
import ElectricalWorkAgreement from "@/components/ElectricalWorkAgreement";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { sendEstimateDetailsLambda } from "@/lib/api";
import {
  Button,
  Stack,
  Box,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import { useEstimateData } from "@/components/providers/EstimateDataProvider";

export default function AgreementPage() {
  const [ready, setReady] = useState(false);
  const [signature, setSignature] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const { agreementData, estimateData, clearEstimateData } = useEstimateData();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!agreementData || !estimateData) {
      router.replace("/estimate");
    }
  }, [agreementData, estimateData, router]);

  if (!agreementData || !estimateData) return null;

  const handleSubmit = async () => {
    if (!ready || submitting) return;

    setSubmitting(true);
    const payload = {
      ...estimateData,
      agreement: {
        ...agreementData,
        acknowledged: ready,
        signature,
      },
    };
    const pdfBlob = new Blob([], { type: "application/pdf" });
    try {
      await sendEstimateDetailsLambda(payload, pdfBlob);
      clearEstimateData();
      router.push("/submitted");
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout title="Agreement">
      <Backdrop
        open={submitting}
        sx={{ zIndex: (theme) => theme.zIndex.modal + 1, color: "#fff" }}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      <ElectricalWorkAgreement
        {...agreementData}
        onReadyChange={setReady}
        onSignature={setSignature}
        actions={
          <Stack direction="row" spacing={2} mt={3}>
            <Button variant="contained" onClick={() => router.push("/estimate")}>Back</Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => {
                clearEstimateData();
                router.push("/");
              }}
            >
              Cancel
            </Button>
            <Box sx={{ flexGrow: 1 }} />
            {ready ? (
              <Button variant="contained" onClick={handleSubmit}>Submit</Button>
            ) : (
              <Button variant="contained" disabled>
                Next
              </Button>
            )}
          </Stack>
        }
      />
    </Layout>
  );
}
