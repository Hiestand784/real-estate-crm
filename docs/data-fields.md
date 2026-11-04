# CRM data fields: sections and buyer/seller tags

**Status:** Draft from the requirements session.

**Tags:** Buyer = only relevant when she represents the buyer. Seller = only when she represents the seller. Both = applies either way.

**Structure notes**
- All dates live in Section 5 as calendar entries, not as columns on the transaction.
- Section 2 is one contacts list with role labels (other agent, lender, title company, and so on).
- Section 6 is a checklist with a status and a file per item, not one column per document.
- Section 4 and Section 5 are linked to a transaction, and each export file carries the same `transaction_id`.

## 1. Client information (people)

| Field | Tag | Priority |
|---|---|---|
| Full legal name | Both | |
| Email | Both | |
| Phone (best one) | Both | |
| More than one person per client, with add/edit/delete | Both | |
| Buying preferences | Buyer | |
| Past properties looked at | Buyer | |
| Client notes | Both | |
| "Buying anniversary" reminder (calculated from closing date) | Buyer | |

## 2. Other parties (contacts with roles)

| Field | Tag | Priority |
|---|---|---|
| Other agent: name, license #, company, email | Both | |
| Other side of the deal (buyer or seller): name, email, phone, address | Both | |
| Lender: name, email, phone | Buyer | |
| Title company | Both | |
| Title company chooser | Both | |
| Earnest money holder | Both | |

## 3. Property

| Field | Tag | Priority |
|---|---|---|
| Street address, township, county, zip code | Both | |
| Parcel ID | Both | |
| Legal description | Both | |
| Legal ID number (string) | Both | |
| Items included (appliances, etc.) | Both | |
| MLS # and BLC # | Both | |
| Year built | Seller | |
| Total square feet | Seller | |
| Annual tax | Seller | |
| Lockbox type (Century lock or combination) and 4-digit code | Seller | |
| HOA yes/no, bylaws on hand yes/no | Seller | |

## 4. Transaction (terms and money)

| Field | Tag | Priority |
|---|---|---|
| Date of contract creation | Both | |
| List price | Both | |
| Sale price | Both | |
| Seller concessions (percentage or amount) | Both | |
| Commission rate: seller and buyer | Both | |
| Commission amounts (calculated: rate × sale price) | Both | |
| Commission exceptions note box (replaces "who pays") | Both | |
| Earnest money amount | Both | |
| Payment method: cash / new mortgage (conventional, insured conventional, FHA, VA, USDA) / assumption / conditional sales contract / other | Buyer | |
| Home warranty yes/no, and who pays | Both | |
| Home insurance in yes/no | Buyer | |
| Selling home as-is yes/no | Seller | |
| Possession: pre / at / post | Both | |
| Survey waived yes/no | Both | |
| Referral yes/no | Both | |

## 5. Key dates (each becomes a calendar entry)

| Field | Tag | Priority |
|---|---|---|
| Buyer's exclusive agency agreement: start and end date | Buyer | |
| Listing contract: created and expires (very important: going past means redoing everything) | Seller | |
| Listing date | Seller | |
| Pending date | Both | |
| Initial inspection due | Both | |
| Earnest money due | Both | |
| Offer expiration (date and time, not necessarily midnight) | Both | |
| Closing date | Both | |
| HOA due date | Seller | |
| Buying anniversary | Buyer | |

## 6. Document tracker (status plus file)

| Field | Tag | Priority |
|---|---|---|
| Buyer's exclusive agency agreement stored (checkbox) | Buyer | |
| Listing contract | Seller | |
| Seller's disclosure: signed, signed copy on file | Seller | |
| Lead-based paint disclosure: signed, signed copy on file | Seller | |
| Disclosure of interests | Seller | |
| HOA bylaws on hand | Seller | |
| Purchase agreement | Both | |

## 7. Notes

| Field | Tag | Priority |
|---|---|---|
| General notes per transaction (oddities) | Both | |