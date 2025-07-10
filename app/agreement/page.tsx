"use client";
import Layout from "@/layout/Layout";
import ElectricalWorkAgreement, {
  ElectricalWorkAgreementData,
} from "@/components/ElectricalWorkAgreement";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { sendEstimateDetailsLambda } from "@/lib/api";
import { Button, Stack, Box } from "@mui/material";

export default function AgreementPage() {
  const [data, setData] = useState<ElectricalWorkAgreementData | null>(null);
  const [estimate, setEstimate] = useState<any>(null);
  const [ready, setReady] = useState(false);
  const [signature, setSignature] = useState("");
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
  }, []);

  if (!data || !estimate) return null;

  const handleSubmit = async () => {
    if (!ready) return;

    const payload = { ...estimate, agreement: { acknowledged: ready, signature } };
    const pdfBlob = new Blob([], { type: "application/pdf" });
    try {
      await sendEstimateDetailsLambda(payload, pdfBlob);
      localStorage.removeItem("estimateData");
      localStorage.removeItem("agreementData");
      router.push("/");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Layout title="Agreement">
      
      <ElectricalWorkAgreement
        {...data}
        onReadyChange={setReady}
        onSignature={setSignature}
      />
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
    </Layout>
  );
}
