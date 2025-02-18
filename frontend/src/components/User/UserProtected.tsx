import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '../../slice/Store/Store'

const UserProtected : React.FC = () => {
    const user = useSelector((state : RootState) =>state.user)

    return user ? <Outlet /> : <Navigate to='/login' />
}

export default UserProtected;