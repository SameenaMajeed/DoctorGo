import React from 'react'
import Header from '../../components/User/Home/Header'
import SpecialityMenu from '../../components/User/Home/SpecialityMenu'
import TopDoctors from '../../components/User/Home/TopDoctors'
import Banner from '../../components/User/Home/Banner'
import Navbar from '../../components/User/Home/Navbar'
import Footer from '../../components/User/Home/Footer'

const UserHomePage : React.FC = () => {
  return (
    <div>
      <Navbar/>
      <Header/>
      <SpecialityMenu/>
      <TopDoctors/>
      <Banner/>
      <Footer/>
    </div>
  )
}

export default UserHomePage
