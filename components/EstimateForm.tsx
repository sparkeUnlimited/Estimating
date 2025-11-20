// components/EstimateForm.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

// ---- MUI imports (split out) ----
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableFooter from "@mui/material/TableFooter";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import IconButton from "@mui/material/IconButton";
import Select from "@mui/material/Select";
import type { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import InputAdornment from "@mui/material/InputAdornment";
import Grid from "@mui/material/Grid";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

// ---- App imports ----
import AddressAutocomplete from "@/components/AddressAutocomplete";
import { useEstimateData } from "@/components/providers/EstimateDataProvider";
import type {
  AgreementDetails,
  DiscountType,
  EstimateRow,
  EstimateSubmission,
  WorkTypeOption,
} from "@/types/estimate";
import { useEstimateDraft } from "@/src/hooks/useEstimateDraft";
import { jobPresets, type JobPresetKey } from "@/src/config/jobPresets";

// ---- Helpers ----
const lookupAddress = async (address: string) => {
  if (!address) return;
  try {
    const resp = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address
      )}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
    );
    const data = await resp.json();
    if (data.status === "OK" && data.results[0]) {
      const comps =
        data.results[0].address_components as google.maps.GeocoderAddressComponent[];
      const get = (type: string) =>
        comps.find((c) => c.types.includes(type))?.short_name || "";
      // City/province/postal could be wired from `get(...)` later
    }
  } catch (err) {
    console.error("Address lookup failed", err);
  }
};

const phoneRegex =
  /^(?:\+?1[-. ]?)?(?:\(?[2-9]\d{2}\)?[-. ]?\d{3}[-. ]?\d{4})$/;

const formatCanadianPhone = (value: string) => {
  const digits = value.replace(/\D/g, "");
  const match = digits.match(/^1?([2-9]\d{2})(\d{3})(\d{4})$/);
  if (!match) return value;
  const [, area, exchange, line] = match;
  return `(${area}) ${exchange}-${line}`;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const unitDivisor = { Each: 1, C: 100, M: 1000 } as const;

const workTypeOptions: WorkTypeOption[] = [
  "Select Type",
  "Residential",
  "Commercial",
  "Mixed",
];

const defaultLabourRates: Record<
  Exclude<WorkTypeOption, "Select Type">,
  number
> = {
  Residential: 95,
  Commercial: 145,
  Mixed: 145,
};

const isWorkType = (value: unknown): value is WorkTypeOption =>
  typeof value === "string" && workTypeOptions.includes(value as WorkTypeOption);

const EstimateForm = () => {
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [contactMethod, setContactMethod] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [developing] = useState(true);

  const [rows, setRows] = useState<EstimateRow[]>([
    {
      name: "",
      quantity: 0,
      unitCost: 0,
      unit: "Each",
      labourUnit: 0,
      labourUnitMultiplier: "Each",
      groupIndex: 1,
      groupTitle: "",
    },
  ]);

  const [workType, setWorkType] = useState<WorkTypeOption>("Select Type");
  const [labourRate, setLabourRate] = useState(125);
  const [totalFloors, setTotalFloors] = useState(0);

  const [markup, setMarkup] = useState(10);
  const [overhead, setOverhead] = useState(10);
  const [warranty, setWarranty] = useState(3);
  const [esaFee, setEsaFee] = useState(0);
  const [hydroFee, setHydroFee] = useState(0);
  const [discountType, setDiscountType] = useState<DiscountType>("None");
  const [discountValue, setDiscountValue] = useState(0);
  const [date] = useState(new Date().toISOString().slice(0, 10));
  const [depositAmount, setDepositAmount] = useState("");
  const [depositTouched, setDepositTouched] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [completionDate, setCompletionDate] = useState("");
  const [error, setError] = useState(false);

  const skipNextLabourAutoRef = useRef(false);
  const hasHydratedRef = useRef(false);

  const [selectedPreset, setSelectedPreset] = useState<JobPresetKey | "">("");

  const validate = (val: string) => emailRegex.test(val);
  const router = useRouter();

  const { estimateData, setEstimateData, setAgreementData, clearEstimateData } =
    useEstimateData();

  const { draft, saveDraft, clearDraft } = useEstimateDraft();

  // ---- Derived values ----
  const customerValid = workType !== "Select Type";

  const materialSum = rows.reduce(
    (sum, r) => sum + r.quantity * (r.unitCost / unitDivisor[r.unit]),
    0
  );

  const labourExtensionSum = rows.reduce(
    (sum, r) =>
      sum + r.quantity * (r.labourUnit / unitDivisor[r.labourUnitMultiplier]),
    0
  );

  const totalLabourCost = labourExtensionSum * labourRate;
  const totalMaterial = materialSum;
  const baseCost = totalMaterial + totalLabourCost;
  const markupAmt = baseCost * (markup / 100);
  const overheadAmt = baseCost * (overhead / 100);
  const cost = baseCost + markupAmt + overheadAmt;
  const warrantyAmt = cost * (warranty / 100);
  const subtotal = cost + warrantyAmt + esaFee + hydroFee;

  const discountAmt =
    discountType === "Dollar"
      ? discountValue
      : discountType === "Percent"
      ? subtotal * (discountValue / 100)
      : 0;

  const estimateTotal = subtotal - discountAmt;
  const estimateTax = estimateTotal * 0.13;
  const estimateGrandTotal = estimateTotal + estimateTax;
  const depositNum = parseFloat(depositAmount) || 0;
  const balanceDue = estimateGrandTotal - depositNum;

  // ---- Hydrate from context or draft (run once) ----
  useEffect(() => {
    if (hasHydratedRef.current) return;

    // Prefer context (estimateData) if present
    if (estimateData && estimateData.customer && estimateData.estimate) {
      const c = estimateData.customer;
      const e = estimateData.estimate;

      setFullName(c.fullName || "");
      setAddress(c.address || "");
      setContactMethod(c.contactMethod || "");
      setPhone(c.phone || "");
      setEmail(c.email || "");
      setProjectName(c.projectName || "");
      setProjectDescription(c.projectDescription || "");

      setRows(
        (e.rows ||
          [
            {
              name: "",
              quantity: 0,
              unitCost: 0,
              unit: "Each",
              labourUnit: 0,
              labourUnitMultiplier: "Each",
              groupIndex: 1,
              groupTitle: "",
            },
          ]).map((r, i) => ({
          ...r,
          groupIndex: r.groupIndex ?? i + 1,
          groupTitle: r.groupTitle ?? "",
        }))
      );

      const storedWorkType = isWorkType(e.workType)
        ? e.workType
        : "Select Type";
      if (storedWorkType !== "Select Type") {
        skipNextLabourAutoRef.current = true;
      }
      setWorkType(storedWorkType);

      if (typeof e.labourRate === "number") setLabourRate(e.labourRate);
      if (typeof e.markup === "number") setMarkup(e.markup);
      if (typeof e.overhead === "number") setOverhead(e.overhead);
      if (typeof e.warranty === "number") setWarranty(e.warranty);
      if (typeof e.esaFee === "number") setEsaFee(e.esaFee);
      if (typeof e.hydroFee === "number") setHydroFee(e.hydroFee);
      setDiscountType(e.discountType || "None");
      if (typeof e.discountValue === "number")
        setDiscountValue(e.discountValue);
      setDepositAmount(e.depositAmount || "");
      setDepositTouched(!!e.depositTouched);
      setStartDate(e.startDate || "");
      setCompletionDate(e.completionDate || "");

      hasHydratedRef.current = true;
      return;
    }

    // Otherwise hydrate from draft if available
    if (draft && draft.customer && draft.estimate) {
      const c = draft.customer;
      const e = draft.estimate;

      setFullName(c.fullName || "");
      setAddress(c.address || "");
      setContactMethod(c.contactMethod || "");
      setPhone(c.phone || "");
      setEmail(c.email || "");
      setProjectName(c.projectName || "");
      setProjectDescription(c.projectDescription || "");

      setRows(
        (e.rows ||
          [
            {
              name: "",
              quantity: 0,
              unitCost: 0,
              unit: "Each",
              labourUnit: 0,
              labourUnitMultiplier: "Each",
              groupIndex: 1,
              groupTitle: "",
            },
          ]).map((r, i) => ({
          ...r,
          groupIndex: r.groupIndex ?? i + 1,
          groupTitle: r.groupTitle ?? "",
        }))
      );

      const storedWorkType = isWorkType(e.workType)
        ? e.workType
        : "Select Type";
      if (storedWorkType !== "Select Type") {
        skipNextLabourAutoRef.current = true;
      }
      setWorkType(storedWorkType);

      if (typeof e.labourRate === "number") setLabourRate(e.labourRate);
      if (typeof e.markup === "number") setMarkup(e.markup);
      if (typeof e.overhead === "number") setOverhead(e.overhead);
      if (typeof e.warranty === "number") setWarranty(e.warranty);
      if (typeof e.esaFee === "number") setEsaFee(e.esaFee);
      if (typeof e.hydroFee === "number") setHydroFee(e.hydroFee);
      setDiscountType(e.discountType || "None");
      if (typeof e.discountValue === "number")
        setDiscountValue(e.discountValue);
      setDepositAmount(e.depositAmount || "");
      setDepositTouched(!!e.depositTouched);
      setStartDate(e.startDate || "");
      setCompletionDate(e.completionDate || "");
    }

    hasHydratedRef.current = true;
  }, [estimateData, draft]);

  // Auto-set labour rate on work type change
  useEffect(() => {
    if (workType === "Select Type") return;
    if (skipNextLabourAutoRef.current) {
      skipNextLabourAutoRef.current = false;
      return;
    }
    const nextRate = defaultLabourRates[workType];
    if (typeof nextRate === "number") {
      setLabourRate(nextRate);
    }
  }, [workType]);

  // Auto-calc default deposit as 50%
  useEffect(() => {
    if (!depositTouched) {
      const half = estimateGrandTotal / 2;
      const roundedUp = Math.ceil(half);
      setDepositAmount(roundedUp.toString());
    }
  }, [estimateGrandTotal, depositTouched]);

  // ---- Apply job presets ----
  const applyJobPreset = (key: JobPresetKey) => {
    const preset = jobPresets[key];
    if (!preset) return;

    const hasData = rows.some(
      (r) => r.name || r.quantity || r.unitCost || r.labourUnit
    );

    setRows((prev) => {
      if (!hasData && prev.length === 1) {
        // Start at group 1 with preset's group info
        return preset.rows.map((r) => ({
          ...r,
          groupIndex: r.groupIndex ?? 1,
          groupTitle: r.groupTitle ?? preset.label,
        }));
      }
      // Append rows after existing ones; keep groupIndex in preset
      return [
        ...prev,
        ...preset.rows.map((r) => ({
          ...r,
          groupIndex: r.groupIndex ?? 1,
          groupTitle: r.groupTitle ?? preset.label,
        })),
      ];
    });

    if (!projectName) {
      setProjectName(preset.defaultProjectName);
    }
    if (!projectDescription) {
      setProjectDescription(preset.defaultDescription);
    }
  };

  const handlePresetChange = (e: SelectChangeEvent<string>) => {
    const value = e.target.value as JobPresetKey | "";
    setSelectedPreset(value);
    if (value) {
      applyJobPreset(value);
    }
  };

  // ---- Draft persistence to IndexedDB ----
  useEffect(() => {
    if (!hasHydratedRef.current) return;
    if (!customerValid) return;

    const submission: EstimateSubmission = {
      date,
      customer: {
        fullName,
        address,
        projectName,
        projectDescription,
        contactMethod,
        phone,
        email,
      },
      estimate: {
        workType,
        labourRate,
        rows,
        markup,
        overhead,
        warranty,
        esaFee,
        hydroFee,
        startDate,
        completionDate,
        depositAmount,
        depositTouched,
        discountType,
        discountValue,
        totals: {
          materialSum,
          labourExtensionSum,
          totalLabourCost,
          totalMaterial,
          baseCost,
          markupAmt,
          overheadAmt,
          cost,
          warrantyAmt,
          discountAmt,
          estimateTotal,
          estimateGrandTotal,
          estimateTax,
        },
      },
    };

    saveDraft(submission);
  }, [
    customerValid,
    date,
    fullName,
    address,
    projectName,
    projectDescription,
    contactMethod,
    phone,
    email,
    workType,
    labourRate,
    rows,
    markup,
    overhead,
    warranty,
    esaFee,
    hydroFee,
    startDate,
    completionDate,
    depositAmount,
    depositTouched,
    discountType,
    discountValue,
    materialSum,
    labourExtensionSum,
    totalLabourCost,
    totalMaterial,
    baseCost,
    markupAmt,
    overheadAmt,
    cost,
    warrantyAmt,
    discountAmt,
    estimateTotal,
    estimateGrandTotal,
    estimateTax,
    saveDraft,
  ]);

  // ---- Row helpers ----
  const addRow = () => {
    setRows((prev) => {
      const last = prev[prev.length - 1];
      const nextGroupIndex = last ? last.groupIndex : 1;
      const nextGroupTitle = last ? last.groupTitle : "";

      return [
        ...prev,
        {
          name: "",
          quantity: 0,
          unitCost: 0,
          unit: "Each",
          labourUnit: 0,
          labourUnitMultiplier: "Each",
          groupIndex: nextGroupIndex,
          groupTitle: nextGroupTitle,
        },
      ];
    });
  };

  const removeRow = (idx: number) => {
    setRows((r) => r.filter((_, i) => i !== idx));
  };

  const updateRow = (idx: number, row: Partial<EstimateRow>) => {
    setRows((r) => r.map((item, i) => (i === idx ? { ...item, ...row } : item)));
  };

  // ---- Submit / Cancel ----
  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();

    const data: EstimateSubmission = {
      date,
      customer: {
        fullName,
        address,
        projectName,
        projectDescription,
        contactMethod,
        phone,
        email,
      },
      estimate: {
        workType,
        labourRate,
        rows,
        markup,
        overhead,
        warranty,
        esaFee,
        hydroFee,
        startDate,
        completionDate,
        depositAmount,
        depositTouched,
        discountType,
        discountValue,
        totals: {
          materialSum,
          labourExtensionSum,
          totalLabourCost,
          totalMaterial,
          baseCost,
          markupAmt,
          overheadAmt,
          cost,
          warrantyAmt,
          discountAmt,
          estimateTotal,
          estimateGrandTotal,
          estimateTax,
        },
      },
    };

    const agreementPayload: AgreementDetails = {
      projectName,
      projectDescription,
      clientName: fullName,
      projectAddress: address,
      date,
      estimateTotal: estimateTotal.toFixed(2),
      estimateGrandTotal: estimateGrandTotal.toFixed(2),
      estimateTax: estimateTax.toFixed(2),
      depositAmount,
      balanceDue: balanceDue.toFixed(2),
      startDate: startDate.toString(),
      completionDate: completionDate.toString(),
    };

    setEstimateData(data);
    setAgreementData(agreementPayload);

    try {
      const res = await fetch("/api/estimates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          status: "ready_for_review",
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.estimateId) {
        console.error("Failed to save estimate", json);
        // You can surface a toast/snackbar here later
        return;
      }

      const estimateId = json.estimateId as string;
      router.push(`/estimates/review/${estimateId}`);
    } catch (err) {
      console.error("Failed to save estimate via API", err);
    }
  };

  const handleCancel = () => {
    setFullName("");
    setAddress("");
    setProjectName("");
    setProjectDescription("");
    setContactMethod("");
    setPhone("");
    setEmail("");
    setRows([
      {
        name: "",
        quantity: 0,
        unitCost: 0,
        unit: "Each",
        labourUnit: 0,
        labourUnitMultiplier: "Each",
        groupIndex: 1,
        groupTitle: "",
      },
    ]);
    setWorkType("Select Type");
    setLabourRate(125);
    setTotalFloors(0);
    setMarkup(30);
    setOverhead(10);
    setWarranty(3);
    setEsaFee(0);
    setHydroFee(0);
    setDiscountValue(0);
    setDiscountType("None");
    setDepositAmount("");
    setStartDate("");
    setCompletionDate("");
    setDepositTouched(false);
    clearEstimateData();
    clearDraft();
    router.push("/");
  };

  // ---- Render ----
  return (
    <Paper sx={{ p: 4 }} elevation={4}>
      <Box component="form" onSubmit={handleNext}>
        <Stack spacing={3}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5" fontWeight="bold">
              Project
            </Typography>
            <Typography variant="h6">Date: {date}</Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid size={{xs:12, md:8}}>
              <TextField
                label="Project Name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                
                fullWidth
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid size={{xs:12}}>
              <TextField
                label="Project Description"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                
                fullWidth
                multiline
                minRows={3}
              />
            </Grid>
          </Grid>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mt={2}>
            <TextField
              label="Project Start Date"
              type="date"
              value={startDate}
              
              fullWidth
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Project Completion Date"
              type="date"
              value={completionDate}
              
              fullWidth
              onChange={(e) => setCompletionDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>

          <Typography variant="h5" fontWeight="bold">
            Customer Information
          </Typography>

          <Grid container spacing={2}>
            <Grid size={{xs:12, md:8}}>
              <TextField
                label="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                
                fullWidth
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid size={{xs:12}}>
              <AddressAutocomplete
                value={address}
                onChange={(val) => setAddress(val)}
                onSelect={(val) => lookupAddress(val)}
              />
            </Grid>
          </Grid>

          <Box>
            <Typography fontWeight="medium" gutterBottom>
              Preferred Contact Method
            </Typography>
            <RadioGroup
              row
              value={contactMethod}
              onChange={(e) => setContactMethod(e.target.value)}
            >
              <FormControlLabel
                value="phone"
                control={<Radio />}
                label="Phone/Mobile"
              />
              <FormControlLabel value="email" control={<Radio />} label="Email" />
            </RadioGroup>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mt={2}>
              <TextField
                label="Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onBlur={(e) => setPhone(formatCanadianPhone(e.target.value))}
                
                fullWidth
                type="tel"
                inputProps={{
                  pattern: phoneRegex.source,
                  title: "Valid Canadian phone number",
                  inputMode: "tel",
                }}
              />
              <TextField
                label="Email"
                type="email"
                value={email}
                
                fullWidth
                error={error}
                helperText={error ? "Invalid email address" : ""}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(!validate(e.target.value));
                }}
                onBlur={() => {
                  setError(!validate(email));
                }}
              />
            </Stack>

            <Typography variant="h6" fontWeight="bold" my={4}>
              Estimate Items
            </Typography>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              alignItems="center"
            >
              <FormControl fullWidth  sx={{ mb: { xs: 2, sm: 3 } }}>
                <InputLabel id="wt">Work Type</InputLabel>
                <Select
                  labelId="wt"
                  label="Work Type"
                  value={workType}
                  onChange={(e) =>
                    setWorkType(e.target.value as WorkTypeOption)
                  }
                >
                  <MenuItem value="Select Type">Select Type</MenuItem>
                  <MenuItem value="Residential">Residential</MenuItem>
                  <MenuItem value="Commercial">Commercial</MenuItem>
                  <MenuItem value="Mixed">Mixed</MenuItem>
                </Select>
              </FormControl>

              {developing && (
                <TextField
                  label="Labour Rate"
                  size="small"
                  type="number"
                  hidden
                  value={labourRate}
                  onChange={(e) => setLabourRate(Number(e.target.value))}
                />
              )}
            </Stack>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              alignItems="center"
              mt={1}
            >
              <FormControl fullWidth sx={{ mb: { xs: 2, sm: 3 } }}>
                <InputLabel id="job-preset-label">Common Job Preset</InputLabel>
                <Select
                  labelId="job-preset-label"
                  label="Common Job Preset"
                  value={selectedPreset}
                  onChange={handlePresetChange}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  <MenuItem value="panel_replacement">Panel Replacement</MenuItem>
                  <MenuItem value="service_upgrade">Service Upgrade</MenuItem>
                  <MenuItem value="ceiling_fan">Ceiling Fan Upgrade</MenuItem>
                  <MenuItem value="receptacle_standard">
                    Receptacle Replacements (Standard)
                  </MenuItem>
                  <MenuItem value="receptacle_gfci">
                    Receptacle Replacements (GFCI)
                  </MenuItem>
                  <MenuItem value="basement_reno_basic">
                    Basement Renovation (Basic)
                  </MenuItem>
                  <MenuItem value="tesla_charger">Tesla EV Charger</MenuItem>
                  <MenuItem value="generator_install">Generator + ATS</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Box>

          {customerValid && (
            <>
              <TableContainer sx={{ overflowX: "auto" }}>
                <Table size="small">
                  <TableBody>
                    {rows.map((row, idx) => {
                      const materialExt =
                        row.quantity * (row.unitCost / unitDivisor[row.unit]);
                      const labourExt =
                        row.quantity *
                        (row.labourUnit /
                          unitDivisor[row.labourUnitMultiplier]);
                      const lc = labourExt * labourRate;
                      return (
                        <React.Fragment key={`row-${idx}`}>
                          <TableRow>
                            <TableCell colSpan={11} sx={{ p: 0 }}>
                              <TextField
                                size="small"
                                label="Material Name / Description"
                                fullWidth
                                value={row.name}
                                onChange={(e) =>
                                  updateRow(idx, { name: e.target.value })
                                }
                                
                                inputProps={{ maxLength: 255 }}
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Group #</TableCell>
                            <TableCell>Group Title</TableCell>
                            <TableCell>Material Quantity</TableCell>
                            <TableCell>Material Unit Cost</TableCell>
                            <TableCell>Material Unit Multiplier</TableCell>
                            <TableCell>Material Extension</TableCell>
                            <TableCell>Labour Unit</TableCell>
                            <TableCell>Labour Unit Multiplier</TableCell>
                            <TableCell>Labour Extension</TableCell>
                            <TableCell>Labour Cost</TableCell>
                            <TableCell />
                          </TableRow>
                          <TableRow>
                            {/* Group # */}
                            <TableCell sx={{ pl: 0 }}>
                              <TextField
                                size="small"
                                type="number"
                                label="Grp"
                                value={row.groupIndex ?? 1}
                                onChange={(e) =>
                                  updateRow(idx, {
                                    groupIndex: Math.max(
                                      1,
                                      Number(e.target.value) || 1
                                    ),
                                  })
                                }
                                inputProps={{ min: 1 }}
                              />
                            </TableCell>

                            {/* Group Title */}
                            <TableCell>
                              <TextField
                                size="small"
                                label="Title"
                                value={row.groupTitle ?? ""}
                                onChange={(e) =>
                                  updateRow(idx, {
                                    groupTitle: e.target.value,
                                  })
                                }
                              />
                            </TableCell>

                            {/* Quantity */}
                            <TableCell>
                              <TextField
                                size="small"
                                type="number"
                                value={row.quantity}
                                onChange={(e) =>
                                  updateRow(idx, {
                                    quantity: Number(e.target.value),
                                  })
                                }
                              />
                            </TableCell>

                            {/* Unit Cost */}
                            <TableCell>
                              <TextField
                                size="small"
                                type="number"
                                value={row.unitCost}
                                onChange={(e) =>
                                  updateRow(idx, {
                                    unitCost: Number(e.target.value),
                                  })
                                }
                              />
                            </TableCell>

                            {/* Material Unit Multiplier */}
                            <TableCell>
                              <Select
                                size="small"
                                value={row.unit}
                                onChange={(e) =>
                                  updateRow(idx, {
                                    unit: e.target.value as EstimateRow["unit"],
                                  })
                                }
                              >
                                <MenuItem value="Each">Each</MenuItem>
                                <MenuItem value="C">C</MenuItem>
                                <MenuItem value="M">M</MenuItem>
                              </Select>
                            </TableCell>

                            {/* Material Extension */}
                            <TableCell>{materialExt.toFixed(2)}</TableCell>

                            {/* Labour Unit */}
                            <TableCell>
                              <TextField
                                size="small"
                                type="number"
                                value={row.labourUnit}
                                onChange={(e) =>
                                  updateRow(idx, {
                                    labourUnit: Number(e.target.value),
                                  })
                                }
                              />
                            </TableCell>

                            {/* Labour Unit Multiplier */}
                            <TableCell>
                              <Select
                                size="small"
                                value={row.labourUnitMultiplier}
                                onChange={(e) =>
                                  updateRow(idx, {
                                    labourUnitMultiplier: e.target
                                      .value as EstimateRow["labourUnitMultiplier"],
                                  })
                                }
                              >
                                <MenuItem value="Each">Each</MenuItem>
                                <MenuItem value="C">C</MenuItem>
                                <MenuItem value="M">M</MenuItem>
                              </Select>
                            </TableCell>

                            {/* Labour Extension */}
                            <TableCell>{labourExt.toFixed(2)}</TableCell>

                            {/* Labour Cost */}
                            <TableCell>{lc.toFixed(2)}</TableCell>

                            <TableCell>
                              <IconButton onClick={() => removeRow(idx)}>
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell colSpan={11} sx={{ px: 0 }}>
                              <Divider
                                sx={{
                                  borderBottom: "2px solid blue",
                                  height: "1px",
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        </React.Fragment>
                      );
                    })}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={5}>
                        <Typography fontWeight="bold">
                          Total Material Cost
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight="bold">
                          {materialSum.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell colSpan={5} />
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={5}>
                        <Typography fontWeight="bold">
                          Total Labour Extension
                        </Typography>
                      </TableCell>
                      <TableCell colSpan={3} />
                      <TableCell>
                        <Typography fontWeight="bold">
                          {labourExtensionSum.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell colSpan={2} />
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={5}>
                        <Typography fontWeight="bold">
                          Total Labour Cost
                        </Typography>
                      </TableCell>
                      <TableCell colSpan={4} />
                      <TableCell>
                        <Typography fontWeight="bold">
                          {totalLabourCost.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell />
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={5}>
                        <Typography variant="h6" fontWeight="bold">
                          Total Cost
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="h6" fontWeight="bold">
                          {baseCost.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell colSpan={5} />
                    </TableRow>
                  </TableFooter>
                </Table>
              </TableContainer>

              <Box textAlign="right" my={1}>
                <IconButton onClick={addRow} size="small">
                  <AddIcon />
                </IconButton>
              </Box>

              {/* Markup / Overhead / Warranty / Fees */}
              <TableContainer sx={{ overflowX: "auto" }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <Typography variant="h6" fontWeight="bold">
                          Markup
                        </Typography>
                        <Typography>On Material Only</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="h6" fontWeight="bold">
                          Overhead
                        </Typography>
                        <Typography>Material + Labour</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="h6" fontWeight="bold">
                          Warranty
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="h6" fontWeight="bold">
                          ESA Fees
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="h6" fontWeight="bold">
                          Hydro Fees
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <TextField
                          label="Markup %"
                          type="number"
                          value={markup}
                          onChange={(e) => setMarkup(Number(e.target.value))}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          label="Overhead %"
                          type="number"
                          value={overhead}
                          onChange={(e) => setOverhead(Number(e.target.value))}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          label="Warranty %"
                          type="number"
                          value={warranty}
                          onChange={(e) => setWarranty(Number(e.target.value))}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          label="ESA Inspection Fees"
                          type="number"
                          value={esaFee}
                          onChange={(e) => setEsaFee(Number(e.target.value))}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          label="Hydro Fees"
                          type="number"
                          value={hydroFee}
                          onChange={(e) => setHydroFee(Number(e.target.value))}
                        />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell>
                        <Typography fontWeight="bold">
                          Markup Total: {markupAmt.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight="bold">
                          Overhead Total: {overheadAmt.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight="bold">
                          Warranty Total: {warrantyAmt.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight="bold">
                          ESA Total: {esaFee.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight="bold">
                          Hydro Total: {hydroFee.toFixed(2)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </TableContainer>

              {/* Discount */}
              <TableContainer sx={{ overflowX: "auto" }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <Typography variant="h6" fontWeight="bold">
                          Discount
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <FormControl>
                          <InputLabel id="disc">Discount</InputLabel>
                          <Select
                            labelId="disc"
                            label="Discount"
                            value={discountType}
                            onChange={(e) =>
                              setDiscountType(e.target.value as DiscountType)
                            }
                          >
                            <MenuItem value="None">None</MenuItem>
                            <MenuItem value="Dollar">Dollar Discount</MenuItem>
                            <MenuItem value="Percent">Percent Discount</MenuItem>
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        {(discountType === "Dollar" ||
                          discountType === "Percent") && (
                          <TextField
                            label="Discount Value"
                            type="number"
                            value={discountValue}
                            onChange={(e) =>
                              setDiscountValue(Number(e.target.value))
                            }
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell>
                        <Typography fontWeight="bold">
                          Total Discount: {discountAmt.toFixed(2)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </TableContainer>

              {/* Deposit / Totals */}
              <Box textAlign="right" my={2}>
                <TextField
                  label="Deposit"
                  type="number"
                  value={depositAmount}
                  onChange={(e) => {
                    setDepositTouched(true);
                    setDepositAmount(e.target.value);
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">$</InputAdornment>
                    ),
                  }}
                  sx={{ mr: 2 }}
                />
                <TextField
                  label="Balance Due"
                  type="number"
                  value={balanceDue.toFixed(2)}
                  InputProps={{
                    readOnly: true,
                    startAdornment: (
                      <InputAdornment position="start">$</InputAdornment>
                    ),
                  }}
                />
              </Box>

              <Typography variant="h6" fontWeight="bold">
                Sub Total: {estimateTotal.toFixed(2)}
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                Tax: {estimateTax.toFixed(2)}
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                Grand Total: {estimateGrandTotal.toFixed(2)}
              </Typography>

              <Stack direction="row" spacing={2} mt={2}>
                <Button variant="contained" disabled>
                  Back
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Box sx={{ flexGrow: 1 }} />
                <Button type="submit" variant="contained" disabled={!customerValid}>
                  Next
                </Button>
              </Stack>
            </>
          )}
        </Stack>
      </Box>
    </Paper>
  );
};

export default EstimateForm;
