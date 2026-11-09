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

## 2. Other party information

Shown between Property and Pricing. Stored as columns on the transaction for now (a shared contacts table can come later if retyping the same title companies and lenders gets tedious).

| Field | Tag | Slice |
|---|---|---|
| Other agent: name, license #, company, email | Both | A2 |
| Other side of the deal (seller when her client buys, buyer when her client sells): name, phone, email | Both | A2 |
| Lender info: name, email, phone | Buyer | A2 |
| Title company (name) | Both | A2 |
| Title company chosen by: buyer / seller | Both | A2 |
| Earnest money held by: myself / the other agent / title company | Both | A2 |

## 3. Property

| Field | Tag | Slice |
|---|---|---|
| Street address, township, county, zip code | Both | A |
| Parcel ID | Both | A |
| Legal description | Both | A |
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
| Items included, as checkboxes (empty unless checked): refrigerator, dishwasher, microwave, oven (gas/electric), water heater (gas/electric), furnace (gas/electric), water softener (owned/rented), plus an "other items" text box | Both | A2 |
| Items excluded (text box) | Both | A2 |

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

- **A:** Sections 3 and 4 (every field is a column on the transaction). (Done)
- **B:** Remaining key dates (done; migration 005, `datetime` field type for offer expiration).
- **A2:** Other party information, items included/excluded, status dropped (migration 004).
- **C:** (Merged into A2. A shared contacts table is optional later.)
- **D:** Document tracker statuses.
- **E:** Multiple people per client, buying preferences, anniversary reminder.

## Decisions

- "Party responsible for paying commission" and "who pays warranty" are tagged Both and use the draft options (seller / buyer / split / other). Revisit if she doesn't need them.
- The zip code is enough to identify the address, so there is no separate city or state field.
- No transaction status field. She doesn't need one for now.
- Notes is a plain text box with no label or hint text.
- The client's name field is just "Name" (not "full legal name").
- "Date of contract creation" means the purchase agreement's creation date.
- HOA due date only shows when HOA is yes.
- Offer expiration time is optional and stored as local (Indiana) clock time with no time zone.
