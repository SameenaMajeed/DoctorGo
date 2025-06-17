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


import React, { useEffect, useState } from "react";
import { Wallet, Transaction } from "../../Types";
import { formatCurrency, formatDate } from "../../Utils/formatters";
import { useSelector } from "react-redux";
import { RootState } from "../../slice/Store/Store";
import api from "../../axios/UserInstance";
import { ArrowDownCircle, ArrowUpCircle, Loader } from "lucide-react";

const WalletPage: React.FC = () => {
  const userId = useSelector((state: RootState) => state.user.user?.id);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        setLoading(true);
        const response = await api.get("/wallet");
        setWallet(response.data.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load wallet data.");
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchWallet();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin text-gray-500" size={28} />
        <span className="ml-3 text-gray-600 text-lg">Loading wallet...</span>
      </div>
    );
  }

  if (error) return <div className="text-red-600">{error}</div>;

  return (
  <div className="container mx-auto p-4">
    <h1 className="text-3xl font-extrabold mb-6 text-gray-800 flex items-center gap-2">
      <span>💰</span> My Wallet
    </h1>

    {/* Balance Card */}
    <div className="bg-gradient-to-r from-blue-300 via-blue-100 to-white rounded-2xl shadow-xl p-6 mb-10 flex items-center justify-between border border-blue-200">
      <div>
        <h2 className="text-xl font-semibold text-gray-700 mb-1">Current Balance</h2>
        <p className="text-5xl font-black text-blue-700 tracking-wide">
          {formatCurrency(wallet?.balance || 0)}
        </p>
      </div>
      <div className="text-4xl">🪙</div>
    </div>

    {/* Transactions */}
    <div className="bg-white rounded-2xl shadow-md p-6 border">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        📜 Transaction History
      </h2>

      {wallet?.transactions.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <div className="text-4xl mb-2">📭</div>
          <p className="text-lg">No transactions yet</p>
        </div>
      ) : (
        <div className="space-y-5">
          {wallet?.transactions.map((txn: Transaction) => (
            <div
              key={txn._id}
              className={`rounded-xl border-l-4 p-4 transition-all duration-200 hover:scale-[1.01] hover:shadow-md
                ${
                  txn.type === "credit"
                    ? "border-green-500 bg-green-50"
                    : "border-red-500 bg-red-50"
                }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3">
                  {txn.type === "credit" ? (
                    <ArrowDownCircle className="text-green-600 mt-1" size={24} />
                  ) : (
                    <ArrowUpCircle className="text-red-600 mt-1" size={24} />
                  )}
                  <div>
                    <p className="font-semibold text-gray-800">{txn.description}</p>
                    <p className="text-sm text-gray-500">{formatDate(txn.createdAt)}</p>
                    {txn.booking_id && (
                      <p className="text-sm text-blue-600 mt-1">
                        Booking ID: {txn.booking_id}
                      </p>
                    )}
                  </div>
                </div>
                <p
                  className={`font-bold text-lg ${
                    txn.type === "credit" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {txn.type === "credit" ? "+" : "-"}
                  {formatCurrency(txn.amount)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);


//   return (
//     <div className="container mx-auto p-4">
//       <h1 className="text-3xl font-bold mb-6 text-gray-800">💰 My Wallet</h1>

//       {/* Balance Card */}
//       <div className="bg-gradient-to-r from-green-200 via-green-100 to-white rounded-xl shadow-lg p-6 mb-8 flex items-center justify-between">
//         <div>
//           <h2 className="text-lg font-semibold text-gray-700 mb-1">Current Balance</h2>
//           <p className="text-4xl font-bold text-green-700">
//             {formatCurrency(wallet?.balance || 0)}
//           </p>
//         </div>
//     </div>

//       {/* Transactions */}
//       <div className="bg-white rounded-xl shadow-md p-6">
//         <h2 className="text-xl font-semibold text-gray-800 mb-4">Transaction History</h2>

//         {wallet?.transactions.length === 0 ? (
//           <p className="text-gray-500">No transactions yet.</p>
//         ) : (
//           <div className="space-y-4">
//             {wallet?.transactions.map((txn: Transaction) => (
//               <div
//                 key={txn._id}
//                 className="border-b pb-4 last:border-b-0 flex justify-between items-start group"
//               >
//                 <div className="flex items-start gap-3">
//                   {txn.type === "credit" ? (
//                     <ArrowDownCircle className="text-green-600 mt-1" size={22} />
//                   ) : (
//                     <ArrowUpCircle className="text-red-600 mt-1" size={22} />
//                   )}
//                   <div>
//                     <p className="font-medium text-gray-800">{txn.description}</p>
//                     <p className="text-sm text-gray-500">{formatDate(txn.createdAt)}</p>
//                     {txn.booking_id && (
//                       <p className="text-sm text-blue-600 mt-1">
//                         Booking ID: {txn.booking_id}
//                       </p>
//                     )}
//                   </div>
//                 </div>
//                 <p
//                   className={`font-bold text-right ${
//                     txn.type === "credit" ? "text-green-600" : "text-red-600"
//                   }`}
//                 >
//                   {txn.type === "credit" ? "+" : "-"}
//                   {formatCurrency(txn.amount)}
//                 </p>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
};

export default WalletPage;
