import axios from "axios";

// ----------------------------------------------------------------------------
// Paystack API client. Secret key is server-only, never exposed to frontend.
// ----------------------------------------------------------------------------
export const paystack = axios.create({
  baseURL: "https://api.paystack.co",
  headers: {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    "Content-Type": "application/json",
  },
});