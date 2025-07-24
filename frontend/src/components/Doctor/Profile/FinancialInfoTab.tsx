"use client"

import type React from "react"
import { IndianRupee } from "lucide-react"
import { motion } from "framer-motion"
import type { Control, FieldErrors } from "react-hook-form"
import { FormField } from "../../CommonComponents/UI/FormField"

interface FinancialInfoTabProps {
  control: Control<any>
  errors: FieldErrors<any>
  editMode: boolean
}

export const FinancialInfoTab: React.FC<FinancialInfoTabProps> = ({ control, errors, editMode }) => {
  return (
    <motion.div
      key="financial"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 mb-6">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Pricing Guidelines</h4>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Set competitive consultation fees based on your experience and specialization. Extra charges can be applied
          for special procedures or extended consultations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          name="ticketPrice"
          control={control}
          label="Consultation Fee (₹)"
          type="number"
          icon={<IndianRupee className="w-4 h-4" />}
          placeholder="Enter consultation fee"
          disabled={!editMode}
          error={errors.ticketPrice}
        />
        <FormField
          name="extraCharge"
          control={control}
          label="Extra Charge (₹)"
          type="number"
          icon={<IndianRupee className="w-4 h-4" />}
          placeholder="Enter extra fee (if any)"
          disabled={!editMode}
          error={errors.extraCharge}
        />
      </div>
    </motion.div>
  )
}
