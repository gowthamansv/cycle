/**
 * Service Ticket User Defined Fields (UDF) Centralized Mapping
 * Single Source of Truth for UDF1 - UDF10 assignments between frontend form controls and backend API payloads.
 */

export interface UdfFieldDefinition {
  field: string;
  legacyField: string;
  meaning: string;
  formControlName: string;
  expectedFormat: string;
  description: string;
  isOptional: boolean;
  options?: { label: string; value: string }[];
}

/**
 * Metadata definitions for all 10 User Defined Fields
 */
export const SERVICE_TICKET_UDF_DEFINITIONS: readonly UdfFieldDefinition[] = [
  {
    field: 'udf1',
    legacyField: 'udF1',
    meaning: 'Bicycle condition at intake',
    formControlName: 'udf1',
    expectedFormat: "'Good' | 'Fair' | 'Poor' | 'Severely Damaged'",
    description: 'Physical and operational condition of the bicycle evaluated during customer check-in.',
    isOptional: true,
    options: [
      { label: 'Good (Clean & Well Kept)', value: 'Good' },
      { label: 'Fair (Normal Wear & Tear)', value: 'Fair' },
      { label: 'Poor (Excessive Grime / Heavy Wear)', value: 'Poor' },
      { label: 'Severely Damaged (Crash / Structural)', value: 'Severely Damaged' }
    ]
  },
  {
    field: 'udf2',
    legacyField: 'udF2',
    meaning: 'Visible damage / pre-existing defects',
    formControlName: 'udf2',
    expectedFormat: 'string (text)',
    description: 'Existing scratches, paint chips, dents, cracked components, or pre-existing flaws.',
    isOptional: true
  },
  {
    field: 'udf3',
    legacyField: 'udF3',
    meaning: 'Approximate distance travelled',
    formControlName: 'udf3',
    expectedFormat: 'string (e.g., "1200 km" or "800 miles")',
    description: 'Approximate mileage / distance cycled since last service or purchase.',
    isOptional: true
  },
  {
    field: 'udf4',
    legacyField: 'udF4',
    meaning: 'Accessories received',
    formControlName: 'udf4',
    expectedFormat: 'string (comma-separated list or text)',
    description: 'Mounted accessories handed in with bicycle (lights, pedals, computer, saddle bag, cage).',
    isOptional: true
  },
  {
    field: 'udf5',
    legacyField: 'udF5',
    meaning: 'Intake photo reference',
    formControlName: 'udf5',
    expectedFormat: 'string URL or reference ID (null if unsupported; base64 payloads avoided)',
    description: 'Photo URL or attachment identifier. Set to null when backend file storage is not configured.',
    isOptional: true
  },
  {
    field: 'udf6',
    legacyField: 'udF6',
    meaning: 'Bicycle type / technical detail or requested services',
    formControlName: 'udf6',
    expectedFormat: 'string (text)',
    description: 'Catalogue services requested or specific bicycle sub-classification.',
    isOptional: true
  },
  {
    field: 'udf7',
    legacyField: 'udF7',
    meaning: 'Components requiring attention',
    formControlName: 'udf7',
    expectedFormat: 'string (comma-separated list or text)',
    description: 'Specific bicycle parts flagged for inspection/overhaul (brakes, chain, derailleur, headset).',
    isOptional: true
  },
  {
    field: 'udf8',
    legacyField: 'udF8',
    meaning: 'Inspection findings',
    formControlName: 'udf8',
    expectedFormat: 'string (text)',
    description: 'Mechanic diagnostic observations, wear measurements, and workshop notes.',
    isOptional: true
  },
  {
    field: 'udf9',
    legacyField: 'udF9',
    meaning: 'Repair work performed / parts replaced',
    formControlName: 'udf9',
    expectedFormat: 'string (text)',
    description: 'Detailed log of maintenance operations, adjustments, torque checks, and work completed.',
    isOptional: true
  },
  {
    field: 'udf10',
    legacyField: 'udF10',
    meaning: 'Additional work approval and related notes',
    formControlName: 'udf10',
    expectedFormat: 'string (text, e.g. "[Approval: Approved] 1x Shimano Chain")',
    description: 'Customer authorization status, estimate sign-off, parts used, and warranty notes.',
    isOptional: true
  }
] as const;

/**
 * Form values interface for the UDF section
 */
export interface ServiceTicketUdfFormValues {
  // Legacy casing compatibility
  udF1?: string | null;
  udF2?: string | null;
  udF3?: string | number | null;
  udF4?: string | null;
  udF5?: string | null;
  udF6?: string | null;
  udF7?: string | null;
  udF8?: string | null;
  udF9?: string | null;
  udF10?: string | null;
}

/**
 * UDF portion of API request payload
 */
export interface ServiceTicketUdfPayload {
  // C# PascalCase/CamelCase DTO properties
  udF1: string | null;
  udF2: string | null;
  udF3: string | null;
  udF4: string | null;
  udF5: string | null;
  udF6: string | null;
  udF7: string | null;
  udF8: string | null;
  udF9: string | null;
  udF10: string | null;
}

/**
 * Helper function to sanitize a string/numeric value for UDF field:
 * - Trims whitespace
 * - Converts numbers to strings
 * - Replaces empty strings or undefined with null
 */
function sanitizeUdfValue(val: unknown): string | null {
  if (val === null || val === undefined) {
    return null;
  }
  if (typeof val === 'number') {
    return String(val);
  }
  if (typeof val === 'string') {
    const trimmed = val.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  return null;
}

/**
 * Centralized mapping helper:
 * Converts reactive form values into the structured UDF payload for API requests.
 */
export function buildServiceTicketUdfPayload(
  formValues: Partial<ServiceTicketUdfFormValues>
): ServiceTicketUdfPayload {
  const v1 = sanitizeUdfValue(formValues.udF1);
  const v2 = sanitizeUdfValue(formValues.udF2);
  const v3 = sanitizeUdfValue(formValues.udF3);
  const v4 = sanitizeUdfValue(formValues.udF4);
  const v5 = sanitizeUdfValue(formValues.udF5);
  const v6 = sanitizeUdfValue(formValues.udF6);
  const v7 = sanitizeUdfValue(formValues.udF7);
  const v8 = sanitizeUdfValue(formValues.udF8);
  const v9 = sanitizeUdfValue(formValues.udF9);
  const v10 = sanitizeUdfValue(formValues.udF10);

  return {
    udF1: v1,
    udF2: v2,
    udF3: v3,
    udF4: v4,
    udF5: v5,
    udF6: v6,
    udF7: v7,
    udF8: v8,
    udF9: v9,
    udF10: v10
  };
}

/**
 * Helper to extract UDF values from an existing ticket record (for edit form population).
 */
export function extractUdfFromTicket(ticket: Record<string, any> | null | undefined): ServiceTicketUdfFormValues {
  if (!ticket) {
    return {
      udF1: null,
      udF2: null,
      udF3: null,
      udF4: null,
      udF5: null,
      udF6: null,
      udF7: null,
      udF8: null,
      udF9: null,
      udF10: null
    };
  }

  const v1 = ticket['udf1'] ?? ticket['udF1'] ?? null;
  const v2 = ticket['udf2'] ?? ticket['udF2'] ?? null;
  const v3 = ticket['udf3'] ?? ticket['udF3'] ?? null;
  const v4 = ticket['udf4'] ?? ticket['udF4'] ?? null;
  const v5 = ticket['udf5'] ?? ticket['udF5'] ?? null;
  const v6 = ticket['udf6'] ?? ticket['udF6'] ?? null;
  const v7 = ticket['udf7'] ?? ticket['udF7'] ?? null;
  const v8 = ticket['udf8'] ?? ticket['udF8'] ?? null;
  const v9 = ticket['udf9'] ?? ticket['udF9'] ?? null;
  const v10 = ticket['udf10'] ?? ticket['udF10'] ?? null;

  return {
    udF1: v1,
    udF2: v2,
    udF3: v3,
    udF4: v4,
    udF5: v5,
    udF6: v6,
    udF7: v7,
    udF8: v8,
    udF9: v9,
    udF10: v10
  };
}
