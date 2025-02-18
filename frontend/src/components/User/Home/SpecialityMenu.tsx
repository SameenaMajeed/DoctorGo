import React from 'react';
import { assets, specialityData } from '../../../assets/assets';
import { Link } from 'react-router-dom';

const SpecialityMenu = () => {
  return (
    <div id='speciality' className='py-12 px-4 bg-white text-center'>
      <h1 className='text-3xl font-bold text-gray-900 mb-4'>Find by Speciality</h1>
      <p className='text-gray-600 text-base mb-8'>
        Simply browse through our extensive list of trusted doctors, schedule your appointment hassle-free.
      </p>
      <div className='flex justify-center gap-8 flex-wrap'>
        {specialityData.map((item, index) => (
          <Link onClick={()=>scrollTo(0,0)}
            key={index} 
            to={`/doctors/${item.speciality}`} 
            className='flex flex-col items-center text-center group'
          >
            <div className='w-24 h-24 rounded-full border-2 border-transparent group-hover:border-blue-500 transition-transform transform group-hover:scale-110 p-2'>
              <img 
                src={item.image} 
                alt={item.speciality} 
                className='w-full h-full object-cover rounded-full'
              />
            </div>
            <p className='text-sm font-medium text-gray-700 mt-2 group-hover:text-blue-500 transition-colors'>
              {item.speciality}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SpecialityMenu;
