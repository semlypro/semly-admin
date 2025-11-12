/**
 * GST (Goods and Services Tax) Utility Functions for India
 * 
 * This module provides utilities for calculating and managing GST for Razorpay invoices.
 * It handles:
 * - CGST/SGST (for intrastate transactions)
 * - IGST (for interstate transactions)
 * - GST validation and formatting
 * - HSN/SAC code management
 */

// Indian state codes and their GST state codes
export const INDIAN_STATES = {
  'AP': { name: 'Andhra Pradesh', gstCode: '37' },
  'AR': { name: 'Arunachal Pradesh', gstCode: '12' },
  'AS': { name: 'Assam', gstCode: '18' },
  'BR': { name: 'Bihar', gstCode: '10' },
  'CG': { name: 'Chhattisgarh', gstCode: '22' },
  'GA': { name: 'Goa', gstCode: '30' },
  'GJ': { name: 'Gujarat', gstCode: '24' },
  'HR': { name: 'Haryana', gstCode: '06' },
  'HP': { name: 'Himachal Pradesh', gstCode: '02' },
  'JK': { name: 'Jammu and Kashmir', gstCode: '01' },
  'JH': { name: 'Jharkhand', gstCode: '20' },
  'KA': { name: 'Karnataka', gstCode: '29' },
  'KL': { name: 'Kerala', gstCode: '32' },
  'MP': { name: 'Madhya Pradesh', gstCode: '23' },
  'MH': { name: 'Maharashtra', gstCode: '27' },
  'MN': { name: 'Manipur', gstCode: '14' },
  'ML': { name: 'Meghalaya', gstCode: '17' },
  'MZ': { name: 'Mizoram', gstCode: '15' },
  'NL': { name: 'Nagaland', gstCode: '13' },
  'OD': { name: 'Odisha', gstCode: '21' },
  'PB': { name: 'Punjab', gstCode: '03' },
  'RJ': { name: 'Rajasthan', gstCode: '08' },
  'SK': { name: 'Sikkim', gstCode: '11' },
  'TN': { name: 'Tamil Nadu', gstCode: '33' },
  'TG': { name: 'Telangana', gstCode: '36' },
  'TR': { name: 'Tripura', gstCode: '16' },
  'UP': { name: 'Uttar Pradesh', gstCode: '09' },
  'UK': { name: 'Uttarakhand', gstCode: '05' },
  'WB': { name: 'West Bengal', gstCode: '19' },
  'AN': { name: 'Andaman and Nicobar Islands', gstCode: '35' },
  'CH': { name: 'Chandigarh', gstCode: '04' },
  'DH': { name: 'Dadra and Nagar Haveli and Daman and Diu', gstCode: '26' },
  'DL': { name: 'Delhi', gstCode: '07' },
  'LD': { name: 'Lakshadweep', gstCode: '31' },
  'PY': { name: 'Puducherry', gstCode: '34' },
  'LA': { name: 'Ladakh', gstCode: '38' },
} as const;

// Common HSN/SAC codes
export const SERVICE_CODES = {
  SAAS: '998314', // Information technology software services
  IT_CONSULTING: '998313', // Information technology consulting services
  WEB_HOSTING: '997212', // Online information and database access or retrieval services
  CLOUD_SERVICES: '997331', // Cloud services
  SOFTWARE_DEVELOPMENT: '998311', // Software design and development services
  DATA_PROCESSING: '998312', // Data processing services
} as const;

// Standard GST rates in India
export const GST_RATES = {
  SAAS: 18, // 18% for SaaS services
  STANDARD: 18,
  REDUCED: 12,
  SUPER_REDUCED: 5,
  ZERO: 0,
} as const;

export interface GSTCalculationInput {
  amountCents: number; // Amount in cents (paise)
  gstRate: number; // GST rate as percentage (e.g., 18)
  merchantState: string; // Merchant's state code (e.g., 'KA')
  customerState: string; // Customer's state code (e.g., 'MH')
  isTaxInclusive: boolean; // Whether the amount already includes GST
}

export interface GSTCalculationResult {
  baseAmountCents: number; // Amount before GST
  cgstAmountCents: number; // Central GST (intrastate only)
  sgstAmountCents: number; // State GST (intrastate only)
  igstAmountCents: number; // Integrated GST (interstate only)
  totalGstCents: number; // Total GST amount
  totalAmountCents: number; // Total amount including GST
  taxType: 'CGST_SGST' | 'IGST';
  cgstRate: number; // CGST rate percentage
  sgstRate: number; // SGST rate percentage
  igstRate: number; // IGST rate percentage
}

/**
 * Calculate GST breakdown for an invoice
 * 
 * For intrastate transactions (same state): CGST + SGST (each is half of total GST rate)
 * For interstate transactions (different states): IGST (full GST rate)
 * 
 * @param input - GST calculation parameters
 * @returns Detailed GST breakdown
 */
export function calculateGST(input: GSTCalculationInput): GSTCalculationResult {
  const { amountCents, gstRate, merchantState, customerState, isTaxInclusive } = input;

  // Determine if intrastate or interstate
  const isIntrastate = merchantState === customerState;
  const taxType = isIntrastate ? 'CGST_SGST' : 'IGST';

  let baseAmountCents: number;
  let totalGstCents: number;
  let totalAmountCents: number;

  if (isTaxInclusive) {
    // Amount includes GST - need to extract base amount
    // Formula: Base = Total / (1 + GST%)
    totalAmountCents = amountCents;
    baseAmountCents = Math.round(amountCents / (1 + gstRate / 100));
    totalGstCents = totalAmountCents - baseAmountCents;
  } else {
    // Amount is before GST - need to add GST
    // Formula: GST = Base × GST%
    baseAmountCents = amountCents;
    totalGstCents = Math.round(baseAmountCents * (gstRate / 100));
    totalAmountCents = baseAmountCents + totalGstCents;
  }

  // Split GST based on transaction type
  let cgstAmountCents = 0;
  let sgstAmountCents = 0;
  let igstAmountCents = 0;
  let cgstRate = 0;
  let sgstRate = 0;
  let igstRate = 0;

  if (isIntrastate) {
    // Split GST equally between CGST and SGST
    cgstRate = gstRate / 2;
    sgstRate = gstRate / 2;
    cgstAmountCents = Math.round(totalGstCents / 2);
    sgstAmountCents = totalGstCents - cgstAmountCents; // Ensure total adds up
  } else {
    // All GST goes to IGST
    igstRate = gstRate;
    igstAmountCents = totalGstCents;
  }

  return {
    baseAmountCents,
    cgstAmountCents,
    sgstAmountCents,
    igstAmountCents,
    totalGstCents,
    totalAmountCents,
    taxType,
    cgstRate,
    sgstRate,
    igstRate,
  };
}

/**
 * Validate GSTIN format
 * 
 * GSTIN format: 22AAAAA0000A1Z5
 * - First 2 chars: State code
 * - Next 10 chars: PAN
 * - 13th char: Entity number
 * - 14th char: 'Z' by default
 * - 15th char: Check digit
 */
export function validateGSTIN(gstin: string): boolean {
  if (!gstin || gstin.length !== 15) {
    return false;
  }

  // Check format: 2 digits + 10 alphanumeric + 1 digit + 1 alpha + 1 alphanumeric
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstinRegex.test(gstin);
}

/**
 * Extract state code from GSTIN
 */
export function getStateCodeFromGSTIN(gstin: string): string | null {
  if (!validateGSTIN(gstin)) {
    return null;
  }
  return gstin.substring(0, 2);
}

/**
 * Format amount in paise to rupees
 */
export function formatAmountINR(amountCents: number): string {
  const rupees = amountCents / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(rupees);
}

/**
 * Format GSTIN with proper spacing
 */
export function formatGSTIN(gstin: string): string {
  if (gstin.length !== 15) {
    return gstin;
  }
  // Format: 22 AAAAA 0000 A 1 Z 5
  return `${gstin.substring(0, 2)} ${gstin.substring(2, 7)} ${gstin.substring(7, 11)} ${gstin.substring(11, 12)} ${gstin.substring(12, 13)} ${gstin.substring(13, 14)} ${gstin.substring(14, 15)}`;
}

/**
 * Get default SAC code for subscription service
 */
export function getDefaultSACCode(): string {
  return SERVICE_CODES.SAAS; // 998314 for SaaS
}

/**
 * Get default GST rate for subscription service
 */
export function getDefaultGSTRate(): number {
  return GST_RATES.SAAS; // 18% for SaaS
}

/**
 * Check if customer needs to be charged GST
 * (All customers in India need to be charged GST)
 */
export function shouldChargeGST(customerCountry: string): boolean {
  return customerCountry === 'IN' || customerCountry === 'India';
}

/**
 * Determine customer type from GSTIN
 */
export function getCustomerType(gstin?: string | null): 'B2B' | 'B2C' {
  return gstin && validateGSTIN(gstin) ? 'B2B' : 'B2C';
}

/**
 * Build Razorpay invoice line item with GST
 */
export interface RazorpayInvoiceLineItem {
  name: string;
  description: string;
  amount: number; // Amount in paise (cents)
  currency: string;
  quantity: number;
  hsn_code?: string;
  sac_code?: string;
  tax_rate: number; // GST rate in percentage
  tax_inclusive?: boolean; // Whether amount includes tax
  tax_group_id?: string; // Razorpay tax group ID
}

export function buildRazorpayLineItem(
  planName: string,
  amountCents: number,
  gstRate: number,
  isTaxInclusive: boolean = false
): RazorpayInvoiceLineItem {
  return {
    name: planName,
    description: `${planName} subscription`,
    amount: amountCents,
    currency: 'INR',
    quantity: 1,
    sac_code: getDefaultSACCode(),
    tax_rate: gstRate * 100, // Razorpay expects rate in basis points (18% = 1800)
    tax_inclusive: isTaxInclusive,
  };
}

/**
 * Build customer address for Razorpay invoice
 */
export interface RazorpayCustomerAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zipcode: string;
  country: string;
}

export function buildCustomerAddress(
  addressLine1: string,
  city: string,
  state: string,
  pincode: string,
  addressLine2?: string
): RazorpayCustomerAddress {
  return {
    line1: addressLine1,
    ...(addressLine2 && { line2: addressLine2 }),
    city,
    state,
    zipcode: pincode,
    country: 'IN',
  };
}

/**
 * Calculate reverse GST (from inclusive amount to base amount)
 */
export function reverseGST(totalAmountCents: number, gstRate: number): {
  baseAmount: number;
  gstAmount: number;
} {
  const baseAmount = Math.round(totalAmountCents / (1 + gstRate / 100));
  const gstAmount = totalAmountCents - baseAmount;
  
  return { baseAmount, gstAmount };
}

/**
 * Check if e-invoicing is required
 * E-invoicing is mandatory for businesses with turnover > 5 crore
 */
export function isEInvoicingRequired(annualTurnoverCrores: number): boolean {
  return annualTurnoverCrores > 5;
}

/**
 * Get GST rate description
 */
export function getGSTRateDescription(gstRate: number): string {
  switch (gstRate) {
    case 0:
      return 'Zero-rated';
    case 5:
      return 'Super reduced rate (5%)';
    case 12:
      return 'Reduced rate (12%)';
    case 18:
      return 'Standard rate (18%)';
    case 28:
      return 'Higher rate (28%)';
    default:
      return `${gstRate}% GST`;
  }
}







