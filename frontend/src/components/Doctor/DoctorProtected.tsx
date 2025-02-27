import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../slice/Store/Store'
import { Navigate, Outlet } from 'react-router-dom';

const DoctorProtected : React.FC= () => {

    const {doctor} = useSelector((state :RootState) => state.doctor);

    return doctor?._id ? <Outlet /> : <Navigate to={'/doctor/login'} />
}

export default DoctorProtected
