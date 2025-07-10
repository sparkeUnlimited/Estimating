"use client";
import { Box, Typography, FormControlLabel, Checkbox, Stack, TextField } from "@mui/material";
import { useState, useEffect, Fragment } from "react";
import Link from "next/link";
import SignaturePad from "@/components/SignaturePad";
import agreementText from "@/data/agreementText.json";

export type ElectricalWorkAgreementData = {
  projectName: string;
  projectDescription: string;
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
  projectName,
  projectDescription,
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
  const termsConditionsUrl = "/termsandconditions";
  //const [contractorSig, setContractorSig] = useState("");

  useEffect(() => {
    onReadyChange?.(ack && !!clientSig);
  }, [ack, clientSig, onReadyChange]);

  const replaceTextPlaceholders = (text: string) =>
    text
      .replace("{{estimatedTotal}}", estimatedTotal)
      .replace("{{depositAmount}}", depositAmount)
      .replace("{{startDate}}", startDate)
      .replace("{{completionDate}}", completionDate)
      .replace("{{balanceDue}}", balanceDue);

  const renderAcknowledgment = (text: string) => {
    const replaced = replaceTextPlaceholders(text);
    const parts = replaced.split("{{termsLink}}");
    return (
      <>
        {parts[0]}
        <Link href={termsConditionsUrl}>Terms and Conditions</Link>
        {parts[1]}
      </>
    );
  };

  return (
    <Box sx={{ backgroundColor: "white", p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Electrical Work Agreement
      </Typography>
      <Typography variant="h6" fontWeight={"bold"}>
        Project Name:{" "}
      </Typography>
      <Typography>{projectName}</Typography>
      <Typography variant="h6" fontWeight={"bold"}>
        Project Description:{" "}
      </Typography>
      <Typography>{projectDescription}</Typography>
      <Typography sx={{ mt: 4 }}>
        <Box component="span" fontWeight="fontWeightBold">
          Client Name:
        </Box>{" "}
        {clientName}
      </Typography>
      <Typography>
        <Box component="span" fontWeight="fontWeightBold">
          Project Address:
        </Box>{" "}
        {projectAddress}
      </Typography>
      <Typography>
        <Box component="span" fontWeight="fontWeightBold">
          Date:
        </Box>{" "}
        {date}
      </Typography>

      {agreementText.sections.map((section, idx) => (
        <Fragment key={idx}>
          <Typography variant="h6" fontWeight="bold" sx={{ mt: 2 }}>
            {section.title}
          </Typography>
          {section.text && (
            <Typography sx={{ mt: 1, whiteSpace: "pre-line" }}>
              {replaceTextPlaceholders(section.text)}
            </Typography>
          )}
          {/*  {section.subsections?.map((sub, subIdx) => (
            <Fragment key={subIdx}>
              <Typography fontWeight="bold" sx={{ mt: 1 }}>
                {sub.title}
              </Typography>
              <Typography sx={{ whiteSpace: "pre-line" }}>
                {replaceTextPlaceholders(sub.text)}
              </Typography>
            </Fragment>
          ))} */}
        </Fragment>
      ))}
      <Box
        sx={{
          mt: 3,
          border: ack ? "none" : "1px solid red",
          pt: 1,
          borderRadius: 1,
          transition: "border 0.3s ease",
        }}
      >
        <FormControlLabel
          control={<Checkbox required checked={ack} onChange={(e) => setAck(e.target.checked)} />}
          label={renderAcknowledgment(agreementText.acknowledgment)}
        />
      </Box>

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
            label="Customer Name"
            fullWidth
            value={clientName}
            sx={{ mt: 1 }}
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
          />
          <TextField
            label="Date"
            type="date"
            value={date}
            sx={{ mt: 1 }}
            slotProps={{
              inputLabel: {
                shrink: true,
              },
              input: { readOnly: true },
            }}
            fullWidth
          />
        </Box>
        {/* <Box>
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
        </Box> */}
      </Stack>
    </Box>
  );
}
