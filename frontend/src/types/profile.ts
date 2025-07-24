import * as yup from "yup";

// Validation Schema
export const profileSchema = yup.object().shape({
  name: yup
    .string()
    .required("Name is required")
    .min(3, "Name must be at least 3 characters")
    .matches(/^[A-Za-z ]+$/, "Only alphabets and spaces are allowed"),
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
  phone: yup
    .string()
    .matches(/^\d{10}$/, "Phone number must be 10 digits")
    .required("Phone number is required"),
  qualification: yup.string().required("Qualification is required"),
  specialization: yup.string().required("Specialization is required"),
  registrationNumber: yup
    .string()
    .required("Medical registration number is required")
    .min(5, "Registration number must be at least 5 characters"),
  ticketPrice: yup
    .number()
    .typeError("Consultation fee must be a number")
    .required("Consultation fee is required")
    .min(0, "Consultation fee cannot be negative"),
  extraCharge: yup
    .number()
    .typeError("Extra fee must be a number")
    .min(0, "Extra fee cannot be negative"),
  bio: yup.string().max(500, "Bio cannot exceed 500 characters"),
  experience: yup
    .number()
    .typeError("Experience must be a number")
    .required("Experience is required")
    .min(0, "Experience cannot be negative"),
  experienceList: yup.array().of(
    yup.object({
      hospital: yup.string().required("Hospital is required"),
      years: yup
        .number()
        .typeError("Years must be a number")
        .required("Years is required")
        .min(0, "Years cannot be negative"),
    })
  ),
});

export type FormData = yup.InferType<typeof profileSchema>;
