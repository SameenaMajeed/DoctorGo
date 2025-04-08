import React, { useCallback, useState } from "react";
import { fetchUser, blockUser } from "../../Api/AdminApis";
import useFetchData from "../../Hooks/useFetchData";
import Loader from "./Loader";
import DataTable from "./DataTable";
import TableActions from "./TableActions";
import Pagination from "../../Pagination/Pagination";
import AdminSidebar from "./Home/AdminSidebar";
import { toast } from "react-hot-toast";

const UserList: React.FC = () => {
  const [page, setPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isBlockedFilter, setIsBlockedFilter] = useState<string>("all");

  const limit = 4;

  const fetchUserCallback = useCallback(
    () => fetchUser(page, limit, searchTerm, isBlockedFilter),
    [page, limit, searchTerm, isBlockedFilter]
  );

  const { data, loading, error, refetch } = useFetchData(fetchUserCallback);

  const users = data?.users || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const handleBlockUser = async (userId: string, isBlocked: boolean) => {
    const action = isBlocked ? "Block" : "Unblock";
    const confirmAction = window.confirm(`Are you sure you want to ${action.toLowerCase()} this user?`);
    
    if (!confirmAction) return;

    try {
      await blockUser(userId, isBlocked);
      toast.success(`User has been ${action.toLowerCase()}ed successfully.`);
      refetch();
    } catch (err) {
      console.error("Error blocking/unblocking user:", err);
      toast.error("Something went wrong. Please try again.");
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trimStart();
    setSearchTerm(value);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  if (loading) return <Loader />;
  if (error)
    return (
      <div className="text-red-500 text-center mt-8 font-medium">
        Error: {error}
      </div>
    );

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64">
        <AdminSidebar />
      </div>
      <div className="flex-1 p-6">
        <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            User List
          </h2>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full sm:w-80 p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <select
              value={isBlockedFilter}
              onChange={(e) => {
                setIsBlockedFilter(e.target.value);
                setPage(1);
              }}
              className="w-full sm:w-48 p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <DataTable
              columns={["name", "email"]}
              data={users}
              actions={(user) => (
                <TableActions
                  onBlock={() => handleBlockUser(user._id, !user.isBlocked)}
                  isBlocked={user.isBlocked} onApprove={function (): void {
                    throw new Error("Function not implemented.");
                  } } verificationStatus={""}                />
              )}
            />
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserList;
