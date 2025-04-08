import adminApi from "../axios/AdminInstance";

export const fetchDoctor = async (
  page: number,
  limit: number,
  searchTerm: string,
  isBlocked: string
) => {
  try {
    const response = await adminApi.get<any>("/doctor", {
      params: { page, limit, searchTerm, isBlocked },
    });

    // Extract the nested `data` object from the response
    const { data } = response.data;

    console.log("Extracted data:", data); // Log the extracted data
    return data; // Return the nested `data` object
  } catch (error) {
    console.error("Error fetching Doctors:", error);
    throw new Error("Failed to fetch Doctors. Please try again later.");
  }
};


export const fetchUser = async (
  page: number,
  limit: number,
  searchTerm: string,
  isBlocked: string
) => {
  try {
    const response = await adminApi.get<any>("/users", {
      params: { page, limit, searchTerm, isBlocked },
    });

    // Extract the nested `data` object from the response
    const { data } = response.data;

    console.log("Extracted data:", data); // Log the extracted data
    return data; // Return the nested `data` object
  } catch (error) {
    console.error("Error fetching Users:", error);
    throw new Error("Failed to fetch Users. Please try again later.");
  }
};

export const blockDoctor = async (doctorId : string , isBlocked : boolean) => {
    try {
       await adminApi.post('/block-doctor', { doctorId, isBlocked });
        
    }catch (error: any) {
        console.error('Error blocking doctor:', error.response?.data || error.message);
      }
}
export const blockUser = async (userId : string , isBlocked : boolean) => {
    try {
       await adminApi.post('/block-user', { userId, isBlocked });
        
    }catch (error: any) {
        console.error('Error blocking user:', error.response?.data || error.message);
      }
}

export const approveDoctor = async (doctorId: string) => {
  const response = await adminApi.post(`/approve`, {
    doctorId,
    status: "approved",
  });
  console.log(response.data);
  return response.data;
};


// export const rejectDoctor = async (doctorId: string, notes: string) => {
//   const response = await adminApi.patch(`/reject-doctor/${doctorId}`, { notes });
//   return response.data;
// };


