// src/hooks/useTodaysAppointments.ts

import { useEffect, useState } from 'react';
import { getTodaysAppointments } from '../Api/DoctorApis';
import {IAppointment } from '../Types';

export const useTodaysAppointments = () => {
  const [appointments, setAppointments] = useState<IAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const data = await getTodaysAppointments();
        setAppointments(data);
      } catch (err) {
        setError('Failed to fetch appointments');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  return { appointments, loading, error };
};