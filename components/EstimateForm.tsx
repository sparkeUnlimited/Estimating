import { useEffect, useState } from "react";
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
import { getServices, ServiceItem } from "@/lib/msLists";
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

const serviceOptions = ["Pot Lights", "Receptacles", "Strip Lights", "Panel Maintenance"] as const;

export type EstimateRow = {
  serviceId?: string;
  serviceName?: string;
  labourUnits: number;
  labourRate: number;
  unit: "Each" | "C" | "M";
};

export type MaterialRow = {
  name: string;
  units: number;
  unitCost: number;
  unit: "Each" | "C" | "M";
};

const unitDivisor = { Each: 1, C: 100, M: 1000 } as const;

const EstimateForm = () => {
  const [services, setServices] = useState<ServiceItem[]>([]);

  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("ON");
  const [postalCode, setPostalCode] = useState("");
  const [contactMethod, setContactMethod] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [labourRows, setLabourRows] = useState<EstimateRow[]>([
    { labourUnits: 0, labourRate: 0, unit: "Each", serviceName: "" },
  ]);
  const [materialRows, setMaterialRows] = useState<MaterialRow[]>([
    { name: "", units: 0, unitCost: 0, unit: "Each" },
  ]);

  const [markup, setMarkup] = useState(30);
  const [overhead, setOverhead] = useState(25);
  const [esaFee, setEsaFee] = useState(0);
  const [hydroFee, setHydroFee] = useState(0);
  const [discountType, setDiscountType] = useState("None");
  const [discountValue, setDiscountValue] = useState(0);

  useEffect(() => {
    getServices().then(setServices);
  }, []);

  const customerValid =
    fullName && address && city && province && postalCode && contactMethod && phone && email;

  const addLabourRow = () => {
    setLabourRows((r) => [...r, { labourUnits: 0, labourRate: 0, unit: "Each", serviceName: "" }]);
  };

  const removeLabourRow = (idx: number) => {
    setLabourRows((r) => r.filter((_, i) => i !== idx));
  };

  const updateLabourRow = (idx: number, row: Partial<EstimateRow>) => {
    setLabourRows((r) => r.map((item, i) => (i === idx ? { ...item, ...row } : item)));
  };

  const addMaterialRow = () => {
    setMaterialRows((r) => [...r, { name: "", units: 0, unitCost: 0, unit: "Each" }]);
  };

  const removeMaterialRow = (idx: number) => {
    setMaterialRows((r) => r.filter((_, i) => i !== idx));
  };

  const updateMaterialRow = (idx: number, row: Partial<MaterialRow>) => {
    setMaterialRows((r) => r.map((item, i) => (i === idx ? { ...item, ...row } : item)));
  };

  const labourHours = labourRows.reduce((sum, r) => sum + r.labourUnits / unitDivisor[r.unit], 0);
  const labourCost = labourRows.reduce(
    (sum, r) => sum + (r.labourUnits * r.labourRate) / unitDivisor[r.unit],
    0
  );
  const labourMinMultiplier = labourHours > 0 && labourHours < 2 ? 2 / labourHours : 1;
  const labourSum = labourCost * labourMinMultiplier;
  const totalLabour = labourSum;

  const materialSum = materialRows.reduce(
    (sum, r) => sum + r.units * (r.unitCost / unitDivisor[r.unit]),
    0
  );
  const totalMaterial = materialSum;

  const baseCost = totalLabour + totalMaterial;
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
      labourRows,
      materialRows,
      markup,
      overhead,
      esaFee,
      hydroFee,
      discountType,
      discountValue,
      totals: {
        labourSum,
        materialSum,
        totalLabour,
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
              <Typography variant="h6" fontWeight="bold">
                Labour
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Work Type</TableCell>
                    <TableCell>Services</TableCell>
                    <TableCell>Labour Units</TableCell>
                    <TableCell>Labour Rate</TableCell>
                    <TableCell>Unit Amount</TableCell>
                    <TableCell>Extension</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {labourRows.map((row, idx) => {
                    const service = services.find((s) => s.id === row.serviceId);
                    const rate = service ? service.labourRate : row.labourRate;
                    const units = row.labourUnits;
                    const divisor = unitDivisor[row.unit];
                    const ext = (units * rate) / divisor;
                    return (
                      <TableRow key={idx}>
                        <TableCell>
                          <FormControl fullWidth size="small">
                            <InputLabel>Work Type</InputLabel>
                            <Select
                              value={row.serviceId || ""}
                              label="Work Type"
                              onChange={(e) =>
                                updateLabourRow(idx, {
                                  serviceId: e.target.value,
                                  labourRate:
                                    services.find((s) => s.id === e.target.value)?.labourRate || 0,
                                })
                              }
                            >
                              {services.map((s) => (
                                <MenuItem key={s.id} value={s.id}>
                                  {s.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell>
                          <FormControl fullWidth size="small">
                            <InputLabel>Services</InputLabel>
                            <Select
                              value={row.serviceName || ""}
                              label="Services"
                              onChange={(e) =>
                                updateLabourRow(idx, { serviceName: e.target.value })
                              }
                            >
                              {serviceOptions.map((opt) => (
                                <MenuItem key={opt} value={opt}>
                                  {opt}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            value={units}
                            onChange={(e) =>
                              updateLabourRow(idx, { labourUnits: Number(e.target.value) })
                            }
                          />
                        </TableCell>
                        <TableCell>{rate}</TableCell>
                        <TableCell>
                          <Select
                            size="small"
                            value={row.unit}
                            onChange={(e) => updateLabourRow(idx, { unit: e.target.value as any })}
                          >
                            <MenuItem value="Each">Each</MenuItem>
                            <MenuItem value="C">C</MenuItem>
                            <MenuItem value="M">M</MenuItem>
                          </Select>
                        </TableCell>
                        <TableCell>{ext.toFixed(2)}</TableCell>
                        <TableCell>
                          <IconButton onClick={() => removeLabourRow(idx)}>
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <Box textAlign="right" my={1}>
                <IconButton onClick={addLabourRow} size="small">
                  <AddIcon />
                </IconButton>
              </Box>
              <Typography>Labour Sum: {labourSum.toFixed(2)}</Typography>
              <Typography>Total Labour: {totalLabour.toFixed(2)}</Typography>

              <Typography variant="h6" fontWeight="bold" mt={4}>
                Material
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Description</TableCell>
                    <TableCell>Units</TableCell>
                    <TableCell>Unit Cost</TableCell>
                    <TableCell>Unit Multiplier</TableCell>
                    <TableCell>Extension</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {materialRows.map((row, idx) => {
                    const ext = row.units * (row.unitCost / unitDivisor[row.unit]);
                    return (
                      <TableRow key={idx}>
                        <TableCell>
                          <TextField
                            size="small"
                            value={row.name}
                            onChange={(e) => updateMaterialRow(idx, { name: e.target.value })}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            value={row.units}
                            onChange={(e) =>
                              updateMaterialRow(idx, { units: Number(e.target.value) })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            value={row.unitCost}
                            onChange={(e) =>
                              updateMaterialRow(idx, { unitCost: Number(e.target.value) })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            size="small"
                            value={row.unit}
                            onChange={(e) =>
                              updateMaterialRow(idx, { unit: e.target.value as any })
                            }
                          >
                            <MenuItem value="Each">Each</MenuItem>
                            <MenuItem value="C">C</MenuItem>
                            <MenuItem value="M">M</MenuItem>
                          </Select>
                        </TableCell>
                        <TableCell>{ext.toFixed(2)}</TableCell>
                        <TableCell>
                          <IconButton onClick={() => removeMaterialRow(idx)}>
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <Box textAlign="right" my={1}>
                <IconButton onClick={addMaterialRow} size="small">
                  <AddIcon />
                </IconButton>
              </Box>
              <Typography>Material Sum: {materialSum.toFixed(2)}</Typography>
              <Typography>Total Material: {totalMaterial.toFixed(2)}</Typography>

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
