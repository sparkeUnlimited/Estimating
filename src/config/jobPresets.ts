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
  key: JobPresetKey;
  label: string;
  defaultProjectName: string;
  defaultDescription: string;
  rows: EstimateRow[];
};

export const jobPresets: Record<JobPresetKey, JobPreset> = {
  panel_replacement: {
    key: "panel_replacement",
    label: "Panel Replacement",
    defaultProjectName: "Electrical Panel Replacement",
    defaultDescription:
      "Remove existing panel, install new breaker panel, reconnect existing circuits, and label breakers.",
    rows: [
      {
        name: "New breaker panel (40–60 circuit)",
        quantity: 1,
        unitCost: 450,
        unit: "Each",
        labourUnit: 4,
        labourUnitMultiplier: "Each",
        groupIndex: 1,
        groupTitle: "Panel Replacement",
      },
      {
        name: "Main breaker / disconnect kit",
        quantity: 1,
        unitCost: 120,
        unit: "Each",
        labourUnit: 0.5,
        labourUnitMultiplier: "Each",
        groupIndex: 1,
        groupTitle: "Panel Replacement",
      },
      {
        name: "Misc. connectors, screws, anchors, tape, labels",
        quantity: 1,
        unitCost: 80,
        unit: "Each",
        labourUnit: 1,
        labourUnitMultiplier: "Each",
        groupIndex: 1,
        groupTitle: "Panel Replacement",
      },
    ],
  },

  service_upgrade: {
    key: "service_upgrade",
    label: "Service Upgrade",
    defaultProjectName: "Service Upgrade",
    defaultDescription:
      "Upgrade existing electrical service, including meter base, mast, and service conductors as required by utility.",
    rows: [
      {
        name: "Meter base and fittings",
        quantity: 1,
        unitCost: 250,
        unit: "Each",
        labourUnit: 3,
        labourUnitMultiplier: "Each",
        groupIndex: 1,
        groupTitle: "Service Upgrade",
      },
      {
        name: "Service mast, weatherhead, clamps",
        quantity: 1,
        unitCost: 200,
        unit: "Each",
        labourUnit: 2,
        labourUnitMultiplier: "Each",
        groupIndex: 1,
        groupTitle: "Service Upgrade",
      },
      {
        name: "Bonding, ground rods, clamps, wire",
        quantity: 1,
        unitCost: 150,
        unit: "Each",
        labourUnit: 1.5,
        labourUnitMultiplier: "Each",
        groupIndex: 1,
        groupTitle: "Service Upgrade",
      },
    ],
  },

  ceiling_fan: {
    key: "ceiling_fan",
    label: "Ceiling Fan Upgrade",
    defaultProjectName: "Ceiling Fan Replacement",
    defaultDescription:
      "Replace existing light fixture with customer-supplied ceiling fan, including suitable fan-rated box where required.",
    rows: [
      {
        name: "Fan-rated box, brace, screws",
        quantity: 1,
        unitCost: 45,
        unit: "Each",
        labourUnit: 1.2,
        labourUnitMultiplier: "Each",
        groupIndex: 1,
        groupTitle: "Ceiling Fan Upgrade",
      },
      {
        name: "Misc. connectors and hardware",
        quantity: 1,
        unitCost: 15,
        unit: "Each",
        labourUnit: 0.3,
        labourUnitMultiplier: "Each",
        groupIndex: 1,
        groupTitle: "Ceiling Fan Upgrade",
      },
    ],
  },

  receptacle_standard: {
    key: "receptacle_standard",
    label: "Receptacle Replacements (Standard)",
    defaultProjectName: "Receptacle Replacement",
    defaultDescription:
      "Replace existing receptacles with new tamper-resistant receptacles. Includes cover plates and minor box repairs as required.",
    rows: [
      {
        name: "Standard TR receptacle",
        quantity: 10,
        unitCost: 3.5,
        unit: "Each",
        labourUnit: 0.25,
        labourUnitMultiplier: "Each",
        groupIndex: 1,
        groupTitle: "Receptacle Replacements (Standard)",
      },
      {
        name: "Decora plates and screws",
        quantity: 10,
        unitCost: 1.25,
        unit: "Each",
        labourUnit: 0.05,
        labourUnitMultiplier: "Each",
        groupIndex: 1,
        groupTitle: "Receptacle Replacements (Standard)",
      },
    ],
  },

  receptacle_gfci: {
    key: "receptacle_gfci",
    label: "Receptacle Replacements (GFCI)",
    defaultProjectName: "GFCI Receptacle Upgrade",
    defaultDescription:
      "Replace selected receptacles with GFCI receptacles as required by code in kitchens, bathrooms, and exterior locations.",
    rows: [
      {
        name: "GFCI receptacle",
        quantity: 4,
        unitCost: 25,
        unit: "Each",
        labourUnit: 0.4,
        labourUnitMultiplier: "Each",
        groupIndex: 1,
        groupTitle: "Receptacle Replacements (GFCI)",
      },
      {
        name: "Weatherproof in-use covers (where required)",
        quantity: 2,
        unitCost: 30,
        unit: "Each",
        labourUnit: 0.3,
        labourUnitMultiplier: "Each",
        groupIndex: 1,
        groupTitle: "Receptacle Replacements (GFCI)",
      },
    ],
  },

  basement_reno_basic: {
    key: "basement_reno_basic",
    label: "Basement Renovation (Basic)",
    defaultProjectName: "Basement Electrical Rough-In",
    defaultDescription:
      "Provide rough-in and finishing for basement renovation including receptacles, lighting, and circuits as specified.",
    rows: [
      {
        name: "General lighting rough-in (per room average)",
        quantity: 4,
        unitCost: 75,
        unit: "Each",
        labourUnit: 2,
        labourUnitMultiplier: "Each",
        groupIndex: 1,
        groupTitle: "Basement Renovation",
      },
      {
        name: "Receptacle circuits and devices",
        quantity: 12,
        unitCost: 15,
        unit: "Each",
        labourUnit: 0.5,
        labourUnitMultiplier: "Each",
        groupIndex: 1,
        groupTitle: "Basement Renovation",
      },
      {
        name: "Smoke/CO combo rough-in and device",
        quantity: 2,
        unitCost: 70,
        unit: "Each",
        labourUnit: 0.75,
        labourUnitMultiplier: "Each",
        groupIndex: 1,
        groupTitle: "Basement Renovation",
      },
    ],
  },

  tesla_charger: {
    key: "tesla_charger",
    label: "Tesla EV Charger",
    defaultProjectName: "Tesla Wall Connector Install",
    defaultDescription:
      "Supply and install Tesla Wall Connector (or customer-supplied charger) including circuit, wiring, and labeling.",
    rows: [
      {
        name: "NMD/Teck cable and fittings for EV circuit",
        quantity: 1,
        unitCost: 200,
        unit: "Each",
        labourUnit: 3,
        labourUnitMultiplier: "Each",
        groupIndex: 1,
        groupTitle: "Tesla EV Charger",
      },
      {
        name: "Breaker and terminations",
        quantity: 1,
        unitCost: 60,
        unit: "Each",
        labourUnit: 0.5,
        labourUnitMultiplier: "Each",
        groupIndex: 1,
        groupTitle: "Tesla EV Charger",
      },
    ],
  },

  generator_install: {
    key: "generator_install",
    label: "Generator + ATS",
    defaultProjectName: "Standby Generator Installation",
    defaultDescription:
      "Install standby generator and automatic transfer switch (ATS) with appropriate circuits and interconnections.",
    rows: [
      {
        name: "Automatic transfer switch (ATS), wiring, terminations",
        quantity: 1,
        unitCost: 1200,
        unit: "Each",
        labourUnit: 6,
        labourUnitMultiplier: "Each",
        groupIndex: 1,
        groupTitle: "Generator + ATS",
      },
      {
        name: "Generator connection hardware and wiring",
        quantity: 1,
        unitCost: 850,
        unit: "Each",
        labourUnit: 4,
        labourUnitMultiplier: "Each",
        groupIndex: 1,
        groupTitle: "Generator + ATS",
      },
    ],
  },
};
