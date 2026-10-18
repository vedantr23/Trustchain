import Razorpay from 'razorpay';
import dotenv from 'dotenv';

dotenv.config();

const key_id = process.env.RAZORPAY_KEY_ID || '';
const key_secret = process.env.RAZORPAY_KEY_SECRET || '';

export const isRazorpayConfigured = () => {
  return Boolean(key_id && key_secret && !key_id.includes('your_key_id'));
};

export const getRazorpayInstance = () => {
  if (!isRazorpayConfigured()) {
    return null;
  }
  return new Razorpay({
    key_id,
    key_secret,
  });
};

export const getRazorpayKeyId = () => key_id;
export const getRazorpayKeySecret = () => key_secret;
