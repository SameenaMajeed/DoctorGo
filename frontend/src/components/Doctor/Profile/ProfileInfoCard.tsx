"use client";

import type React from "react";
import { Mail, Phone, Shield, Clock, IndianRupee, Award } from "lucide-react";
import { StatCard } from "../../CommonComponents/UI/StatCard";

interface ProfileData {
  name?: string;
  specialization?: string;
  qualification?: string;
  registrationNumber?: string;
  email?: string;
  phone?: string;
  experience?: number;
  ticketPrice?: number;
}

interface ProfileInfoCardProps {
  profile: ProfileData;
  certificatesCount: number;
}

export const ProfileInfoCard: React.FC<ProfileInfoCardProps> = ({
  profile,
  certificatesCount,
}) => {
  return (
    <div className="mt-6">
      <div className="flex justify-center mt-2">
        <div className="flex flex-col items-center gap-1 text-sm">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dr. {profile?.name || "Name"}
          </h2>
          <p className="text-blue-600 dark:text-blue-400 font-medium">
            {profile?.specialization || "Specialization"}
          </p>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {profile?.qualification || "Qualification"}
          </p>
        </div>
      </div>

      {profile?.registrationNumber && (
        <div className="flex items-center justify-center gap-2 mt-2 text-sm text-green-600 dark:text-green-400">
          <Shield size={14} />
          <span>Reg: {profile.registrationNumber}</span>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <StatCard
          icon={<Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
          value={profile?.experience || 0}
          label="Years Experience"
          bgColor="bg-blue-50 dark:bg-blue-900/30"
          textColor="text-blue-600 dark:text-blue-400"
        />
        <StatCard
          icon={
            <IndianRupee className="w-5 h-5 text-green-600 dark:text-green-400" />
          }
          value={`₹${profile?.ticketPrice || 0}`}
          label="Consultation Fee"
          bgColor="bg-green-50 dark:bg-green-900/30"
          textColor="text-green-600 dark:text-green-400"
        />
      </div>

      Verification Status
      <div className="mt-6 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
        <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
          <Award size={16} />
          <span className="text-sm font-medium">
            {certificatesCount > 0 ? "Verified Doctor" : "Pending Verification"}
          </span>
        </div>
        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
          {certificatesCount} Certificate{certificatesCount !== 1 ? "s" : ""}{" "}
          Uploaded
        </p>
      </div>

      {/* Contact Info */}
      <div className="mt-6 space-y-3">
        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
          <Mail className="w-4 h-4" />
          <span>{profile?.email || "email@doctor.com"}</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
          <Phone className="w-4 h-4" />
          <span>{profile?.phone || "+XXX XXX XXX XXX"}</span>
        </div>
      </div>
    </div>
  );
};
