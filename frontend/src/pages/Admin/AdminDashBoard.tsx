import React from 'react'
import AdminSidebar from '../../components/Admin/Home/AdminSidebar'
import AdminProfile from '../../components/Admin/Home/AdminProfile'

const AdminDashBoard  : React.FC= () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar/>
      <AdminProfile/>
       {/* Main Content */}
       <div className="ml-64 p-8">
          Welcome to Dashboard
        </div>
      
    </div>
  )
}

export default AdminDashBoard
