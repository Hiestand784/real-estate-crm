export type ClientKind = 'buyer' | 'seller' | 'both'

export interface Client {
  id: string
  owner_id: string
  full_name: string
  email: string | null
  phone: string | null
  kind: ClientKind
  notes: string | null
  created_at: string
}

export type Side = 'buyer' | 'seller'

export type Fuel = 'included' | 'gas' | 'electric' // 'included' = type not picked
export type Ownership = 'included' | 'owned' | 'rented'

export type PaymentMethod =
  | 'cash'
  | 'new_mortgage'
  | 'assumption'
  | 'conditional_sales_contract'
  | 'other'

export type LoanType = 'conventional' | 'insured_conventional' | 'fha' | 'va' | 'usda'

export interface Transaction {
  id: string
  owner_id: string
  client_id: string
  side: Side
  acceptance_date: string | null
  created_at: string

  // Property
  property_address: string // street address
  township: string | null
  county: string | null
  zip_code: string | null
  parcel_id: string | null
  legal_description: string | null
  mls_number: string | null
  blc_number: string | null
  year_built: number | null
  square_feet: number | null
  annual_tax: number | null
  lockbox_type: 'century_lock' | 'combination_lock' | null
  has_hoa: boolean | null // null = not answered yet
  hoa_bylaws_on_hand: boolean | null

  // Other party information
  other_agent_name: string | null
  other_agent_license: string | null
  other_agent_company: string | null
  other_agent_email: string | null
  other_party_name: string | null // seller if her client buys, buyer if her client sells
  other_party_phone: string | null
  other_party_email: string | null
  lender_name: string | null // buyer side only
  lender_email: string | null
  lender_phone: string | null
  title_company: string | null
  title_company_chosen_by: Side | null
  earnest_money_holder: 'self' | 'other_agent' | 'title_company' | null

  // Pricing and commission
  list_price: number | null
  sale_price: number | null
  seller_concessions_type: 'percent' | 'amount' | null
  seller_concessions_value: number | null
  seller_commission_rate: number | null
  buyer_commission_rate: number | null
  commission_payer: string | null
  earnest_money_amount: number | null

  // Contract terms
  payment_method: PaymentMethod | null
  loan_type: LoanType | null
  home_warranty: boolean | null
  home_warranty_payer: string | null
  home_insurance_in: boolean | null
  sold_as_is: boolean | null
  possession: 'pre' | 'at' | 'post' | null
  survey_waived: boolean | null
  referral: boolean | null
  // Items included: null = box not checked
  incl_refrigerator: true | null
  incl_dishwasher: true | null
  incl_microwave: true | null
  incl_oven: Fuel | null
  incl_water_heater: Fuel | null
  incl_furnace: Fuel | null
  incl_water_softener: Ownership | null
  items_included_other: string | null
  items_excluded: string | null

  general_notes: string | null
}

export type KeyDateKind =
  | 'buyer_agency_start'
  | 'buyer_agency_end'
  | 'listing_contract_start'
  | 'listing_contract_expires'
  | 'list_date'
  | 'purchase_agreement_created'
  | 'pending_date'
  | 'emd_deadline'
  | 'inspection_deadline'
  | 'financing_deadline'
  | 'appraisal_deadline'
  | 'offer_expiration'
  | 'walkthrough'
  | 'closing'
  | 'hoa_due'
  | 'buying_anniversary'
  | 'other'

export interface KeyDate {
  id: string
  owner_id: string
  transaction_id: string
  kind: KeyDateKind
  label: string | null
  due_date: string
  due_time: string | null
  completed_at: string | null
  notes: string | null
  created_at: string
}
