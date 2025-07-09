"use client";

import React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Table,
  TableHead,
  TableFooter,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  IconButton,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  InputAdornment,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import AddressAutocomplete from "@/components/AddressAutocomplete";
import HighRiseLabourAdjuster from "@/components/HighRiseLabourAdjuster";

const lookupAddress = async (
  address: string
  /* setCity: (s: string) => void,
  setProvince: (s: string) => void,
  setPostalCode: (s: string) => void */
) => {
  if (!address) {
    return;
  }
  try {
    const resp = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address
      )}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
    );
    const data = await resp.json();
    if (data.status === "OK" && data.results[0]) {
      const comps = data.results[0].address_components as google.maps.GeocoderAddressComponent[];
      const get = (type: string) => comps.find((c) => c.types.includes(type))?.short_name || "";
      /* setCity(get("locality") || get("postal_town"));
      setProvince(get("administrative_area_level_1"));
      const pc = get("postal_code");
      if (pc) {
        setPostalCode(formatPostalCode(pc));
      } */
    }
  } catch (err) {
    console.error("Address lookup failed", err);
  }
};

const phoneRegex = /^(?:\+?1[-. ]?)?(?:\(?[2-9]\d{2}\)?[-. ]?\d{3}[-. ]?\d{4})$/;
// const postalRegex = /^[A-Z]\d[A-Z] \d[A-Z]\d$/;
const formatCanadianPhone = (value: string) => {
  const digits = value.replace(/\D/g, "");
  const match = digits.match(/^1?([2-9]\d{2})(\d{3})(\d{4})$/);
  if (!match) return value;
  const [, area, exchange, line] = match;
  return `(${area}) ${exchange}-${line}`;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* const provinces = [
  { code: "AB", name: "Alberta" },
  { code: "BC", name: "British Columbia" },
  { code: "MB", name: "Manitoba" },
  { code: "NB", name: "New Brunswick" },
  { code: "NL", name: "Newfoundland and Labrador" },
  { code: "NS", name: "Nova Scotia" },
  { code: "NT", name: "Northwest Territories" },
  { code: "NU", name: "Nunavut" },
  { code: "ON", name: "Ontario" },
  { code: "PE", name: "Prince Edward Island" },
  { code: "QC", name: "Quebec" },
  { code: "SK", name: "Saskatchewan" },
  { code: "YT", name: "Yukon" },
] as const; */

/* const formatPostalCode = (value: string) => {
  const upper = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const first = upper.slice(0, 3);
  const last = upper.slice(3, 6);
  return last ? `${first} ${last}` : first;
}; */

export type EstimateRow = {
  name: string;
  quantity: number;
  unitCost: number;
  unit: "Each" | "C" | "M";
  labourUnit: number;
  labourUnitMultiplier: "Each" | "C" | "M";
};

const unitDivisor = { Each: 1, C: 100, M: 1000 } as const;

const EstimateForm = () => {
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  /* const [city, setCity] = useState("");
  const [province, setProvince] = useState("ON");
  const [postalCode, setPostalCode] = useState(""); */
  const [contactMethod, setContactMethod] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

  const [rows, setRows] = useState<EstimateRow[]>([
    {
      name: "",
      quantity: 0,
      unitCost: 0,
      unit: "Each",
      labourUnit: 0,
      labourUnitMultiplier: "Each",
    },
  ]);
  const [workType, setWorkType] = useState("Select Type");
  const [labourRate, setLabourRate] = useState(125);
  const [totalFloors, setTotalFloors] = useState(0);

  const [markup, setMarkup] = useState(30);
  const [overhead, setOverhead] = useState(10);
  const [warranty, setWarranty] = useState(3);
  const [esaFee, setEsaFee] = useState(0);
  const [hydroFee, setHydroFee] = useState(0);
  const [discountType, setDiscountType] = useState("None");
  const [discountValue, setDiscountValue] = useState(0);
  const [date] = useState(new Date().toISOString().slice(0, 10));
  const [depositAmount, setDepositAmount] = useState("");
  const [depositTouched, setDepositTouched] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [completionDate, setCompletionDate] = useState("");
  const [error, setError] = useState(false);

  const validate = (val: string) => emailRegex.test(val);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("estimateData");
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored);
      const c = parsed.customer || {};
      const e = parsed.estimate || {};
      setFullName(c.fullName || "");
      setAddress(c.address || "");
      setContactMethod(c.contactMethod || "");
      setPhone(c.phone || "");
      setEmail(c.email || "");
      setProjectName(c.projectName || "");
      setProjectDescription(c.projectDescription || "");
      setRows(
        e.rows || [
          {
            name: "",
            quantity: 0,
            unitCost: 0,
            unit: "Each",
            labourUnit: 0,
            labourUnitMultiplier: "Each",
          },
        ]
      );
      setWorkType(e.workType || "Select Type");
      if (typeof e.labourRate === "number") setLabourRate(e.labourRate);
      if (typeof e.markup === "number") setMarkup(e.markup);
      if (typeof e.overhead === "number") setOverhead(e.overhead);
      if (typeof e.warranty === "number") setWarranty(e.warranty);
      if (typeof e.esaFee === "number") setEsaFee(e.esaFee);
      if (typeof e.hydroFee === "number") setHydroFee(e.hydroFee);
      setDiscountType(e.discountType || "None");
      if (typeof e.discountValue === "number") setDiscountValue(e.discountValue);
      setDepositAmount(e.depositAmount || "");
      setDepositTouched(!!e.depositTouched);
      setStartDate(e.startDate || "");
      setCompletionDate(e.completionDate || "");
    } catch {
      // ignore corrupt localStorage data
    }
  }, []);

  useEffect(() => {
    if (workType === "Residential") {
      setLabourRate(125);
    } else if (workType === "Commercial") {
      setLabourRate(145);
    } else if (workType === "Mixed") {
      setLabourRate(145);
    } else {
      setLabourRate(0); // Default or unrecognized type
    }
  }, [workType]);

  //const allFieldsFilled = fullName && address && contactMethod && phone && email && totalFloors;
  // fullName && address && city && province && postalCode && contactMethod && phone && email;
  const customerValid =
    fullName &&
    address &&
    projectName &&
    projectDescription &&
    contactMethod &&
    phone &&
    email &&
    workType !== "Select Type";

  const addRow = () => {
    setRows((r) => [
      ...r,
      {
        name: "",
        quantity: 0,
        unitCost: 0,
        unit: "Each",
        labourUnit: 0,
        labourUnitMultiplier: "Each",
      },
    ]);
  };

  const removeRow = (idx: number) => {
    setRows((r) => r.filter((_, i) => i !== idx));
  };

  const updateRow = (idx: number, row: Partial<EstimateRow>) => {
    setRows((r) => r.map((item, i) => (i === idx ? { ...item, ...row } : item)));
  };

  const materialSum = rows.reduce(
    (sum, r) => sum + r.quantity * (r.unitCost / unitDivisor[r.unit]),
    0
  );

  const labourExtensionSum = rows.reduce(
    (sum, r) => sum + r.quantity * (r.labourUnit / unitDivisor[r.labourUnitMultiplier]),
    0
  );

  const totalLabourCost = labourExtensionSum * labourRate;
  const totalMaterial = materialSum;
  const baseCost = totalMaterial + totalLabourCost;
  const markupAmt = totalMaterial * (markup / 100);
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

  const grandTotal = subtotal - discountAmt;
  const depositNum = parseFloat(depositAmount) || 0;
  const balanceDue = grandTotal - depositNum;

  useEffect(() => {
    if (!depositTouched) {
      const half = grandTotal / 2;
      const roundedUp = Math.ceil(half);
      setDepositAmount(roundedUp.toString()); // or String(roundedUp)
    }
  }, [grandTotal, depositTouched]);

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
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
          grandTotal,
        },
      },
    };

    localStorage.setItem("estimateData", JSON.stringify(data));
    localStorage.setItem(
      "agreementData",
      JSON.stringify({
        projectName,
        projectDescription,
        clientName: fullName,
        projectAddress: address,
        date,
        estimatedTotal: grandTotal.toFixed(2),
        depositAmount,
        balanceDue: balanceDue.toFixed(2),
        startDate: startDate.toString(),
        completionDate: completionDate.toString(),
      })
    );

    router.push("/agreement");
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
    setDiscountType("None");
    setDiscountValue(0);
    setDepositAmount("");
    setStartDate("");
    setCompletionDate("");
    setDepositTouched(false);
    localStorage.removeItem("estimateData");
    localStorage.removeItem("agreementData");
    router.push("/");
  };

  return (
    <Paper sx={{ p: 4 }} elevation={4}>
      <Box component="form" onSubmit={handleNext}>
        <Stack spacing={3}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5" fontWeight="bold">
              Customer Information
            </Typography>
            <Typography variant="h6">{date}</Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid size={8}>
              <TextField
                label="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                fullWidth
              />
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid size={12}>
              <AddressAutocomplete
                value={address}
                onChange={(val) => setAddress(val)}
                onSelect={(val) => lookupAddress(val)}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid size={8}>
              <TextField
                label="Project Name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                required
                fullWidth
              />
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField
                label="Project Description"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                required
                fullWidth
                multiline
                minRows={3}
              />
            </Grid>
          </Grid>

          <Box>
            <Typography fontWeight="medium" gutterBottom>
              Preferred Contact
            </Typography>
            <RadioGroup
              row
              value={contactMethod}
              onChange={(e) => setContactMethod(e.target.value)}
            >
              <FormControlLabel value="phone" control={<Radio />} label="Phone/Mobile" />
              <FormControlLabel value="email" control={<Radio />} label="Email" />
            </RadioGroup>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mt={2}>
              <TextField
                label="Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onBlur={(e) => setPhone(formatCanadianPhone(e.target.value))}
                required
                type="tel"
                slotProps={{
                  htmlInput: {
                    pattern: phoneRegex.source,
                    title: "Valid Canadian phone number",
                    inputMode: "tel",
                  },
                }}
              />
              <TextField
                label="Email"
                type="email"
                value={email}
                required
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
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mt={2}>
              <TextField
                label="Project Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />
              <TextField
                label="Project Completion Date"
                type="date"
                value={completionDate}
                onChange={(e) => setCompletionDate(e.target.value)}
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />
            </Stack>
            <Typography variant="h6" fontWeight="bold" my={4}>
              Estimate Items
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
              <FormControl fullWidth required sx={{ mb: { xs: 2, sm: 3 } }}>
                <InputLabel id="wt">Work Type</InputLabel>
                <Select
                  labelId="wt"
                  label="Work Type"
                  value={workType}
                  onChange={(e) => setWorkType(e.target.value)}
                >
                  <MenuItem value="Select Type">Select Type</MenuItem>
                  <MenuItem value="Residential">Residential</MenuItem>
                  <MenuItem value="Commercial">Commercial</MenuItem>
                  <MenuItem value="Commercial">Mixed</MenuItem>
                </Select>
              </FormControl>
              {/* <TextField
                label="How many floors in the building?"
                type="number"
                fullWidth
                value={totalFloors || ""}
                onChange={(e) => setTotalFloors(parseInt(e.target.value))}
                margin="normal"
              /> */}
              <TextField
                label="Labour Rate"
                size="small"
                type="number"
                value={labourRate}
                onChange={(e) => setLabourRate(Number(e.target.value))}
              />
            </Stack>
          </Box>

          {/* <HighRiseLabourAdjuster totalFloors={totalFloors} /> */}

          {customerValid && (
            <>
              <TableContainer sx={{ overflowX: "auto" }}>
                <Table size="small">
                  <TableBody>
                    {rows.map((row, idx) => {
                      const materialExt = row.quantity * (row.unitCost / unitDivisor[row.unit]);
                      const labourExt =
                        row.quantity * (row.labourUnit / unitDivisor[row.labourUnitMultiplier]);
                      const lc = labourExt * labourRate;
                      return (
                        <React.Fragment key={`row-${idx}`}>
                          <TableRow>
                            <TableCell colSpan={9} sx={{ p: 0 }}>
                              <TextField
                                size="small"
                                label="Material Name"
                                fullWidth
                                value={row.name}
                                onChange={(e) => updateRow(idx, { name: e.target.value })}
                                required
                                slotProps={{
                                  input: {
                                    inputProps: { maxLength: 255 },
                                  },
                                }}
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow>
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
                            <TableCell sx={{ pl: 0 }}>
                              <TextField
                                size="small"
                                type="number"
                                value={row.quantity}
                                onChange={(e) =>
                                  updateRow(idx, { quantity: Number(e.target.value) })
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                size="small"
                                type="number"
                                value={row.unitCost}
                                onChange={(e) =>
                                  updateRow(idx, { unitCost: Number(e.target.value) })
                                }
                              />
                            </TableCell>

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
                            <TableCell>{materialExt.toFixed(2)}</TableCell>
                            <TableCell>
                              <TextField
                                size="small"
                                type="number"
                                value={row.labourUnit}
                                onChange={(e) =>
                                  updateRow(idx, { labourUnit: Number(e.target.value) })
                                }
                              />
                            </TableCell>
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
                            <TableCell>{labourExt.toFixed(2)}</TableCell>
                            <TableCell>{lc.toFixed(2)}</TableCell>
                            <TableCell>
                              <IconButton onClick={() => removeRow(idx)}>
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell colSpan={9} sx={{ px: 0 }}>
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
                      <TableCell colSpan={3}>
                        <Typography fontWeight="bold">Total Material Cost</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight="bold">{materialSum.toFixed(2)}</Typography>
                      </TableCell>
                      <TableCell colSpan={5} />
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={3}>
                        <Typography fontWeight="bold">Total Labour Extension</Typography>
                      </TableCell>
                      <TableCell colSpan={3} />
                      <TableCell>
                        <Typography fontWeight="bold">{labourExtensionSum.toFixed(2)}</Typography>
                      </TableCell>
                      <TableCell colSpan={2} />
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={3}>
                        <Typography fontWeight="bold">Total Labour Cost</Typography>
                      </TableCell>
                      <TableCell colSpan={4} />
                      <TableCell>
                        <Typography fontWeight="bold">{totalLabourCost.toFixed(2)}</Typography>
                      </TableCell>
                      <TableCell />
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={3}>
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
                        <Typography fontWeight="bold">ESA Total: {esaFee.toFixed(2)}</Typography>
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
                            onChange={(e) => setDiscountType(e.target.value)}
                          >
                            <MenuItem value="None">None</MenuItem>
                            <MenuItem value="Dollar">Dollar Discount</MenuItem>
                            <MenuItem value="Percent">Percent Discount</MenuItem>
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        {(discountType === "Dollar" || discountType === "Percent") && (
                          <TextField
                            label="Discount Value"
                            type="number"
                            value={discountValue}
                            onChange={(e) => setDiscountValue(Number(e.target.value))}
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

              <Box textAlign="right" my={2}>
                <TextField
                  label="Deposit"
                  type="number"
                  value={depositAmount}
                  onChange={(e) => {
                    setDepositTouched(true);
                    setDepositAmount(e.target.value);
                  }}
                  slotProps={{
                    input: {
                      readOnly: true,
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    },
                  }}
                  sx={{ mr: 2 }}
                />
                <TextField
                  label="Balance Due"
                  type="number"
                  value={balanceDue.toFixed(2)}
                  slotProps={{
                    input: {
                      readOnly: true,
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    },
                  }}
                />
              </Box>

              <Typography variant="h3" fontWeight="bold">
                Grand Total: {grandTotal.toFixed(2)}
              </Typography>
              <Stack direction="row" spacing={2} mt={2}>
                <Button variant="contained" disabled>
                  Back
                </Button>
                <Button variant="outlined" color="secondary" onClick={handleCancel}>
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
