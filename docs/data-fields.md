# CRM data fields: final list

**Status:** Final list agreed with the client. Building in slices (see the bottom of this file).

**Tags:** Buyer = only relevant when she represents the buyer. Seller = only when she represents the seller. Both = applies either way. These tags drive which fields the form shows.

## 1. Client information (people)

| Field | Tag | Slice |
|---|---|---|
| Name, email, phone | Both | First form (done) |
| More than one person per client, with add/edit/delete | Both | E |
| Buying preferences (bed/bath, size, style, garage, etc.) | Buyer | E |
| "Buying anniversary" reminder (calculated from closing date) | Buyer | E |

## 2. Other parties

| Field | Tag | Slice |
|---|---|---|
| Other agent: name, license #, company, email | Both | C |
| Other side of the deal (buyer or seller): name, email, phone, address | Both | C |
| Lender info: name, email, phone | Buyer | C |
| Title company | Both | C |
| Title company chooser | Both | C |
| Earnest money holder | Both | C |

## 3. Property

| Field | Tag | Slice |
|---|---|---|
| Street address, township, county, zip code | Both | A |
| Parcel ID | Both | A |
| Legal description | Both | A |
| Items included (appliances, etc.) | Both | A |
| MLS # and BLC # | Both | A |
| Year built | Seller | A |
| Total square feet | Seller | A |
| Annual tax | Seller | A |
| Lockbox type (Century lock or combination) | Seller | A |
| HOA yes/no | Seller | A |
| Bylaws on hand yes/no (shown only if HOA is yes) | Seller | A |

## 4. Transaction information

| Field | Tag | Slice |
|---|---|---|
| List price | Both | A |
| Sale price | Both | A |
| Seller concessions (percentage or amount) | Both | A |
| Commission rate: seller and buyer | Both | A |
| Commission amounts (calculated: rate × sale price, display only) | Both | A |
| Party responsible for paying commission | Both | A |
| Earnest money amount | Both | A |
| Payment method: cash / new mortgage (conventional, insured conventional, FHA, VA, USDA) / assumption / conditional sales contract / other | Buyer | A |
| Home warranty yes/no | Both | A |
| Who pays warranty (shown only if warranty is yes) | Both | A |
| Home insurance yes/no | Buyer | A |
| Selling home as-is yes/no | Seller | A |
| Possession: pre / at / post | Both | A |
| Survey waived yes/no | Both | A |
| Referral yes/no | Both | A |

## 5. Key dates (each becomes a calendar entry)

| Field | Tag | Slice |
|---|---|---|
| Earnest money due, initial inspection due, closing date | Both | First form (done) |
| Buyer's exclusive agency agreement: end date | Buyer | First form (done) |
| Listing contract: expires (very important: going past means redoing everything) | Seller | First form (done) |
| Date of contract creation | Both | B |
| Buyer's exclusive agency agreement: start date | Buyer | B |
| Listing contract: created | Seller | B |
| Listing date | Seller | B |
| Pending date | Both | B |
| Offer expiration (date and time, not necessarily midnight) | Both | B |
| HOA due date | Seller | B |
| Buying anniversary (calculated from closing date) | Buyer | E |

## 6. Document tracker (status for now, file storage comes later)

| Field | Tag | Slice |
|---|---|---|
| Buyer's exclusive agency agreement stored | Buyer | D |
| Listing contract | Seller | D |
| Seller's disclosure: signed, signed copy on file | Seller | D |
| Lead-based paint disclosure: signed, signed copy on file | Seller | D |
| Disclosure of interests | Seller | D |
| HOA bylaws on hand | Seller | D |
| Purchase agreement | Both | D |

## 7. Notes

| Field | Tag | Slice |
|---|---|---|
| General catch-all notes per transaction | Both | First form (done) |

## Build slices

- **A:** Sections 3 and 4 (every field is a column on the transaction).
- **B:** Remaining key dates (config entries plus a date-and-time field for offer expiration).
- **C:** Other parties (new contacts table with roles).
- **D:** Document tracker statuses.
- **E:** Multiple people per client, buying preferences, anniversary reminder.

## Decisions

- "Party responsible for paying commission" and "who pays warranty" are tagged Both and use the draft options (seller / buyer / split / other). Revisit if she doesn't need them.
- The zip code is enough to identify the address, so there is no separate city or state field.
