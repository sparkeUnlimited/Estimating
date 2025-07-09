"use client";
import { Box, Typography, FormControlLabel, Checkbox, Stack, TextField } from "@mui/material";
import { useState, useEffect, Fragment } from "react";
import SignaturePad from "@/components/SignaturePad";
import agreementText from "@/data/agreementText.json";

export type ElectricalWorkAgreementData = {
  clientName: string;
  projectAddress: string;
  date: string;
  estimatedTotal: string;
  depositAmount: string;
  startDate: string;
  completionDate: string;
  balanceDue: string;
};

type Props = ElectricalWorkAgreementData & {
  onReadyChange?: (ready: boolean) => void;
  onSignature?: (sig: string) => void;
};

export default function ElectricalWorkAgreement({
  clientName,
  projectAddress,
  date,
  estimatedTotal,
  depositAmount,
  balanceDue,
  startDate,
  completionDate,
  onReadyChange,
  onSignature,
}: Props) {
  const [ack, setAck] = useState(false);
  const [clientSig, setClientSig] = useState("");
  const [contractorSig, setContractorSig] = useState("");

  useEffect(() => {
    onReadyChange?.(ack && !!clientSig);
  }, [ack, clientSig, onReadyChange]);

  const replacePlaceholders = (text: string) =>
    text
      .replace("{{estimatedTotal}}", estimatedTotal)
      .replace("{{depositAmount}}", depositAmount)
      .replace("{{startDate}}", startDate)
      .replace("{{completionDate}}", completionDate)
      .replace("{{balanceDue}}", balanceDue);

  return (
    <Box sx={{ backgroundColor: "white", p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Electrical Work Agreement
      </Typography>
      <Typography>Client Name: {clientName}</Typography>
      <Typography>Project Address: {projectAddress}</Typography>
      <Typography>Date: {date}</Typography>
      {agreementText.sections.map((section, idx) => (
        <Fragment key={idx}>
          <Typography variant="h6" sx={{ mt: 2 }}>
            {section.title}
          </Typography>
          {section.text && (
            <Typography sx={{ mt: 1, whiteSpace: "pre-line" }}>
              {replacePlaceholders(section.text)}
            </Typography>
          )}
          {section.subsections?.map((sub, subIdx) => (
            <Fragment key={subIdx}>
              <Typography variant="subtitle1" sx={{ mt: 1 }}>
                {sub.title}
              </Typography>
              <Typography sx={{ whiteSpace: "pre-line" }}>
                {replacePlaceholders(sub.text)}
              </Typography>
            </Fragment>
          ))}
        </Fragment>
      ))}

      <FormControlLabel
        sx={{ mt: 3 }}
        control={<Checkbox required checked={ack} onChange={(e) => setAck(e.target.checked)} />}
        label={agreementText.acknowledgment}
      />

      <Typography variant="h6" sx={{ mt: 2 }}>
        Signatures
      </Typography>
      <Stack spacing={3} mt={2}>
        <Box>
          <Typography>Client Signature:</Typography>
          <SignaturePad
            onChange={(sig) => {
              setClientSig(sig);
              onSignature?.(sig);
            }}
          />
          <TextField
            label="Name (Printed)"
            fullWidth
            value={clientName}
            sx={{ mt: 1 }}
            InputProps={{ readOnly: true }}
          />
          <TextField
            label="Date"
            type="date"
            value={date}
            sx={{ mt: 1 }}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </Box>
        <Box>
          <Typography>Contractor Signature:</Typography>
          <SignaturePad onChange={setContractorSig} />
          <Typography sx={{ mt: 1 }}>Ryan Maxwell, Spark-E Unlimited</Typography>
          <TextField
            label="Date"
            type="date"
            value={date}
            sx={{ mt: 1 }}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </Box>
      </Stack>
    </Box>
  );
}
