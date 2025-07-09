import React, { useCallback, useState } from "react";
import { 
  blockDoctor, fetchDoctor, approveDoctor,
 } from "../../Api/AdminApis";
import useFetchData from "../../Hooks/useFetchData";
import Loader from "./Loader";
import Pagination from "../../Pagination/Pagination";
import TableActions from "./TableActions";
import DataTable from "./DataTable";
import AdminSidebar from "./Home/AdminSidebar";
import { toast } from "react-hot-toast";
import CancelConfirmationModal from "../CommonComponents/CancelConfirmationModal";

const DoctorList: React.FC = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isBlockedFilter, setIsBlockedFilter] = useState("all");
  const [blockingDoctorId, setBlockingDoctorId] = useState<string | null>(null);
  const [showBlocking, setShowBlocking] = useState(false);
  const limit = 6;

  const fetchDoctorCallback = useCallback(
    () => fetchDoctor(page, limit, searchTerm, isBlockedFilter),
    [page, limit, searchTerm, isBlockedFilter]
  );

  const { data, loading, error, refetch } = useFetchData(fetchDoctorCallback);

  const doctors = data?.doctors || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const handleBlockedDoctors = async (doctorId: string, _isBlocked: boolean) => {
    setBlockingDoctorId(doctorId);
    setShowBlocking(true);
  }

  const confirmBlockUser = async () => {
    if (!blockingDoctorId) return;

    const action = doctors.find((u :any) => u._id === blockingDoctorId)?.isBlocked
    ? "Unblock"
    : "Block";

    // const action = isBlocked ? "Block" : "Unblock";
    const toastId = toast.loading(`Are you sure you want to ${action.toLowerCase()} this doctor?`);

      try {
        await blockDoctor(blockingDoctorId, !doctors.find((u : any) => u._id === blockingDoctorId)?.isBlocked);
      toast.success(`Doctor has been ${action.toLowerCase()}ed successfully.`, { id: toastId });
        refetch();
      } catch (err) {
        console.error("Error blocking/unblocking doctor:", err);
        toast.error("Something went wrong. Please try again.");
      }
      finally {
        setShowBlocking(false);
        setBlockingDoctorId(null);
      }
    }
  

  const handleApproveDoctor = async (doctorId: string) => {
    if (window.confirm("Do you really want to approve this doctor?")) {
      try {
        await approveDoctor(doctorId);
        toast.success("Doctor has been approved successfully.");
        refetch();
      } catch (err) {
        console.error("Error approving doctor:", err);
        toast.error("Something went wrong. Please try again.");
      }
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.trimStart());
    setPage(1);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setIsBlockedFilter(e.target.value);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleCloseModal = () => {
    setShowBlocking(false);
    setBlockingDoctorId(null);
  };


  if (loading) return <Loader />;
  if (error)
    return (
      <div className="text-red-500 text-center font-medium mt-8">
        Error: {error}
      </div>
    );

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64">
        <AdminSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            Doctors List
          </h2>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <input
              type="text"
              placeholder="Search by name or email"
              value={searchTerm}
              onChange={handleSearchChange}
              className="border border-gray-300 p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-80"
            />
            <select
              value={isBlockedFilter}
              onChange={handleFilterChange}
              className="border border-gray-300 p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-48"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <DataTable
              columns={["name", "email", "verificationStatus"]}
              data={doctors}
              actions={(doctor) => (
                <TableActions
                  onBlock={() => handleBlockedDoctors(doctor._id, !doctor.isBlocked)}
                  isBlocked={doctor.isBlocked}
                  onApprove={() => handleApproveDoctor(doctor._id)}
                  verificationStatus={doctor.verificationStatus}
                />
              )}
            />
          </div>

          <CancelConfirmationModal
            isOpen={showBlocking}
            onConfirm={confirmBlockUser}
            onClose={handleCloseModal}
            message={`Are you sure you want to ${
              doctors.find((u:any) => u._id === blockingDoctorId)?.isBlocked ? "unblock" : "block"
            } this doctor?`}
          />

          {/* Pagination */}
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

export default DoctorList;
