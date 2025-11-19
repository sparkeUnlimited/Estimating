// src/config/jobPresets.ts
import type { EstimateRow } from "@/types/estimate";

export type JobPresetKey =
  | "panel_replacement"
  | "service_upgrade"
  | "ceiling_fan"
  | "receptacle_standard"
  | "receptacle_gfci"
  | "basement_reno_basic"
  | "tesla_charger"
  | "generator_install";

export type JobPreset = {
  label: string;
  defaultProjectName: string;
  defaultDescription: string;
  rows: EstimateRow[];
};

const emptyRow = (name: string, quantity = 1, labourUnit = 0, unitCost = 0): EstimateRow => ({
  name,
  quantity,
  unitCost,
  unit: "Each",
  labourUnit,
  labourUnitMultiplier: "Each",
});

export const jobPresets: Record<JobPresetKey, JobPreset> = {
  panel_replacement: {
    label: "Panel Replacement (100–200A)",
    defaultProjectName: "Electrical Panel Replacement",
    defaultDescription:
      "Remove existing panel, install new loadcentre, re-terminate existing circuits, label breakers, and coordinate ESA inspection.",
    rows: [
      emptyRow("New loadcentre (40-circuit, 120/240V)", 1, 4),
      emptyRow("Main breaker (100–200A, as required)", 1, 0.25),
      emptyRow("Allowance for branch breakers (mix of 1P/2P)", 1, 0.75),
      emptyRow("Bonding bushings, locknuts, and connectors", 1, 0.4),
      emptyRow("Anti-short bushings / cable clamps / staples", 1, 0.3),
      emptyRow("Grounding & bonding conductors/hardware", 1, 0.5),
      emptyRow("Panel screws / hardware & fasteners", 1, 0.15),
      emptyRow("Disposal of old panel and scrap", 1, 0.3),
    ],
  },

  service_upgrade: {
    label: "Service Upgrade (Meter & Mast)",
    defaultProjectName: "Service Upgrade",
    defaultDescription:
      "Upgrade overhead/underground service, meterbase, mast (if applicable), and panel terminations, including coordination with Hydro and ESA.",
    rows: [
      emptyRow("New meterbase (approved for service size)", 1, 1.5),
      emptyRow("Service mast / conduit and fittings", 1, 1.25),
      emptyRow("Service entrance cable / conductors", 1, 1.5),
      emptyRow("Weatherhead, hub, clamps, straps", 1, 0.75),
      emptyRow("Bonding bushings and grounding hardware", 1, 0.5),
      emptyRow("Sealant, screws, anchors, misc. fasteners", 1, 0.3),
    ],
  },

  ceiling_fan: {
    label: "Ceiling Fan Replacement/Upgrade",
    defaultProjectName: "Ceiling Fan Replacement",
    defaultDescription:
      "Replace existing light/fan with new ceiling fan, verify support box, make terminations, and test operation.",
    rows: [
      emptyRow("Ceiling fan (supplied by owner or contractor)", 1, 0.75),
      emptyRow("Fan-rated junction box / brace (if required)", 1, 0.6),
      emptyRow("Fan-rated box screws, straps, hardware", 1, 0.2),
      emptyRow("Wire connectors, tape, small materials", 1, 0.15),
    ],
  },

  receptacle_standard: {
    label: "Standard Receptacle Replacement",
    defaultProjectName: "Receptacle Replacements",
    defaultDescription:
      "Replace existing standard receptacles with new devices, verify terminations, and test polarity/GFCI where required.",
    rows: [
      emptyRow("Standard 15A/20A receptacles (allowance)", 1, 0.15),
      emptyRow("Device plates (Decora or standard)", 1, 0.05),
      emptyRow("Wire connectors, tape, misc. materials", 1, 0.05),
    ],
  },

  receptacle_gfci: {
    label: "GFCI Receptacle Replacement",
    defaultProjectName: "GFCI Receptacle Replacements",
    defaultDescription:
      "Replace existing receptacles with GFCI-type where required, test function, and label downstream protection.",
    rows: [
      emptyRow("GFCI receptacles (per location)", 1, 0.25),
      emptyRow("In-use / weatherproof covers (if exterior)", 1, 0.25),
      emptyRow("Device plates and misc. hardware", 1, 0.05),
    ],
  },

  basement_reno_basic: {
    label: "Basement Renovation (Basic Lighting & Receptacles)",
    defaultProjectName: "Basement Electrical Rough-in & Finish",
    defaultDescription:
      "Provide rough-in and finishing for lights, receptacles, and circuits in basement renovation, including ESA inspection.",
    rows: [
      emptyRow("NMD90 cable (allowance per sq. ft.)", 1, 2),
      emptyRow("Lighting boxes and brackets", 1, 1),
      emptyRow("Receptacle boxes", 1, 1),
      emptyRow("Switch boxes", 1, 0.75),
      emptyRow("Pot lights / fixtures (allowance)", 1, 1.5),
      emptyRow("Standard receptacles and switches", 1, 1.2),
      emptyRow("Smoke/CO combination alarms", 1, 0.5),
      emptyRow("Staples, straps, connectors, misc.", 1, 1),
    ],
  },

  tesla_charger: {
    label: "Tesla Wall Connector / EV Charger",
    defaultProjectName: "Tesla EV Charger Installation",
    defaultDescription:
      "Install Tesla Wall Connector or EV charger, including dedicated circuit, cable run, terminations, and commissioning.",
    rows: [
      emptyRow("Tesla Wall Connector / EVSE", 1, 1.5),
      emptyRow("Breaker (40–60A, per design)", 1, 0.25),
      emptyRow("NMD90 / Teck90 / EMT + wire (run allowance)", 1, 2.5),
      emptyRow("Conduit fittings / connectors / straps", 1, 0.75),
      emptyRow("Junction box / pull box (if required)", 1, 0.5),
      emptyRow("Labeling and circuit directory update", 1, 0.25),
    ],
  },

  generator_install: {
    label: "Standby Generator + ATS",
    defaultProjectName: "Standby Generator & Transfer Switch",
    defaultDescription:
      "Install standby generator and automatic transfer switch, including concrete pad (if in scope), conduits, wiring, and terminations.",
    rows: [
      emptyRow("Standby generator (size as specified)", 1, 4),
      emptyRow("Automatic transfer switch (ATS)", 1, 3),
      emptyRow("Conduit and fittings between gen/ATS/panel", 1, 2.5),
      emptyRow("Control wiring and terminations", 1, 1.5),
      emptyRow("Concrete pad / mounting hardware (if included)", 1, 1.5),
      emptyRow("Ground rods, clamps, and grounding conductor", 1, 1.25),
      emptyRow("Labeling, signage, and directory updates", 1, 0.5),
    ],
  },
};
