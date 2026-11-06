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

export type TransactionStatus =
  | 'prospect'
  | 'listed'
  | 'under_contract'
  | 'closed'
  | 'fell_through'

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
  status: TransactionStatus
  acceptance_date: string | null
  created_at: string

  // Property
  property_address: string // street address
  township: string | null
  county: string | null
  zip_code: string | null
  parcel_id: string | null
  legal_description: string | null
  items_included: string | null
  mls_number: string | null
  blc_number: string | null
  year_built: number | null
  square_feet: number | null
  annual_tax: number | null
  lockbox_type: 'century_lock' | 'combination_lock' | null
  has_hoa: boolean | null // null = not answered yet
  hoa_bylaws_on_hand: boolean | null

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

  general_notes: string | null
}

export type KeyDateKind =
  | 'buyer_agency_start'
  | 'buyer_agency_end'
  | 'listing_contract_start'
  | 'listing_contract_expires'
  | 'list_date'
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
