import { useState, useEffect } from "react";
import {
  Box,
  Button,
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
  const [workType, setWorkType] = useState("Residential");
  const [labourRate, setLabourRate] = useState(125);

  const [markup, setMarkup] = useState(30);
  const [overhead, setOverhead] = useState(10);
  const [esaFee, setEsaFee] = useState(0);
  const [hydroFee, setHydroFee] = useState(0);
  const [discountType, setDiscountType] = useState("None");
  const [discountValue, setDiscountValue] = useState(0);

  useEffect(() => {
    setLabourRate(workType === "Residential" ? 125 : 145);
  }, [workType]);

  const customerValid =
    fullName && address && city && province && postalCode && contactMethod && phone && email;

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
  const markupAmt = baseCost * (markup / 100);
  const overheadAmt = baseCost * (overhead / 100);
  const cost = baseCost + markupAmt + overheadAmt;
  const warranty = cost * 0.03;
  const subtotal = cost + warranty + esaFee + hydroFee;

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
        warranty,
        discountAmt,
        grandTotal,
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
                onChange={(e) => setFullName(e.target.value)}
                required
                fullWidth
              />
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                fullWidth
              />
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
          </Box>

          {customerValid && (
            <>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
                <FormControl size="small">
                  <InputLabel id="wt">Work Type</InputLabel>
                  <Select
                    labelId="wt"
                    label="Work Type"
                    value={workType}
                    onChange={(e) => setWorkType(e.target.value)}
                  >
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

              <Typography variant="h6" fontWeight="bold" mt={2}>
                Estimate Items
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Material Name</TableCell>
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
                </TableHead>
                <TableBody>
                  {rows.map((row, idx) => {
                    const materialExt = row.quantity * (row.unitCost / unitDivisor[row.unit]);
                    const labourExt =
                      row.quantity * (row.labourUnit / unitDivisor[row.labourUnitMultiplier]);
                    const lc = labourExt * labourRate;
                    return (
                      <TableRow key={idx}>
                        <TableCell>
                          <TextField
                            size="small"
                            value={row.name}
                            onChange={(e) => updateRow(idx, { name: e.target.value })}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            value={row.quantity}
                            onChange={(e) => updateRow(idx, { quantity: Number(e.target.value) })}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            value={row.unitCost}
                            onChange={(e) => updateRow(idx, { unitCost: Number(e.target.value) })}
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
                            onChange={(e) => updateRow(idx, { labourUnit: Number(e.target.value) })}
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
                    );
                  })}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={4}>
                      <Typography fontWeight="bold">Total Material Cost</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight="bold">{materialSum.toFixed(2)}</Typography>
                    </TableCell>
                    <TableCell colSpan={5} />
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={4}>
                      <Typography fontWeight="bold">Total Labour Extension</Typography>
                    </TableCell>
                    <TableCell colSpan={4} />
                    <TableCell>
                      <Typography fontWeight="bold">{labourExtensionSum.toFixed(2)}</Typography>
                    </TableCell>
                    <TableCell colSpan={1} />
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={4}>
                      <Typography fontWeight="bold">Total Labour Cost</Typography>
                    </TableCell>
                    <TableCell colSpan={4} />
                    <TableCell>
                      <Typography fontWeight="bold">{totalLabourCost.toFixed(2)}</Typography>
                    </TableCell>
                    <TableCell colSpan={1} />
                  </TableRow>
                  <TableRow>
                    <TableCell />
                  </TableRow>
                  <TableRow>
                    <TableCell />
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={2}>
                      <Typography variant="h6" fontWeight="bold">
                        Total Cost
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="h6" fontWeight="bold">
                        {baseCost.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell colSpan={7} />
                  </TableRow>
                </TableFooter>
              </Table>
              <Box textAlign="right" my={1}>
                <IconButton onClick={addRow} size="small">
                  <AddIcon />
                </IconButton>
              </Box>

              <Typography variant="h6" fontWeight="bold" mt={4}>
                Totals
              </Typography>
              <Typography>Cost: {baseCost.toFixed(2)}</Typography>
              <TextField
                label="Markup %"
                type="number"
                value={markup}
                onChange={(e) => setMarkup(Number(e.target.value))}
              />
              <Typography>Markup Amount: {markupAmt.toFixed(2)}</Typography>
              <TextField
                label="Overhead %"
                type="number"
                value={overhead}
                onChange={(e) => setOverhead(Number(e.target.value))}
              />
              <Typography>Overhead Amount: {overheadAmt.toFixed(2)}</Typography>
              <Typography>Warranty (3%): {warranty.toFixed(2)}</Typography>
              <TextField
                label="ESA Inspection Fees"
                type="number"
                value={esaFee}
                onChange={(e) => setEsaFee(Number(e.target.value))}
              />
              <TextField
                label="Hydro Fees"
                type="number"
                value={hydroFee}
                onChange={(e) => setHydroFee(Number(e.target.value))}
              />
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
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
                {(discountType === "Dollar" || discountType === "Percent") && (
                  <TextField
                    label="Discount Value"
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                  />
                )}
              </Stack>
              <Typography>Total Discount: {discountAmt.toFixed(2)}</Typography>
              <Typography variant="h6" fontWeight="bold">
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
