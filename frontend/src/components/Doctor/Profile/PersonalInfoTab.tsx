import type React from "react"
import { User, Phone, Mail, FileText } from "lucide-react"
import { motion } from "framer-motion"
import type { Control, FieldErrors } from "react-hook-form"
import { FormField } from "../../CommonComponents/UI/FormField"

interface PersonalInfoTabProps {
  control: Control<any>
  errors: FieldErrors<any>
  editMode: boolean
}

export const PersonalInfoTab: React.FC<PersonalInfoTabProps> = ({ control, errors, editMode }) => {
  return (
    <motion.div
      key="personal"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          name="name"
          control={control}
          label="Full Name"
          icon={<User className="w-4 h-4" />}
          placeholder="Enter your full name"
          disabled={!editMode}
          error={errors.name}
        />
        <FormField
          name="phone"
          control={control}
          label="Phone Number"
          icon={<Phone className="w-4 h-4" />}
          placeholder="Enter your phone number"
          disabled={!editMode}
          error={errors.phone}
        />
      </div>

      <FormField
        name="email"
        control={control}
        label="Email Address"
        type="email"
        icon={<Mail className="w-4 h-4" />}
        placeholder="Enter your email"
        disabled={!editMode}
        error={errors.email}
      />

      <FormField
        name="bio"
        control={control}
        label="Bio"
        type="textarea"
        icon={<FileText className="w-4 h-4" />}
        placeholder="Tell us about yourself (max 500 characters)"
        disabled={!editMode}
        error={errors.bio}
        rows={4}
      />
    </motion.div>
  )
}
