import type { KeyDateKind, Side } from '../types/db'

// The form is built from this list. To add a field, add one entry here
// (plus a matching database column for 'column' fields).

export type FieldType =
  | 'text'
  | 'email'
  | 'tel'
  | 'textarea'
  | 'integer'
  | 'money'
  | 'percent'
  | 'date'
  | 'select'
  | 'yesno'
  | 'checkbox' // unchecked = null; with options, checking it reveals a choice (e.g. gas/electric)
  | 'computed'
  | 'heading' // a sub-heading inside a section; never saved

export interface Option {
  value: string
  label: string
}

// Show this field only when another field has a given value
export interface ShowIf {
  key: string
  equals: string
}

export type FormValues = Record<string, string>

export interface FieldDef {
  key: string
  label: string
  type: FieldType
  section: string
  sides: Side[] // which side(s) this field appears for
  // 'column' = a column on transactions, 'key_date' = a row in key_dates,
  // 'none' = display only (calculated, never saved)
  store: 'column' | 'key_date' | 'none'
  kind?: KeyDateKind // required when store is 'key_date'
  required?: boolean
  hideLabel?: boolean // label is still read by screen readers, just not shown
  help?: string
  options?: Option[]
  showIf?: ShowIf
  compute?: (values: FormValues) => string // for type 'computed'
}

const BOTH: Side[] = ['buyer', 'seller']
const BUYER: Side[] = ['buyer']
const SELLER: Side[] = ['seller']

const BLANK: Option = { value: '', label: '—' }

const FUEL_OPTIONS: Option[] = [
  { value: 'gas', label: 'Gas' },
  { value: 'electric', label: 'Electric' },
]

const OWNERSHIP_OPTIONS: Option[] = [
  { value: 'owned', label: 'Owned' },
  { value: 'rented', label: 'Rented' },
]

const CHOSEN_BY_OPTIONS: Option[] = [
  BLANK,
  { value: 'buyer', label: 'Buyer' },
  { value: 'seller', label: 'Seller' },
]

const EM_HOLDER_OPTIONS: Option[] = [
  BLANK,
  { value: 'self', label: 'Myself' },
  { value: 'other_agent', label: 'The other agent' },
  { value: 'title_company', label: 'Title company' },
]

// Draft option list: confirm with her before relying on it.
const PAYER_OPTIONS: Option[] = [
  BLANK,
  { value: 'seller', label: 'Seller' },
  { value: 'buyer', label: 'Buyer' },
  { value: 'split', label: 'Split' },
  { value: 'other', label: 'Other' },
]

const LOCKBOX_OPTIONS: Option[] = [
  BLANK,
  { value: 'century_lock', label: 'Century lock' },
  { value: 'combination_lock', label: 'Combination lock' },
]

const CONCESSION_TYPE_OPTIONS: Option[] = [
  BLANK,
  { value: 'percent', label: 'Percent' },
  { value: 'amount', label: 'Dollar amount' },
]

const PAYMENT_METHOD_OPTIONS: Option[] = [
  BLANK,
  { value: 'cash', label: 'Cash' },
  { value: 'new_mortgage', label: 'New mortgage' },
  { value: 'assumption', label: 'Assumption' },
  { value: 'conditional_sales_contract', label: 'Conditional sales contract' },
  { value: 'other', label: 'Other' },
]

const LOAN_TYPE_OPTIONS: Option[] = [
  BLANK,
  { value: 'conventional', label: 'Conventional' },
  { value: 'insured_conventional', label: 'Insured conventional' },
  { value: 'fha', label: 'FHA' },
  { value: 'va', label: 'VA' },
  { value: 'usda', label: 'USDA' },
]

const POSSESSION_OPTIONS: Option[] = [
  BLANK,
  { value: 'pre', label: 'Before closing (pre)' },
  { value: 'at', label: 'At closing (at)' },
  { value: 'post', label: 'After closing (post)' },
]

// Display only. Money math in floating point can drift by a cent in edge
// cases, which is fine for a preview but is why amounts are never saved.
function commissionAmount(price: string | undefined, rate: string | undefined): string {
  const p = Number(price)
  const r = Number(rate)
  if (!price || !rate || Number.isNaN(p) || Number.isNaN(r)) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
    (p * r) / 100,
  )
}

// Small helpers so each entry below stays one or two lines
function col(
  key: string,
  label: string,
  type: FieldType,
  section: string,
  sides: Side[],
  extra: Partial<FieldDef> = {},
): FieldDef {
  return { key, label, type, section, sides, store: 'column', ...extra }
}

function keyDate(
  kind: KeyDateKind,
  label: string,
  sides: Side[],
  extra: Partial<FieldDef> = {},
): FieldDef {
  return {
    key: kind,
    label,
    type: 'date',
    section: 'Key dates',
    sides,
    store: 'key_date',
    kind,
    ...extra,
  }
}

function heading(key: string, label: string, section: string, sides: Side[]): FieldDef {
  return { key, label, type: 'heading', section, sides, store: 'none' }
}

const PROPERTY = 'Property'
const OTHER = 'Other party information'
const PRICING = 'Pricing and commission'
const TERMS = 'Contract terms'
const NOTES = 'Notes'

export const FIELDS: FieldDef[] = [
  // ---- Property -------------------------------------------------------------
  col('property_address', 'Street address', 'text', PROPERTY, BOTH, { required: true }),
  col('township', 'Township', 'text', PROPERTY, BOTH),
  col('county', 'County', 'text', PROPERTY, BOTH),
  col('zip_code', 'Zip code', 'text', PROPERTY, BOTH),
  col('parcel_id', 'Parcel ID', 'text', PROPERTY, BOTH),
  col('legal_description', 'Legal description', 'textarea', PROPERTY, BOTH),
  col('mls_number', 'MLS #', 'text', PROPERTY, BOTH),
  col('blc_number', 'BLC #', 'text', PROPERTY, BOTH),
  col('year_built', 'Year built', 'integer', PROPERTY, SELLER),
  col('square_feet', 'Total square feet', 'integer', PROPERTY, SELLER),
  col('annual_tax', 'Annual tax', 'money', PROPERTY, SELLER),
  col('lockbox_type', 'Lockbox type', 'select', PROPERTY, SELLER, { options: LOCKBOX_OPTIONS }),
  col('has_hoa', 'HOA', 'yesno', PROPERTY, SELLER),
  col('hoa_bylaws_on_hand', 'HOA bylaws on hand', 'yesno', PROPERTY, SELLER, {
    showIf: { key: 'has_hoa', equals: 'true' },
  }),

  // ---- Other party information ----------------------------------------------------
  heading('other_agent_heading', 'Other agent', OTHER, BOTH),
  col('other_agent_name', 'Name', 'text', OTHER, BOTH),
  col('other_agent_license', 'License #', 'text', OTHER, BOTH),
  col('other_agent_company', 'Company', 'text', OTHER, BOTH),
  col('other_agent_email', 'Email', 'email', OTHER, BOTH),
  // The other side of the deal: the seller when her client buys, and the reverse
  heading('other_party_heading_seller', 'Seller', OTHER, BUYER),
  heading('other_party_heading_buyer', 'Buyer', OTHER, SELLER),
  col('other_party_name', 'Name', 'text', OTHER, BOTH),
  col('other_party_phone', 'Phone', 'tel', OTHER, BOTH),
  col('other_party_email', 'Email', 'email', OTHER, BOTH),
  heading('lender_heading', 'Lender', OTHER, BUYER),
  col('lender_name', 'Name', 'text', OTHER, BUYER),
  col('lender_email', 'Email', 'email', OTHER, BUYER),
  col('lender_phone', 'Phone', 'tel', OTHER, BUYER),
  heading('title_heading', 'Title and earnest money', OTHER, BOTH),
  col('title_company', 'Title company', 'text', OTHER, BOTH),
  col('title_company_chosen_by', 'Title company chosen by', 'select', OTHER, BOTH, {
    options: CHOSEN_BY_OPTIONS,
  }),
  col('earnest_money_holder', 'Earnest money held by', 'select', OTHER, BOTH, {
    options: EM_HOLDER_OPTIONS,
  }),

  // ---- Pricing and commission --------------------------------------------------
  col('list_price', 'List price', 'money', PRICING, BOTH),
  col('sale_price', 'Sale price', 'money', PRICING, BOTH),
  col('seller_concessions_type', 'Seller concessions: type', 'select', PRICING, BOTH, {
    options: CONCESSION_TYPE_OPTIONS,
  }),
  col('seller_concessions_value', 'Seller concessions: value', 'money', PRICING, BOTH, {
    help: 'A percentage or a dollar amount, matching the type above.',
  }),
  col('seller_commission_rate', 'Seller commission rate (%)', 'percent', PRICING, BOTH),
  col('buyer_commission_rate', 'Buyer commission rate (%)', 'percent', PRICING, BOTH),
  {
    key: 'seller_commission_amount',
    label: 'Seller commission amount',
    type: 'computed',
    section: PRICING,
    sides: BOTH,
    store: 'none',
    compute: (v) => commissionAmount(v.sale_price, v.seller_commission_rate),
  },
  {
    key: 'buyer_commission_amount',
    label: 'Buyer commission amount',
    type: 'computed',
    section: PRICING,
    sides: BOTH,
    store: 'none',
    compute: (v) => commissionAmount(v.sale_price, v.buyer_commission_rate),
  },
  col('commission_payer', 'Party responsible for paying commission', 'select', PRICING, BOTH, {
    options: PAYER_OPTIONS,
  }),
  col('earnest_money_amount', 'Earnest money amount', 'money', PRICING, BOTH),

  // ---- Contract terms -------------------------------------------------------------
  col('payment_method', 'Payment method', 'select', TERMS, BUYER, {
    options: PAYMENT_METHOD_OPTIONS,
  }),
  col('loan_type', 'Loan type', 'select', TERMS, BUYER, {
    options: LOAN_TYPE_OPTIONS,
    showIf: { key: 'payment_method', equals: 'new_mortgage' },
  }),
  col('home_warranty', 'Home warranty', 'yesno', TERMS, BOTH),
  col('home_warranty_payer', 'Who pays for the warranty', 'select', TERMS, BOTH, {
    options: PAYER_OPTIONS,
    showIf: { key: 'home_warranty', equals: 'true' },
  }),
  col('home_insurance_in', 'Home insurance in', 'yesno', TERMS, BUYER),
  col('sold_as_is', 'Selling home as-is', 'yesno', TERMS, SELLER),
  col('possession', 'Possession', 'select', TERMS, BOTH, { options: POSSESSION_OPTIONS }),
  col('survey_waived', 'Survey waived', 'yesno', TERMS, BOTH),
  col('referral', 'Referral', 'yesno', TERMS, BOTH),
  heading('items_included_heading', 'Items included', TERMS, BOTH),
  col('incl_refrigerator', 'Refrigerator', 'checkbox', TERMS, BOTH),
  col('incl_dishwasher', 'Dishwasher', 'checkbox', TERMS, BOTH),
  col('incl_microwave', 'Microwave', 'checkbox', TERMS, BOTH),
  col('incl_oven', 'Oven', 'checkbox', TERMS, BOTH, { options: FUEL_OPTIONS }),
  col('incl_water_heater', 'Water heater', 'checkbox', TERMS, BOTH, { options: FUEL_OPTIONS }),
  col('incl_furnace', 'Furnace', 'checkbox', TERMS, BOTH, { options: FUEL_OPTIONS }),
  col('incl_water_softener', 'Water softener', 'checkbox', TERMS, BOTH, {
    options: OWNERSHIP_OPTIONS,
  }),
  col('items_included_other', 'Other items included', 'textarea', TERMS, BOTH),
  col('items_excluded', 'Items excluded', 'textarea', TERMS, BOTH),

  // ---- Key dates (the rest of this section comes in the next slice) -----------------
  keyDate('emd_deadline', 'Earnest money due', BOTH),
  keyDate('inspection_deadline', 'Initial inspection due', BOTH),
  keyDate('closing', 'Closing date', BOTH),
  keyDate('buyer_agency_end', 'Buyer agency agreement ends', BUYER),
  keyDate('listing_contract_expires', 'Listing contract expires', SELLER, {
    help: 'Very important: if this date passes, the listing has to be redone.',
  }),

  // ---- Notes -----------------------------------------------------------------------
  col('general_notes', 'Notes', 'textarea', NOTES, BOTH, { hideLabel: true }),
]
