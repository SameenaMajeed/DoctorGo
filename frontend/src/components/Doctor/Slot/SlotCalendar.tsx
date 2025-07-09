// import React, { useState } from 'react';
// import Calendar from 'react-calendar';
// import type { MouseEvent } from 'react';
// import 'react-calendar/dist/Calendar.css';

// type ValuePiece = Date | null;
// type Value = ValuePiece | [ValuePiece, ValuePiece];

// const SlotCalendar: React.FC = () => {
//   const [date, setDate] = useState<Date>(new Date());
//   // const [slots, setSlots] = useState([]);

//   // const fetchSlots = (date: Date) => {
//   //   // API call to fetch slots for selected date
//   // };

//   const handleDateChange = (
//     value: Value,
//     event: MouseEvent<HTMLButtonElement>
//   ) => {
//     if (value instanceof Date) {
//       setDate(value);
//       fetchSlots(value);
//     }
//   };

//   return (
//     <div className="p-4">
//       <h2 className="text-2xl font-bold mb-6">Slot Calendar</h2>
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <div>
//           <Calendar
//             onChange={handleDateChange}
//             value={date}
//             className="w-full"
//           />
//         </div>
//         <div className="border p-4 rounded">
//           <h3 className="text-xl mb-4">Slots for {date.toDateString()}</h3>
//           {/* Render slots for selected date */}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SlotCalendar;