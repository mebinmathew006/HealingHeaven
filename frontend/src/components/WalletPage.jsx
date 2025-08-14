import React, { useState, useEffect, useRef } from "react";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  Plus,
  Minus,
} from "lucide-react";

import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Pagination from "./Pagination";
import { addMoneyToWalletFromRazorpayRoute, createRazorpayOrderRoute, fetchMoneyFromWalletRoute, getWalletDetailsRoute } from "../services/paymentService";

const WalletPage = () => {
  const [loading, setLoading] = useState(false);
  const [responseData, setResponseData] = useState({});
  const [walletData, setWalletData] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
  const userId = useSelector((state) => state.userDetails.id);
  const scrollRef = useRef(null);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const totalCount = responseData?.count || 0;
  const limit = 3;
  const hasNext = !!responseData?.next;
  const hasPrevious = !!responseData?.previous;
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchWallet(page);
  };

  const handleNextPage = () => {
    if (hasNext) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchWallet(nextPage);
    }
  };

  const handlePreviousPage = () => {
    if (hasPrevious) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      fetchWallet(prevPage);
    }
  };

  const fetchWallet = async (page = 1) => {
    try {
      setLoadingMore(page !== 1);
      setLoading(page === 1);
      const response = await getWalletDetailsRoute(userId,page,limit);
      setResponseData(response.data)
      setWalletData(response.data.results[0].balance);
      setTransactions(response.data.results[0].wallet_transactions)
      setError(null);
    } catch (err) {
      setError("Failed to fetch wallet transactions");
      console.error("Error fetching transactions:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const HandleWithdraw = async () => {
    try {
      const result = await Swal.fire({
        title: "Withdraw ?",
        text: "Are you sure you want to withdraw all amount from Wallet ?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, withdraw",
        cancelButtonText: "Cancel",
      });

      if (!result.isConfirmed) return;
      await fetchMoneyFromWalletRoute(userId,walletData)
      
      toast.success("Money Withdrawn successfully", {
        position: "bottom-center",
      });
      fetchWallet();
    } catch (error) {
      console.log(error);
    }
  };
  const HandlePayment = async (finalTotal) => {
    try {
      const razorpayOrderResponse = await createRazorpayOrderRoute(userId,finalTotal);
      const { razorpay_order_id, currency, amount } =
        razorpayOrderResponse.data;
      const options = {
        key: keyId,
        amount: amount * 100,
        currency,
        name: "Healing Heaven",
        description: "Consultation Fee",
        order_id: razorpay_order_id,
        handler: async (response) => {
          try {
            const paymentResponse = await addMoneyToWalletFromRazorpayRoute(userId,finalTotal)
            if (paymentResponse.status === 201) {
              toast.success("Payment Successful! Money Added.", {
                position: "bottom-center",
              });
              fetchWallet();
            }
          } catch (paymentError) {
            console.log(paymentError);

            toast.error("Failed to Add Money", { position: "bottom-center" });
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            // Only show message and navigate if it was a cancellation, not a failure
            // We can check this by looking at a flag we'll set in payment.failed
            if (!window.paymentFailedFlag) {
              setLoading(false);
              toast.info("Payment cancelled.", {
                position: "bottom-center",
              });
            }
            // Reset the flag
            window.paymentFailedFlag = false;
          },
          confirm_close: true,
          escape: true,
          animation: true,
        },
        retry: {
          enabled: false,
        },
        prefill: {
          name: "Guest",
          email: "customercare@healingHaven",
          contact: "7356332693",
        },
        theme: {
          color: "#3399cc",
        },
      };
      const rzp = new Razorpay(options);
      rzp.open();
    } catch (error) {
      setLoading(false);

      toast.error("Failed to initialize payment. Please try again.", {
        position: "bottom-center",
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
    const el = scrollRef.current;

    const onWheel = (e) => {
      const atTop = el.scrollTop === 0;
      const atBottom = el.scrollHeight - el.scrollTop === el.clientHeight;

      if ((e.deltaY < 0 && atTop) || (e.deltaY > 0 && atBottom)) {
        e.preventDefault();
        // allow scroll to bubble up to parent
        el.parentElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const [filter, setFilter] = useState("all"); // all, credit, debit

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredTransactions = transactions.filter((transaction) => {
    if (filter === "credit") return transaction.transaction_amount > 0;
    if (filter === "debit") return transaction.transaction_amount < 0;
    return true;
  });

  const getTransactionIcon = (amount) => {
    return amount > 0 ? (
      <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full">
        <ArrowDownLeft className="w-5 h-5 text-green-600" />
      </div>
    ) : (
      <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full">
        <ArrowUpRight className="w-5 h-5 text-red-600" />
      </div>
    );
  };

  return (
    <div>
      {/* Main Content */}
      <div
        className="flex-1 bg-gradient-to-br from-green-50 to-indigo-100 p-6 overflow-auto "
        ref={scrollRef}
      >
        <button
          className="text-sm font-medium text-green-600 hover:cursor-pointer"
          onClick={() => navigate(-1)}
        >
          Back
        </button>
        <div className="">
          {/* Balance Card */}
          <div className="bg-gradient-to-r from-green-700 to-green-900 rounded-2xl shadow-xl p-8 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Wallet className="w-8 h-8 mr-3" />
                    <h2 className="text-xl font-semibold">Current Balance</h2>
                  </div>
                </div>

                <div className="text-4xl font-bold mb-2">
                  {formatCurrency(walletData)}
                </div>
                <p className="text-green-100">Available to spend</p>
              </div>

              <button
                className="gap-12 text-base font-bold bg-white bg-opacity-20 rounded-lg p-2 text-indigo-900 mb-1 hover:cursor-pointer"
                onClick={() => HandlePayment(500)}
              >
                Add 500
              </button>
              <button
                className="text-base font-bold bg-white bg-opacity-20 rounded-lg p-2 text-indigo-900 mb-1 hover:cursor-pointer"
                onClick={() => HandlePayment(1000)}
              >
                Add 1000
              </button>
              {walletData > 0 && (
                <button
                  className="text-base font-bold bg-blue-300 hover:bg-blue-400 bg-opacity-20 rounded-lg p-2 text-white-900 mb-1 hover:cursor-pointer"
                  onClick={() => HandleWithdraw()}
                >
                  Withdraw
                </button>
              )}
            </div>
          </div>

          {/* Transaction History */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Transaction History
                </h3>
              </div>

              {/* Filter Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={() => setFilter("all")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === "all"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  All Transactions
                </button>
                <button
                  onClick={() => setFilter("credit")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === "credit"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Credits
                </button>
                <button
                  onClick={() => setFilter("debit")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === "debit"
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Debits
                </button>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {getTransactionIcon(transaction.transaction_amount)}
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-gray-800">
                              {transaction.transaction_amount > 0
                                ? "Money Added"
                                : "Money Spent"}
                            </p>
                            {transaction.transaction_amount > 0 ? (
                              <Plus className="w-4 h-4 text-green-600" />
                            ) : (
                              <Minus className="w-4 h-4 text-red-600" />
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            {formatDate(transaction.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-lg font-semibold ${
                            transaction.transaction_amount > 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {transaction.transaction_amount > 0 ? "+" : ""}
                          {formatCurrency(
                            Math.abs(transaction.transaction_amount)
                          )}
                        </p>
                        <p className="text-sm text-gray-500">
                          ID: {transaction.id}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <Clock className="w-8 h-8 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-800 mb-2">
                    No transactions found
                  </h4>
                  <p className="text-gray-500">
                    {filter === "credit"
                      ? "No credit transactions to display"
                      : filter === "debit"
                      ? "No debit transactions to display"
                      : "Your transaction history will appear here"}
                  </p>
                </div>
              )}
            </div>
             {totalCount > limit && (
              <Pagination
                currentPage={currentPage}
                totalCount={totalCount}
                limit={limit}
                hasNext={hasNext}
                hasPrevious={hasPrevious}
                loading={loadingMore}
                onPageChange={handlePageChange}
                onNextPage={handleNextPage}
                onPreviousPage={handlePreviousPage}
              />
            )}
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Credits</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(
                      transactions
                        .filter((t) => t.transaction_amount > 0)
                        .reduce((sum, t) => sum + t.transaction_amount, 0)
                    )}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <ArrowDownLeft className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Debits</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(
                      Math.abs(
                        transactions
                          .filter((t) => t.transaction_amount < 0)
                          .reduce((sum, t) => sum + t.transaction_amount, 0)
                      )
                    )}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <ArrowUpRight className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    Total Transactions
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {transactions.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
          
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletPage;
