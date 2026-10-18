# Trustchain

A platform for transparent and secure charity donations using blockchain-inspired tracking, milestone escrows, and real UPI payment integration.

## Project Structure

- `frontend/web/`: Modern React application (Vite + TypeScript) with instant Razorpay UPI checkout & 80G tax certificate generation.
- `backend/`: Express.js server with Supabase, Razorpay Orders & HMAC cryptographic signature verification.

## Payment & UPI Integration (Razorpay)

Trustchain supports **real UPI payments** (Google Pay, PhonePe, Paytm, BHIM, UPI QR, and UPI Collect), debit/credit cards, and net banking:

1. **Get Razorpay Keys**:
   - Go to [Razorpay Dashboard](https://dashboard.razorpay.com/app/keys)
   - Generate your **Key ID** and **Key Secret** (Use **Test Mode** for testing with mock UPI IDs or **Live Mode** for real bank transactions).
2. **Backend Configuration (`backend/.env`)**:
   ```env
   RAZORPAY_KEY_ID=rzp_test_... (or rzp_live_...)
   RAZORPAY_KEY_SECRET=your_secret_here
   ```
3. **Frontend Configuration (`frontend/web/.env`)**:
   ```env
   VITE_RAZORPAY_KEY_ID=rzp_test_... (or rzp_live_...)
   VITE_API_URL=http://localhost:4000
   ```
4. **How Real UPI Transactions Work**:
   - The donor clicks **Donate** on any campaign.
   - The modal automatically loads the official Razorpay Checkout SDK.
   - The donor selects **UPI / QR**, scans the dynamic QR with any UPI app (GPay / PhonePe / Paytm / BHIM) or enters a UPI ID.
   - Upon payment confirmation, the backend cryptographically verifies the HMAC SHA256 signature, logs the donation to Supabase and the transparency ledger, and issues an official 80G tax receipt PDF with the real Razorpay Transaction ID.

## Setup Instructions

1. **Backend**:
   - Navigate to `backend/`
   - Run `npm install`
   - Set up your `.env` file with Supabase credentials and Razorpay keys (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`).
   - Start the backend: `npm run dev` (runs on `http://localhost:4000`)

2. **Frontend**:
   - Navigate to `frontend/web/`
   - Run `npm install`
   - Configure `frontend/web/.env`
   - Start the web app: `npm run dev`
