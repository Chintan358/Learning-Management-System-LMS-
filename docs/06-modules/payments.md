# Module Specification: Payments & Fee Management
**Document Version:** 1.0  
**Date:** November 25, 2026  
**Author:** Senior Full-Stack Engineer  

---

## 1. Module Purpose & Roles Involved
Handles course tuition order creation, Razorpay checkout, cryptographic signature verification, payment receipts, and fee balance ledgers:
- **Admin:** Views institute-wide transaction ledger, revenue totals, and pending fee balances.
- **Student:** Initiates checkout for enrolled courses, completes payment via Razorpay, downloads payment receipts, and views fee summary.

---

## 2. Database Entities Involved
- `payments` (Receipt number, student ID, course ID, amount, currency, payment method, Razorpay order/payment IDs, status, payment timestamp)
- `enrollments` (Updated to `active` upon verified payment)
- `notifications` (Automated payment confirmation alert)

---

## 3. Implemented REST API Endpoints

| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/v1/payments/create-order` | Generate Razorpay order for course tuition | `student` |
| `POST` | `/api/v1/payments/verify` | Cryptographically verify payment signature & activate enrollment | `student` |
| `GET` | `/api/v1/payments` | List payments (role-filtered for students) | Any Authenticated |
| `GET` | `/api/v1/payments/my-fees` | Cumulative tuition, paid amount, and pending dues | `student` |

---

## 4. Payment Security & Verification Formula
1. **Order Creation:** Amount is converted to currency sub-units (paise: $\text{INR} \times 100$).
2. **Signature Verification:** Server computes the expected HMAC-SHA256 signature using the secret key:
   $$\text{Expected Signature} = \text{HMAC-SHA256}(\text{razorpay\_order\_id} + "|" + \text{razorpay\_payment\_id}, \text{RAZORPAY\_KEY\_SECRET})$$
   Transactions where signatures do not match are aborted with HTTP 400 Bad Request.
3. **Receipt Generation:** Verified transactions generate unique sequential/random receipt numbers (`REC-2026-XXXX`).
