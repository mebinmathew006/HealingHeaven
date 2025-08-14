import axiosInstance from "../axiosconfig";

export const getWalletBalanceRoute = async (userId) => {
  const response = await axiosInstance.get(
    `/payments/get_wallet_balance/${userId}`
  );
  return response.data.balance;
};
export const getWalletDetailsRoute = async (userId, page, limit) => {
  const response = await axiosInstance.get(
    `/payments/get_wallet_details_with_transactions/${userId}?page=${page}&limit=${limit}`
  );
  return response;
};
export const fetchMoneyFromWalletRoute = async (userId, walletData) => {
  const response = await axiosInstance.post(
    `/payments/fetch_money_from_wallet`,
    { user_id: userId, psychologist_id: 1, psychologist_fee: walletData }
  );
  return response;
};
export const createRazorpayOrderRoute = async (userId, finalTotal) => {
  const response = await axiosInstance.post("/payments/create_razorpay_order", {
    user_id: userId,
    totalAmount: finalTotal,
  });
  return response;
};
export const addMoneyToWalletFromRazorpayRoute = async (userId, finalTotal) => {
  const response = await axiosInstance.post(
    "/payments/add_money_to_wallet_from_razorpay",
    {
      user_id: userId,
      totalAmount: finalTotal,
    }
  );
  return response;
};
