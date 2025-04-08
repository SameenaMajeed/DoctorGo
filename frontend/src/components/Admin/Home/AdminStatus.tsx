import React from 'react'

const AdminStatus : React.FC= () => {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-red-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold">Total Savings</h3>
            <p className="text-2xl font-bold mt-2">2,305</p>
          </div>
          <div className="bg-orange-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold">Total Revenue</h3>
            <p className="text-2xl font-bold mt-2">500</p>
          </div>
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold">Patients</h3>
            <p className="text-2xl font-bold mt-2">300</p>
          </div>
          <div className="bg-purple-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold">Top Performance</h3>
            <p className="text-2xl font-bold mt-2">150</p>
          </div>
        </div>
    </div>
  )
}

export default AdminStatus
