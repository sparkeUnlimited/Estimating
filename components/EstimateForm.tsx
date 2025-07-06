import React from "react";
import { useState, useEffect } from "react";
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
} from "@mui/material";
import Grid from "@mui/material/Grid";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { sendEstimateEmail, ensureCustomerFolder } from "@/lib/api";

const capitalizeWords = (value: string) =>
  value
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");

const lookupAddress = async (
  address: string,
  setCity: (s: string) => void,
  setProvince: (s: string) => void,
  setPostalCode: (s: string) => void
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
      const comps = data.results[0].address_components;
      const get = (type: string) =>
        comps.find((c: any) => c.types.includes(type))?.short_name || "";
      setCity(get("locality") || get("postal_town"));
      setProvince(get("administrative_area_level_1"));
      const pc = get("postal_code");
      if (pc) {
        setPostalCode(formatPostalCode(pc));
      }
    }
  } catch (err) {
    console.error("Address lookup failed", err);
  }
};

const postalRegex = /^[A-Z]\d[A-Z] \d[A-Z]\d$/;
const phoneRegex = /^(?:\+?1[-. ]?)?(?:\(?[2-9]\d{2}\)?[-. ]?\d{3}[-. ]?\d{4})$/;

const provinces = [
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
] as const;

const formatPostalCode = (value: string) => {
  const upper = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const first = upper.slice(0, 3);
  const last = upper.slice(3, 6);
  return last ? `${first} ${last}` : first;
};

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
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("ON");
  const [postalCode, setPostalCode] = useState("");
  const [contactMethod, setContactMethod] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

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

  const [markup, setMarkup] = useState(30);
  const [overhead, setOverhead] = useState(10);
  const [warranty, setWarranty] = useState(3);
  const [esaFee, setEsaFee] = useState(0);
  const [hydroFee, setHydroFee] = useState(0);
  const [discountType, setDiscountType] = useState("None");
  const [discountValue, setDiscountValue] = useState(0);

  useEffect(() => {
    if (workType === "Residential") {
      setLabourRate(125);
    } else if (workType === "Commercial") {
      setLabourRate(145);
    } else {
      setLabourRate(0); // Default or unrecognized type
    }
  }, [workType]);

  const allFieldsFilled =
    fullName && address && city && province && postalCode && contactMethod && phone && email;

  const customerValid = allFieldsFilled && workType !== "Select Type";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      customer: {
        fullName,
        address,
        city,
        province,
        postalCode,
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

    const pdfBlob = new Blob([], { type: "application/pdf" });
    await ensureCustomerFolder(`${fullName}_${address}`);
    await sendEstimateEmail(data, pdfBlob);
  };

  return (
    <Paper sx={{ p: 4 }} elevation={4}>
      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <Typography variant="h5" fontWeight="bold">
            Customer Information
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Full Name"
                value={fullName}
                onChange={(e) => setFullName(capitalizeWords(e.target.value))}
                required
                fullWidth
              />
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Stack direction="row" spacing={1}>
                <TextField
                  label="Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  fullWidth
                />
                <Button
                  variant="outlined"
                  onClick={() =>
                    lookupAddress(address, setCity, setProvince, setPostalCode)
                  }
                >
                  Lookup
                </Button>
              </Stack>
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth required>
                <InputLabel id="prov">Province</InputLabel>
                <Select
                  labelId="prov"
                  label="Province"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                >
                  {provinces.map((p) => (
                    <MenuItem key={p.code} value={p.code}>
                      {p.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Postal Code"
                value={postalCode}
                onChange={(e) => setPostalCode(formatPostalCode(e.target.value))}
                required
                inputProps={{
                  pattern: postalRegex.source,
                  title: "Format A1A 1A1",
                }}
                fullWidth
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
                required
                type="tel"
                inputProps={{
                  pattern: phoneRegex.source,
                  title: "Valid Canadian phone number",
                }}
              />
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                fullWidth
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
                </Select>
              </FormControl>
              <TextField
                label="Labour Rate"
                size="small"
                type="number"
                value={labourRate}
                onChange={(e) => setLabourRate(Number(e.target.value))}
              />
            </Stack>
          </Box>

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
                                onChange={(e) => updateRow(idx, { unit: e.target.value as any })}
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
                                    labourUnitMultiplier: e.target.value as any,
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
                        <Typography >
                          On Material Only
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="h6" fontWeight="bold">
                          Overhead
                        </Typography>
                        <Typography >
                         Material + Labour
                        </Typography>
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

              <Typography variant="h3" fontWeight="bold">
                Grand Total: {grandTotal.toFixed(2)}
              </Typography>
              <Button type="submit" variant="contained">
                Submit Estimate
              </Button>
            </>
          )}
        </Stack>
      </Box>
    </Paper>
  );
};

export default EstimateForm;
