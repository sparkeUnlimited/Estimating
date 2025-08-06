"use client";
import Layout from "@/layout/Layout";
import ElectricalWorkAgreement, {
  ElectricalWorkAgreementData,
} from "@/components/ElectricalWorkAgreement";
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

export default function AgreementPage() {
  const [data, setData] = useState<ElectricalWorkAgreementData | null>(null);
  const [estimate, setEstimate] = useState<any>(null);
  const [ready, setReady] = useState(false);
  const [signature, setSignature] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("agreementData");
    if (stored) {
      setData(JSON.parse(stored));
    }
    const est = localStorage.getItem("estimateData");
    if (est) {
      setEstimate(JSON.parse(est));
    }
    window.scrollTo(0, 0);
  }, []);

  if (!data || !estimate) return null;

  const handleSubmit = async () => {
    if (!ready || submitting) return;

    setSubmitting(true);
    const payload = {
      ...estimate,
      agreement: {
        ...data,
        acknowledged: ready,
        signature,
      },
    };
    const pdfBlob = new Blob([], { type: "application/pdf" });
    try {
      await sendEstimateDetailsLambda(payload, pdfBlob);
      localStorage.removeItem("estimateData");
      localStorage.removeItem("agreementData");
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
        {...data}
        onReadyChange={setReady}
        onSignature={setSignature}
        actions={
          <Stack direction="row" spacing={2} mt={3}>
            <Button variant="contained" onClick={() => router.push("/estimate")}>Back</Button>
            <Button variant="outlined" color="secondary" onClick={() => router.push("/")}>Cancel</Button>
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
