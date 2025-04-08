import { Navigate , Outlet } from "react-router-dom";
import { useSelector} from "react-redux";
import { RootState } from "../../slice/Store/Store";
import React from "react";

const AdminProtected : React.FC = () => {
    const admin = useSelector((state : RootState) => state.admin);

    return admin.email ? <Outlet /> : <Navigate to={'/admin/login'} />
}

export default AdminProtected