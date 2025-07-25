"use client"

import type React from "react"
import { useEffect, useState } from "react"
import type { Wallet, Transaction } from "../../Types"
import { formatCurrency, formatDate } from "../../Utils/formatters"
import { useSelector } from "react-redux"
import type { RootState } from "../../slice/Store/Store"
// import api from "../../axios/UserInstance"
import { ArrowDownCircle, ArrowUpCircle, Loader, CreditCard, TrendingUp, Clock, Receipt } from "lucide-react"
import Pagination from "../../Pagination/Pagination"
import { createApiInstance } from "../../axios/apiService"

const api = createApiInstance("user");

const WalletPage: React.FC = () => {
  const userId = useSelector((state: RootState) => state.user.user?.id)
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [transactionsPerPage] = useState(5)

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        setLoading(true)
        const response = await api.get("/wallet")
        setWallet(response.data.data)
      } catch (err) {
        console.error(err)
        setError("Failed to load wallet data.")
      } finally {
        setLoading(false)
      }
    }

    if (userId) fetchWallet()
  }, [userId])

  // Pagination logic
  const totalTransactions = wallet?.transactions.length || 0
  const totalPages = Math.ceil(totalTransactions / transactionsPerPage)
  const indexOfLastTransaction = currentPage * transactionsPerPage
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage
  const currentTransactions = wallet?.transactions.slice(indexOfFirstTransaction, indexOfLastTransaction) || []

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-slate-200/60">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                <Loader className="animate-spin text-blue-600" size={32} />
              </div>
              <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping"></div>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold text-slate-800 mb-1">Loading Wallet</h3>
              <p className="text-slate-500">Please wait while we fetch your wallet data...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="text-red-600" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Wallet Error</h3>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="container mx-auto p-6 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <CreditCard className="text-white" size={24} />
            </div>
            My Wallet
          </h1>
          <p className="text-slate-600">Manage your balance and view transaction history</p>
        </div>

        {/* Balance Card */}
        <div className="relative mb-10">
          <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-3xl shadow-2xl p-8 text-white overflow-hidden relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 right-4 w-32 h-32 bg-white rounded-full"></div>
              <div className="absolute bottom-4 left-4 w-24 h-24 bg-white rounded-full"></div>
              <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
            </div>

            <div className="relative z-10 flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="text-blue-200" size={20} />
                  <h2 className="text-lg font-medium text-blue-100">Available Balance</h2>
                </div>
                <p className="text-5xl font-black tracking-tight mb-2">{formatCurrency(wallet?.balance || 0)}</p>
                <div className="flex items-center gap-2 text-blue-200">
                  <Clock size={16} />
                  <span className="text-sm">Last updated: {formatDate(new Date())}</span>
                </div>
              </div>

              <div className="hidden md:flex flex-col items-center">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-2">
                  <CreditCard className="text-white" size={40} />
                </div>
                <span className="text-sm text-blue-200 font-medium">Digital Wallet</span>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-slate-200/60 overflow-hidden">
          <div className="p-8 border-b border-slate-200/60 bg-gradient-to-r from-slate-50/50 to-blue-50/30">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center">
                    <Receipt className="text-slate-600" size={20} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800">Transaction History</h2>
                </div>
                <p className="text-slate-600">Track all your wallet activities</p>
              </div>
              {totalTransactions > 0 && (
                <div className="text-right">
                  <p className="text-sm text-slate-500">
                    Showing {indexOfFirstTransaction + 1}-{Math.min(indexOfLastTransaction, totalTransactions)} of{" "}
                    {totalTransactions} transactions
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="p-8">
            {totalTransactions === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Receipt className="text-slate-400" size={32} />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">No Transactions Yet</h3>
                <p className="text-slate-500 max-w-md mx-auto">
                  Your transaction history will appear here once you start using your wallet
                </p>
              </div>
            ) : (
              <>
                {/* Transactions List */}
                <div className="space-y-4 mb-8">
                  {currentTransactions.map((txn: Transaction) => (
                    <div
                      key={txn._id}
                      className={`group relative rounded-2xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                        txn.type === "credit"
                          ? "border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 hover:border-green-300"
                          : "border-red-200 bg-gradient-to-r from-red-50 to-rose-50 hover:border-red-300"
                      }`}
                    >
                      {/* Side indicator */}
                      <div
                        className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${
                          txn.type === "credit"
                            ? "bg-gradient-to-b from-green-400 to-emerald-500"
                            : "bg-gradient-to-b from-red-400 to-rose-500"
                        }`}
                      ></div>

                      <div className="p-6 pl-8">
                        <div className="flex justify-between items-start">
                          <div className="flex items-start gap-4 flex-1">
                            <div
                              className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${
                                txn.type === "credit"
                                  ? "bg-gradient-to-br from-green-100 to-emerald-100"
                                  : "bg-gradient-to-br from-red-100 to-rose-100"
                              }`}
                            >
                              {txn.type === "credit" ? (
                                <ArrowDownCircle className="text-green-600" size={24} />
                              ) : (
                                <ArrowUpCircle className="text-red-600" size={24} />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-slate-800 text-lg mb-1 group-hover:text-slate-900 transition-colors">
                                {txn.description}
                              </h4>
                              <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                                <Clock size={14} />
                                <span>{formatDate(txn.createdAt)}</span>
                              </div>
                              {txn.booking_id && (
                                <div className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                  <Receipt size={12} />
                                  Booking: {txn.booking_id}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="text-right">
                            <p
                              className={`font-bold text-2xl ${
                                txn.type === "credit" ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {txn.type === "credit" ? "+" : "-"}
                              {formatCurrency(txn.amount)}
                            </p>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                                txn.type === "credit" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                              }`}
                            >
                              {txn.type === "credit" ? "Credit" : "Debit"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination Component */}
                {totalPages > 1 && (
                  <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default WalletPage




// // WalletPage.tsx
// import React, { useEffect, useState } from 'react';

// import { Wallet, Transaction } from '../../Types'
// import { formatCurrency, formatDate } from '../../Utils/formatters';
// import { useSelector } from 'react-redux';
// import { RootState } from '../../slice/Store/Store';
// import api from '../../axios/UserInstance';

// const WalletPage: React.FC = () => {
//   const user = useSelector((state: RootState) => state.user.user?.id);
//   const [wallet, setWallet] = useState<Wallet | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     const fetchWallet = async () => {
//       try {
//         setLoading(true);
//         const response = await api.get('/wallet');
//         console.log(response.data.data)
//         setWallet(response.data.data);
//       } catch (err) {
//         setError('Failed to load wallet data');
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (user) {
//       fetchWallet();
//     }
//   }, [user]);

//   if (loading) return <div>Loading wallet...</div>;
//   if (error) return <div>{error}</div>;

//   return (
//     <div className="container mx-auto p-4">
//       <h1 className="text-2xl font-bold mb-6">My Wallet</h1>
      
//       <div className="bg-white rounded-lg shadow p-6 mb-6">
//         <h2 className="text-xl font-semibold mb-4">Balance</h2>
//         <p className="text-3xl font-bold text-green-600">
//           {formatCurrency(wallet?.balance || 0)}
//         </p>
//       </div>

//       <div className="bg-white rounded-lg shadow p-6">
//         <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
        
//         {wallet?.transactions.length === 0 ? (
//           <p>No transactions yet</p>
//         ) : (
//           <div className="space-y-4">
//             {wallet?.transactions.map((txn: Transaction) => (
//               <div key={txn._id} className="border-b pb-3 last:border-b-0">
//                 <div className="flex justify-between items-center">
//                   <div>
//                     <p className="font-medium">{txn.description}</p>
//                     <p className="text-sm text-gray-500">
//                       {formatDate(txn.createdAt)}
//                     </p>
//                   </div>
//                   <p className={`font-bold ${txn.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
//                     {txn.type === 'credit' ? '+' : '-'}{formatCurrency(txn.amount)}
//                   </p>
//                 </div>
//                 {txn.booking_id && (
//                   <p className="text-sm text-blue-600 mt-1">
//                     Booking ID: {txn.booking_id}
//                   </p>
//                 )}
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default WalletPage;

