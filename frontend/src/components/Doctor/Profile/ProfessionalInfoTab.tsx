"use client";

import React from "react";
import {
  GraduationCap,
  Stethoscope,
  Shield,
  Clock,
  Plus,
  Trash,
  Building2,
  Briefcase,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useFieldArray, Control, FieldErrors } from "react-hook-form";
import { FormField } from "../../CommonComponents/UI/FormField";
import { Button } from "../../CommonComponents/Button";
import type { FormData } from '../../../types/profile';
import { ActionButton } from "../../CommonComponents/UI/ActionButton";

interface ProfessionalInfoTabProps {
  control: Control<FormData>;
  errors: FieldErrors<FormData>;
  editMode: boolean;
}

export const ProfessionalInfoTab: React.FC<ProfessionalInfoTabProps> = ({
  control,
  errors,
  editMode,
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "experienceList",
  });

  return (
    <motion.div
      key="professional"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          name="qualification"
          control={control}
          label="Qualification"
          icon={<GraduationCap className="w-4 h-4" />}
          placeholder="Enter your qualification"
          disabled={!editMode}
          error={errors.qualification?.message}
        />
        <FormField
          name="specialization"
          control={control}
          label="Specialization"
          icon={<Stethoscope className="w-4 h-4" />}
          placeholder="Enter your specialization"
          disabled={!editMode}
          error={errors.specialization?.message}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          name="registrationNumber"
          control={control}
          label="Medical Registration Number"
          icon={<Shield className="w-4 h-4" />}
          placeholder="Enter your registration number"
          disabled={!editMode}
          error={errors.registrationNumber?.message}
        />
        <FormField
          name="experience"
          control={control}
          label="Experience (Years)"
          type="number"
          icon={<Clock className="w-4 h-4" />}
          placeholder="Enter years of experience"
          disabled={!editMode}
          error={errors.experience?.message}
        />
      </div>

      {/* Experience Entries */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-green-600" />
            Work Experience
            {fields.length > 0 && (
              <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full text-sm font-medium">
                {fields.length} {fields.length === 1 ? "Entry" : "Entries"}
              </span>
            )}
          </h3>

          {editMode && (
            <ActionButton
              type="button"
              variant="success"
              onClick={() => append({ hospital: "", years: 0 })}
              icon={<Plus className="w-4 h-4" />}
              className="max-w-fit px-4 py-2"
            >
              Add Experience
            </ActionButton>
          )}
        </div>


        <AnimatePresence mode="popLayout">
          {fields.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center py-12"
            >
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Work Experience Added</h4>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                {editMode
                  ? "Add your work experience to showcase your professional background to patients."
                  : "Work experience details will be displayed here once added."}
              </p>
              {editMode && (
                <ActionButton
                  type="button"
                  variant="success"
                  onClick={() => append({ hospital: "", years: 0 })}
                  icon={<Plus className="w-4 h-4" />}
                  className="max-w-fit mx-auto"
                >
                  Add Your First Experience
                </ActionButton>
              )}
            </motion.div>
          ) : (
            <div className="space-y-4">
              {fields.map((field, index) => (
                <motion.div
                  key={field.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 relative shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Experience #{index + 1}
                      </span>
                    </div>

                    {editMode && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() => remove(index)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Remove Experience"
                      >
                        <Trash className="w-4 h-4" />
                      </motion.button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      name={`experienceList.${index}.hospital`}
                      control={control}
                      label="Hospital/Organization Name"
                      icon={<Building2 className="w-4 h-4" />}
                      placeholder="e.g., Apollo Hospital, AIIMS"
                      disabled={!editMode}
                      error={errors.experienceList?.[index]?.hospital}
                    />
                    <FormField
                      name={`experienceList.${index}.years`}
                      control={control}
                      label="Years of Experience"
                      type="number"
                      icon={<Clock className="w-4 h-4" />}
                      placeholder="e.g., 3"
                      disabled={!editMode}
                      error={errors.experienceList?.[index]?.years}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Guidelines */}
        {editMode && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800"
          >
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Professional Guidelines
            </h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Include all relevant medical institutions where you've worked</li>
              <li>• Mention years of experience at each organization</li>
              <li>• This information helps build patient trust and credibility</li>
              <li>• Keep information accurate and up-to-date</li>
            </ul>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
