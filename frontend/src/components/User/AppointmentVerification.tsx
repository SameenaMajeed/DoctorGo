import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "./Home/Navbar";
import Footer from "../CommonComponents/Footer";
import api from "../../axios/UserInstance";
import toast from "react-hot-toast";
import { ISlot } from "../../types/Slot";
import { useSelector } from "react-redux";
import { RootState } from "../../slice/Store/Store";
import { IDoctor } from "../../Types";

const AppointmentVerification: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [appointmentType, setAppointmentType] = useState("online");
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "wallet">(
    "razorpay"
  );

  //wallet balance state
  const [walletBalance, setWalletBalance] = useState(0);
  const [isWalletLoading, setIsWalletLoading] = useState(true);

  const { doctor, selectedSlot } = location.state as {
    doctor: IDoctor;
    selectedSlot: ISlot;
  };

  const userId = useSelector((state: RootState) => state.user?.user?.id);

  const [formData, setFormData] = useState({
    patientName: "",
    contactNumber: "",
    district: "",
    locality: "",
    hospitalNo: "",
  });

  const [errors, setErrors] = useState({
    patientName: "",
    contactNumber: "",
    district: "",
    locality: "",
  });

  // to fetch wallet balance
  useEffect(() => {
    const fetchWalletBalance = async () => {
      try {
        const response = await api.get("/wallet");
        console.log(response)
        setWalletBalance(response.data.data.balance);
        setIsWalletLoading(false);
      } catch (error) {
        console.error("Error fetching wallet balance:", error);
        setIsWalletLoading(false);
      }
    };
    fetchWalletBalance();
  }, []);

  // Calculate fees including platform fee
  const calculateFees = () => {
    const platformFeePercentage = 0.1; // 10% platform fee
    const platformFee = Math.round(doctor.ticketPrice * platformFeePercentage);
    const totalAmount = doctor.ticketPrice + platformFee;

    return {
      doctorFee: doctor.ticketPrice,
      platformFee,
      totalAmount,
      platformFeePercentage: platformFeePercentage * 100, // for display
    };
  };

  const fees = calculateFees();

  const validateForm = () => {
    let newErrors = {
      patientName: "",
      contactNumber: "",
      district: "",
      locality: "",
    };
    let isValid = true;

    if (!formData.patientName.trim()) {
      newErrors.patientName = "Patient name is required.";
      isValid = false;
    }

    if (!formData.contactNumber.match(/^\d{10}$/)) {
      newErrors.contactNumber = "Enter a valid 10-digit contact number.";
      isValid = false;
    }

    if (!formData.district.trim()) {
      newErrors.district = "District is required.";
      isValid = false;
    }

    if (!formData.locality.trim()) {
      newErrors.locality = "Locality is required.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    if (!validateForm()) {
      setIsProcessing(false);
      return;
    }

    if (!selectedSlot) {
      toast.error("Please select a time slot.");
      setIsProcessing(false);
      return;
    }

    try {
      // Check if user already has a booking for this slot
      const bookingCheckResponse = await api.get(
        `/bookings/check?userId=${userId}&slotId=${selectedSlot._id}`
      );
      if (bookingCheckResponse.data.hasBooking) {
        toast.error(
          "You already have an appointment booked for this time slot."
        );
        navigate(-1);
        return;
      }

      if (paymentMethod === "wallet") {
        if (walletBalance < fees.totalAmount) {
          toast.error("Insufficient wallet balance");
          setIsProcessing(false);
          return;
        }

        // Create booking with wallet payment
        const bookingData = {
          doctor_id: doctor._id,
          user_id: userId,
          slot_id: selectedSlot._id,
          modeOfAppointment: appointmentType,
          is_paid: true,
          status: "confirmed",
          paymentMethod: "wallet",
          ticketPrice: doctor.ticketPrice,
          platformFee: fees.platformFee,
          totalAmount: fees.totalAmount,
          paymentBreakdown: {
            doctorFee: doctor.ticketPrice,
            platformFee: fees.platformFee,
          },
          appointmentDate: selectedSlot.date,
          appointmentTime: `${formatTimeString(
            selectedSlot.startTime
          )} - ${formatTimeString(selectedSlot.endTime)}`,
          patientDetails: { ...formData },
        };
        console.log(bookingData)

        const response = await api.post("/bookings/create", bookingData);

        console.log(' response :' , response)

        if (response.data.success) {
          toast.success("Appointment booked successfully using wallet!");
          navigate("/appointment/success");
        } else {
          throw new Error(response.data.message || "Booking failed");
        }
      } else {
        // Existing Razorpay payment flow
        const paymentRequest = {
          amount: fees.totalAmount,
          currency: "INR",
          appointmentData: {
            ...formData,
            doctorId: doctor._id,
            slotId: selectedSlot._id,
          },
        };

        const response = await api.post(
          "/payments/create-order",
          paymentRequest
        );
        if (response.data.success) {
          if (!(window as any).Razorpay) {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.async = true;
            script.onload = () => initializeRazorpay(response.data);
            document.body.appendChild(script);
          } else {
            initializeRazorpay(response.data);
          }
        }
      }

      // const paymentRequest = {
      //   amount: fees.totalAmount, // Include platform fee in total amount
      //   currency: "INR",
      //   appointmentData: {
      //     ...formData,
      //     doctorId: doctor._id,
      //     slotId: selectedSlot._id,
      //   },
      // };

      // console.log("paymentRequest:", paymentRequest);
      // const response = await api.post("/payments/create-order", paymentRequest);

      // if (response.data.success) {
      //   if (!(window as any).Razorpay) {
      //     const script = document.createElement("script");
      //     script.src = "https://checkout.razorpay.com/v1/checkout.js";
      //     script.async = true;
      //     script.onload = () => initializeRazorpay(response.data);
      //     document.body.appendChild(script);
      //   } else {
      //     initializeRazorpay(response.data);
      //   }
      // }
    } catch (error: any) {
      console.error("Payment error:", error);
      setIsProcessing(false);

      if (
        error.response?.data?.message?.includes("already have an appointment")
      ) {
        toast.error(error.response.data.message);
        navigate(-1);
      } else {
        toast.error(error.response?.data?.message || "Payment failed");
      }
    }
  };

  const initializeRazorpay = (responseData: any) => {
    try {
      const { paymentOptions } = responseData.data;

      if (!paymentOptions?.key) {
        throw new Error("Razorpay key not found in response");
      }

      const options = {
        key: paymentOptions.key,
        amount: paymentOptions.amount,
        currency: paymentOptions.currency,
        order_id: paymentOptions.order_id,
        name: paymentOptions.name,
        description: `Appointment for ${responseData.data.appointmentData.patientName}`,
        prefill: {
          name: responseData.data.appointmentData.patientName,
          contact: responseData.data.appointmentData.contactNumber,
          email: "user@example.com",
        },
        theme: {
          color: "#3399cc",
        },
        handler: async (razorpayResponse: any) => {
          try {
            if (razorpayResponse.razorpay_payment_id) {
              // Payment success case
              const bookingData = {
                doctor_id: doctor._id,
                user_id: userId,
                slot_id: selectedSlot._id,
                modeOfAppointment: appointmentType,
                is_paid: true,
                status: "confirmed",
                paymentId: razorpayResponse.razorpay_payment_id,
                paymentMethod: "razorpay",
                ticketPrice: doctor.ticketPrice,
                platformFee: fees.platformFee,
                totalAmount: fees.totalAmount,
                paymentBreakdown: {
                  doctorFee: doctor.ticketPrice,
                  platformFee: fees.platformFee,
                },
                appointmentDate: selectedSlot.date,
                appointmentTime: `${formatTimeString(
                  selectedSlot.startTime
                )} - ${formatTimeString(selectedSlot.endTime)}`,
                patientDetails: { ...formData },
              };

              await api.post("/bookings/create", bookingData);
              toast.success("Payment successful! Appointment booked.");
              navigate("/appointment/success");
            } else {
              // Payment failed case
              const failedBookingData = {
                doctor_id: doctor._id,
                user_id: userId,
                slot_id: selectedSlot._id,
                modeOfAppointment: appointmentType,
                is_paid: false,
                status: "failed",
                paymentMethod: "razorpay",
                ticketPrice: doctor.ticketPrice,
                platformFee: fees.platformFee,
                totalAmount: fees.totalAmount,
                paymentBreakdown: {
                  doctorFee: doctor.ticketPrice,
                  platformFee: fees.platformFee,
                },
                appointmentDate: selectedSlot.date,
                appointmentTime: `${formatTimeString(
                  selectedSlot.startTime
                )} - ${formatTimeString(selectedSlot.endTime)}`,
                patientDetails: { ...formData },
              };
              await api.post("/bookings/create-failed", failedBookingData);
              toast.error("Payment failed. Please try again.");
            }
          } catch (error: any) {
            toast.error("Error saving booking details.");
            console.error(error);
          }
        },
        modal: {
          ondismiss: () => {
            // User closed the payment modal without completing payment
            const cancelledBookingData = {
              doctor_id: doctor._id,
              user_id: userId,
              slot_id: selectedSlot._id,
              modeOfAppointment: appointmentType,
              is_paid: false,
              status: "payment_cancelled",
              paymentMethod: "razorpay",
              ticketPrice: doctor.ticketPrice,
              platformFee: fees.platformFee,
              totalAmount: fees.totalAmount,
              paymentBreakdown: {
                doctorFee: doctor.ticketPrice,
                platformFee: fees.platformFee,
              },
              appointmentDate: selectedSlot.date,
              appointmentTime: `${formatTimeString(
                selectedSlot.startTime
              )} - ${formatTimeString(selectedSlot.endTime)}`,
              patientDetails: { ...formData },
            };

            api
              .post("/bookings/create-failed", cancelledBookingData)
              .then(() => toast("Payment cancelled"))
              .catch((err) =>
                console.error("Error saving cancelled booking:", err)
              );
            // toast("Payment cancelled");
            setIsProcessing(false);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Razorpay initialization failed:", error);
      toast.error("Failed to initialize payment gateway");
      setIsProcessing(false);
    }
  };

  const formatTimeString = (timeString: string) => {
    if (/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeString)) {
      const [hours, minutes] = timeString.split(":").map(Number);
      const period = hours >= 12 ? "PM" : "AM";
      const hours12 = hours % 12 || 12;
      return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
    }

    try {
      const date = new Date(timeString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        });
      }
    } catch (error) {
      console.error("Error formatting time:", error);
    }

    return "Invalid Time";
  };

  console.log('walletBalance' , walletBalance)

  return (
    <div className="bg-gray-100">
      <Navbar />
      <div className="max-w-5xl mx-auto p-6">
        {doctor && (
          <section className="bg-white shadow-md p-6 rounded-lg mt-6 border border-gray-200">
            <div className="flex items-center">
              <img
                src={doctor.profilePicture}
                alt={doctor.name}
                className="w-28 h-28 rounded-full border-2 border-blue-500 shadow-md"
              />
              <div className="ml-6">
                <h2 className="text-2xl font-semibold text-gray-800">
                  {doctor.name}
                </h2>
                <p className="text-gray-500">{doctor.specialization}</p>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                Appointment Type
              </h3>

              <div className="space-y-4">
                <div
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    appointmentType === "online"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                  onClick={() => setAppointmentType("online")}
                >
                  <div className="flex items-start">
                    <div
                      className={`w-5 h-5 rounded-full border mt-1 mr-3 flex-shrink-0 ${
                        appointmentType === "online"
                          ? "border-blue-500 bg-blue-500"
                          : "border-gray-300"
                      }`}
                    ></div>
                    <div>
                      <h4 className="font-medium text-gray-800">
                        Online Consultation
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">
                        Video call appointment
                      </p>
                      {appointmentType === "online" && (
                        <p className="text-sm text-blue-600 mt-2">
                          You'll receive a video call link before your
                          appointment
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="relative flex items-center">
                  <div className="flex-grow border-t border-gray-200"></div>
                  <span className="flex-shrink mx-4 text-gray-400 text-sm">
                    or
                  </span>
                  <div className="flex-grow border-t border-gray-200"></div>
                </div>

                <div
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    appointmentType === "offline"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                  onClick={() => setAppointmentType("offline")}
                >
                  <div className="flex items-start">
                    <div
                      className={`w-5 h-5 rounded-full border mt-1 mr-3 flex-shrink-0 ${
                        appointmentType === "offline"
                          ? "border-blue-500 bg-blue-500"
                          : "border-gray-300"
                      }`}
                    ></div>
                    <div>
                      <h4 className="font-medium text-gray-800">
                        Offline Consultation
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">
                        Online appointment
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {selectedSlot && (
          <section className="mt-8 bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Selected Slot
            </h3>
            <div className="flex items-center gap-2">
              <p className="text-gray-700">
                <strong>Day:</strong>{" "}
                {selectedSlot?.date
                  ? new Date(selectedSlot.date).toLocaleDateString("en-GB", {
                      weekday: "long",
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })
                  : "Not Available"}
              </p>

              <p className="text-gray-700">
                <strong>Time:</strong>{" "}
                {formatTimeString(selectedSlot.startTime)} -{" "}
                {formatTimeString(selectedSlot.endTime)}
              </p>
            </div>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-700">Consultation Fee:</span>
                  <span className="font-medium">{fees.doctorFee} INR</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">
                    Platform Fee ({fees.platformFeePercentage}%):
                  </span>
                  <span className="font-medium">{fees.platformFee} INR</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-700 font-semibold">
                    Total Amount:
                  </span>
                  <span className="font-bold text-blue-800">
                    {fees.totalAmount} INR
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}

        <div className="max-w-5xl mx-auto p-6">
          <section className="mt-10 bg-white p-8 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-xl font-semibold mb-6 text-blue-700">
              Enter Patient Details
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 mb-2">
                    Patient Name*
                  </label>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={formData.patientName}
                    onChange={(e) =>
                      setFormData({ ...formData, patientName: e.target.value })
                    }
                    className={`w-full p-3 border rounded-lg focus:ring-2 ${
                      errors.patientName
                        ? "border-red-500"
                        : "focus:ring-blue-300"
                    }`}
                  />
                  {errors.patientName && (
                    <p className="text-red-500 text-sm">{errors.patientName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">
                    Contact Number*
                  </label>
                  <input
                    type="tel"
                    placeholder="Mobile Number"
                    value={formData.contactNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contactNumber: e.target.value,
                      })
                    }
                    className={`w-full p-3 border rounded-lg focus:ring-2 ${
                      errors.contactNumber
                        ? "border-red-500"
                        : "focus:ring-blue-300"
                    }`}
                  />
                  {errors.contactNumber && (
                    <p className="text-red-500 text-sm">
                      {errors.contactNumber}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">District*</label>
                  <input
                    type="text"
                    placeholder="Your District"
                    value={formData.district}
                    onChange={(e) =>
                      setFormData({ ...formData, district: e.target.value })
                    }
                    className={`w-full p-3 border rounded-lg focus:ring-2 ${
                      errors.district ? "border-red-500" : "focus:ring-blue-300"
                    }`}
                  />
                  {errors.district && (
                    <p className="text-red-500 text-sm">{errors.district}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Locality*</label>
                  <input
                    type="text"
                    placeholder="Your Locality"
                    value={formData.locality}
                    onChange={(e) =>
                      setFormData({ ...formData, locality: e.target.value })
                    }
                    className={`w-full p-3 border rounded-lg focus:ring-2 ${
                      errors.locality ? "border-red-500" : "focus:ring-blue-300"
                    }`}
                  />
                  {errors.locality && (
                    <p className="text-red-500 text-sm">{errors.locality}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-gray-700 mb-2">
                    Hospital Number (if any)
                  </label>
                  <input
                    type="text"
                    placeholder="Hospital Registration Number"
                    value={formData.hospitalNo}
                    onChange={(e) =>
                      setFormData({ ...formData, hospitalNo: e.target.value })
                    }
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-300"
                  />
                </div>
              </div>

              <div className="mt-6 bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h3 className="text-lg font-medium text-gray-800 mb-4">
                  Payment Method
                </h3>

                <div className="space-y-4">
                  <div
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      paymentMethod === "razorpay"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                    onClick={() => setPaymentMethod("razorpay")}
                  >
                    <div className="flex items-start">
                      <div
                        className={`w-5 h-5 rounded-full border mt-1 mr-3 flex-shrink-0 ${
                          paymentMethod === "razorpay"
                            ? "border-blue-500 bg-blue-500"
                            : "border-gray-300"
                        }`}
                      ></div>
                      <div>
                        <h4 className="font-medium text-gray-800">
                          Pay with Razorpay
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          Credit/Debit Card, UPI, Net Banking
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      paymentMethod === "wallet"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                    onClick={() => setPaymentMethod("wallet")}
                  >
                    <div className="flex items-start">
                      <div
                        className={`w-5 h-5 rounded-full border mt-1 mr-3 flex-shrink-0 ${
                          paymentMethod === "wallet"
                            ? "border-blue-500 bg-blue-500"
                            : "border-gray-300"
                        }`}
                      ></div>
                      <div>
                        <h4 className="font-medium text-gray-800">
                          Pay with Wallet
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          Available balance:{" "}
                          {isWalletLoading
                            ? "Loading..."
                            : `${walletBalance} INR`}
                        </p>
                        {paymentMethod === "wallet" &&
                          walletBalance < fees.totalAmount && (
                            <p className="text-sm text-red-500 mt-2">
                              Insufficient wallet balance. Please choose another
                              payment method.
                            </p>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className={`w-full py-3 mt-6 rounded-lg transition ${
                  isProcessing
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {isProcessing
                  ? "Processing..."
                  : `Proceed to Payment (₹${fees.totalAmount})`}
              </button>
            </form>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AppointmentVerification;

// import React, { useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import Navbar from "./Home/Navbar";
// import Footer from "../CommonComponents/Footer";
// import api from "../../axios/UserInstance";
// import toast from "react-hot-toast";
// import { ISlot } from "../../types/Slot";
// import { useSelector } from "react-redux";
// import { RootState } from "../../slice/Store/Store";
// import { IDoctor } from "../../Types";

// const AppointmentVerification: React.FC = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [appointmentType, setAppointmentType] = useState("online");

//   const { doctor, selectedSlot } = location.state as {
//     doctor: IDoctor;
//     selectedSlot: ISlot;
//   };

//   const userId = useSelector((state: RootState) => state.user?.user?.id);

//   const [formData, setFormData] = useState({
//     patientName: "",
//     contactNumber: "",
//     district: "",
//     locality: "",
//     hospitalNo: "",
//   });

//   const [errors, setErrors] = useState({
//     patientName: "",
//     contactNumber: "",
//     district: "",
//     locality: "",
//   });

//   const validateForm = () => {
//     let newErrors = {
//       patientName: "",
//       contactNumber: "",
//       district: "",
//       locality: "",
//     };
//     let isValid = true;

//     if (!formData.patientName.trim()) {
//       newErrors.patientName = "Patient name is required.";
//       isValid = false;
//     }

//     if (!formData.contactNumber.match(/^\d{10}$/)) {
//       newErrors.contactNumber = "Enter a valid 10-digit contact number.";
//       isValid = false;
//     }

//     if (!formData.district.trim()) {
//       newErrors.district = "District is required.";
//       isValid = false;
//     }

//     if (!formData.locality.trim()) {
//       newErrors.locality = "Locality is required.";
//       isValid = false;
//     }

//     setErrors(newErrors);
//     return isValid;
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsProcessing(true);

//     if (!validateForm()) {
//       setIsProcessing(false);
//       return;
//     }

//     if (!selectedSlot) {
//       toast.error("Please select a time slot.");
//       setIsProcessing(false);
//       return;
//     }

//     try {
//       // // First check if slot is still available
//       // const slotCheckResponse = await slotApi.get(`/time-slots/${selectedSlot._id}/availability`);
//       // if (!slotCheckResponse.data.available) {
//       //   toast.error("No available slots for the selected time. Please choose another slot.");
//       //   navigate(-1); // Go back to previous page
//       //   return;
//       // }

//       // Check if user already has a booking for this slot
//       const bookingCheckResponse = await api.get(
//         `/bookings/check?userId=${userId}&slotId=${selectedSlot._id}`
//       );
//       if (bookingCheckResponse.data.hasBooking) {
//         toast.error(
//           "You already have an appointment booked for this time slot."
//         );
//         navigate(-1); // Go back to previous page
//         return;
//       }

//       const paymentRequest = {
//         amount: doctor.ticketPrice,
//         currency: "INR",
//         appointmentData: {
//           ...formData,
//           doctorId: doctor._id,
//           slotId: selectedSlot._id,
//         },
//       };

//       const response = await api.post("/payments/create-order", paymentRequest);

//       if (response.data.success) {
//         if (!(window as any).Razorpay) {
//           const script = document.createElement("script");
//           script.src = "https://checkout.razorpay.com/v1/checkout.js";
//           script.async = true;
//           script.onload = () => initializeRazorpay(response.data);
//           document.body.appendChild(script);
//         } else {
//           initializeRazorpay(response.data);
//         }
//       }
//     } catch (error: any) {
//       console.error("Payment error:", error);
//       setIsProcessing(false);

//       if (
//         error.response?.data?.message?.includes("already have an appointment")
//       ) {
//         toast.error(error.response.data.message);
//         navigate(-1); // Go back to previous page
//       } else {
//         toast.error(error.response?.data?.message || "Payment failed");
//       }
//     }
//   };

//   const initializeRazorpay = (responseData: any) => {
//     try {
//       const { paymentOptions } = responseData.data;

//       if (!paymentOptions?.key) {
//         throw new Error("Razorpay key not found in response");
//       }

//       const options = {
//         key: paymentOptions.key,
//         amount: paymentOptions.amount,
//         currency: paymentOptions.currency,
//         order_id: paymentOptions.order_id,
//         name: paymentOptions.name,
//         description: `Appointment for ${responseData.data.appointmentData.patientName}`,
//         prefill: {
//           name: responseData.data.appointmentData.patientName,
//           contact: responseData.data.appointmentData.contactNumber,
//           email: "user@example.com",
//         },
//         theme: {
//           color: "#3399cc",
//         },
//         handler: async (razorpayResponse: any) => {
//           try {
//             const bookingData = {
//               doctor_id: doctor._id,
//               user_id: userId,
//               slot_id: selectedSlot._id,
//               modeOfAppointment: appointmentType,
//               is_paid: true,
//               status: "confirmed",
//               paymentId: razorpayResponse.razorpay_payment_id,
//               paymentMethod: "razorpay",
//               ticketPrice: doctor.ticketPrice,
//               appointmentDate: selectedSlot.date,
//               appointmentTime: `${formatTimeString(
//                 selectedSlot.startTime
//               )} - ${formatTimeString(selectedSlot.endTime)}`,
//               patientDetails: { ...formData },
//             };

//             await api.post("/bookings/create", bookingData);
//             toast.success("Payment successful! Appointment booked.");
//             navigate("/appointment/success");
//           } catch (error: any) {
//             toast.error("Error saving booking details.");
//             console.error(error);
//           }
//         },
//         modal: {
//           ondismiss: () => {
//             toast("Payment cancelled");
//             setIsProcessing(false);
//           },
//         },
//       };

//       const rzp = new (window as any).Razorpay(options);
//       rzp.open();
//     } catch (error) {
//       console.error("Razorpay initialization failed:", error);
//       toast.error("Failed to initialize payment gateway");
//       setIsProcessing(false);
//     }
//   };

//   const formatTimeString = (timeString: string) => {
//     // Handle HH:mm format
//     if (/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeString)) {
//       const [hours, minutes] = timeString.split(":").map(Number);
//       const period = hours >= 12 ? "PM" : "AM";
//       const hours12 = hours % 12 || 12;
//       return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
//     }

//     // Handle ISO date string format (legacy)
//     try {
//       const date = new Date(timeString);
//       if (!isNaN(date.getTime())) {
//         return date.toLocaleTimeString("en-US", {
//           hour: "2-digit",
//           minute: "2-digit",
//         });
//       }
//     } catch (error) {
//       console.error("Error formatting time:", error);
//     }

//     return "Invalid Time";
//   };

//   return (
//     <div className="bg-gray-100">
//       <Navbar />
//       <div className="max-w-5xl mx-auto p-6">
//         {doctor && (
//           <section className="bg-white shadow-md p-6 rounded-lg mt-6 border border-gray-200">
//             {/* Doctor Profile */}
//             <div className="flex items-center">
//               <img
//                 src={doctor.profilePicture}
//                 alt={doctor.name}
//                 className="w-28 h-28 rounded-full border-2 border-blue-500 shadow-md"
//               />
//               <div className="ml-6">
//                 <h2 className="text-2xl font-semibold text-gray-800">
//                   {doctor.name}
//                 </h2>
//                 <p className="text-gray-500">{doctor.specialization}</p>
//               </div>
//             </div>

//             {/* Appointment Type Selection - Cleaner Version */}
//             <div className="mt-8">
//               <h3 className="text-lg font-medium text-gray-800 mb-4">
//                 Appointment Type
//               </h3>

//               <div className="space-y-4">
//                 {/* Online Option */}
//                 <div
//                   className={`p-4 rounded-lg border cursor-pointer transition-all ${
//                     appointmentType === "online"
//                       ? "border-blue-500 bg-blue-50"
//                       : "border-gray-200 hover:border-blue-300"
//                   }`}
//                   onClick={() => setAppointmentType("online")}
//                 >
//                   <div className="flex items-start">
//                     <div
//                       className={`w-5 h-5 rounded-full border mt-1 mr-3 flex-shrink-0 ${
//                         appointmentType === "online"
//                           ? "border-blue-500 bg-blue-500"
//                           : "border-gray-300"
//                       }`}
//                     ></div>
//                     <div>
//                       <h4 className="font-medium text-gray-800">
//                         Online Consultation
//                       </h4>
//                       <p className="text-sm text-gray-500 mt-1">
//                         Video call appointment
//                       </p>
//                       {appointmentType === "online" && (
//                         <p className="text-sm text-blue-600 mt-2">
//                           You'll receive a video call link before your
//                           appointment
//                         </p>
//                       )}
//                     </div>
//                   </div>
//                 </div>

//                 {/* Divider */}
//                 <div className="relative flex items-center">
//                   <div className="flex-grow border-t border-gray-200"></div>
//                   <span className="flex-shrink mx-4 text-gray-400 text-sm">
//                     or
//                   </span>
//                   <div className="flex-grow border-t border-gray-200"></div>
//                 </div>

//                 {/* Offline Option */}
//                 <div
//                   className={`p-4 rounded-lg border cursor-pointer transition-all ${
//                     appointmentType === "offline"
//                       ? "border-blue-500 bg-blue-50"
//                       : "border-gray-200 hover:border-blue-300"
//                   }`}
//                   onClick={() => setAppointmentType("offline")}
//                 >
//                   <div className="flex items-start">
//                     <div
//                       className={`w-5 h-5 rounded-full border mt-1 mr-3 flex-shrink-0 ${
//                         appointmentType === "offline"
//                           ? "border-blue-500 bg-blue-500"
//                           : "border-gray-300"
//                       }`}
//                     ></div>
//                     <div>
//                       <h4 className="font-medium text-gray-800">
//                         Offline Consultation
//                       </h4>
//                       <p className="text-sm text-gray-500 mt-1">
//                         In-person appointment
//                       </p>
//                       {/* {appointmentType === "offline" && (
//                         <p className="text-sm text-blue-600 mt-2">
//                           Clinic address: {doctor.clinicAddress}
//                         </p>
//                       )} */}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </section>
//         )}

//         {selectedSlot && (
//           <section className="mt-8 bg-white p-6 rounded-lg shadow-md border border-gray-200">
//             <h3 className="text-lg font-semibold mb-4 text-gray-800">
//               Selected Slot
//             </h3>
//             <div className="flex items-center gap-2">
//               <p className="text-gray-700">
//                 <strong>Day:</strong>{" "}
//                 {selectedSlot?.date
//                   ? new Date(selectedSlot.date).toLocaleDateString("en-GB", {
//                       weekday: "long",
//                       day: "2-digit",
//                       month: "long",
//                       year: "numeric",
//                     })
//                   : "Not Available"}
//               </p>

//               <p className="text-gray-700">
//                 <strong>Time:</strong>{" "}
//                 {formatTimeString(selectedSlot.startTime)} -{" "}
//                 {formatTimeString(selectedSlot.endTime)}
//               </p>
//             </div>
//             <div className="mt-4 p-4 bg-blue-50 rounded-lg">
//               <p className="font-medium text-blue-800">
//                 Consultation Fee: {doctor.ticketPrice} INR
//               </p>
//             </div>
//           </section>
//         )}

//         <div className="max-w-5xl mx-auto p-6">
//           <section className="mt-10 bg-white p-8 rounded-lg shadow-md border border-gray-200">
//             <h3 className="text-xl font-semibold mb-6 text-blue-700">
//               Enter Patient Details
//             </h3>
//             <form onSubmit={handleSubmit}>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   <label className="block text-gray-700 mb-2">
//                     Patient Name*
//                   </label>
//                   <input
//                     type="text"
//                     placeholder="Full Name"
//                     value={formData.patientName}
//                     onChange={(e) =>
//                       setFormData({ ...formData, patientName: e.target.value })
//                     }
//                     className={`w-full p-3 border rounded-lg focus:ring-2 ${
//                       errors.patientName
//                         ? "border-red-500"
//                         : "focus:ring-blue-300"
//                     }`}
//                   />
//                   {errors.patientName && (
//                     <p className="text-red-500 text-sm">{errors.patientName}</p>
//                   )}
//                 </div>

//                 <div>
//                   <label className="block text-gray-700 mb-2">
//                     Contact Number*
//                   </label>
//                   <input
//                     type="tel"
//                     placeholder="Mobile Number"
//                     value={formData.contactNumber}
//                     onChange={(e) =>
//                       setFormData({
//                         ...formData,
//                         contactNumber: e.target.value,
//                       })
//                     }
//                     className={`w-full p-3 border rounded-lg focus:ring-2 ${
//                       errors.contactNumber
//                         ? "border-red-500"
//                         : "focus:ring-blue-300"
//                     }`}
//                   />
//                   {errors.contactNumber && (
//                     <p className="text-red-500 text-sm">
//                       {errors.contactNumber}
//                     </p>
//                   )}
//                 </div>

//                 <div>
//                   <label className="block text-gray-700 mb-2">District*</label>
//                   <input
//                     type="text"
//                     placeholder="Your District"
//                     value={formData.district}
//                     onChange={(e) =>
//                       setFormData({ ...formData, district: e.target.value })
//                     }
//                     className={`w-full p-3 border rounded-lg focus:ring-2 ${
//                       errors.district ? "border-red-500" : "focus:ring-blue-300"
//                     }`}
//                   />
//                   {errors.district && (
//                     <p className="text-red-500 text-sm">{errors.district}</p>
//                   )}
//                 </div>

//                 <div>
//                   <label className="block text-gray-700 mb-2">Locality*</label>
//                   <input
//                     type="text"
//                     placeholder="Your Locality"
//                     value={formData.locality}
//                     onChange={(e) =>
//                       setFormData({ ...formData, locality: e.target.value })
//                     }
//                     className={`w-full p-3 border rounded-lg focus:ring-2 ${
//                       errors.locality ? "border-red-500" : "focus:ring-blue-300"
//                     }`}
//                   />
//                   {errors.locality && (
//                     <p className="text-red-500 text-sm">{errors.locality}</p>
//                   )}
//                 </div>

//                 <div className="md:col-span-2">
//                   <label className="block text-gray-700 mb-2">
//                     Hospital Number (if any)
//                   </label>
//                   <input
//                     type="text"
//                     placeholder="Hospital Registration Number"
//                     value={formData.hospitalNo}
//                     onChange={(e) =>
//                       setFormData({ ...formData, hospitalNo: e.target.value })
//                     }
//                     className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-300"
//                   />
//                 </div>
//               </div>

//               <button
//                 type="submit"
//                 disabled={isProcessing}
//                 className={`w-full py-3 mt-6 rounded-lg transition ${
//                   isProcessing
//                     ? "bg-blue-400 cursor-not-allowed"
//                     : "bg-blue-600 hover:bg-blue-700 text-white"
//                 }`}
//               >
//                 {isProcessing
//                   ? "Processing..."
//                   : `Proceed to Payment (₹${doctor.ticketPrice})`}
//               </button>
//             </form>
//           </section>
//         </div>
//       </div>
//       <Footer />
//     </div>
//   );
// };

// export default AppointmentVerification;
