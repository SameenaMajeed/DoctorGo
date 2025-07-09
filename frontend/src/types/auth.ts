
export interface IProfilePictureResponse {
    status?: number;
    message: string;
    success : boolean
    data?: {
      profilePicture: string;
    };
  }

  export interface IAxiosError {
    response?: {
      status: any;
      data?: {
        message?: string;
        error?:any
      };

    };
  }

   
export interface IUser {
  id : string;
  _id:string
  name: string;
  email: string;
  mobile_no: string;
  profilePicture?: string | null;
  accessToken?: string;
  isBlocked: boolean;
  role : string;
  address : string;
  gender : string;
  DOB : string;
  age : string;
}


 

export  interface IFetchUsersResponse {
  users: IUser[];
  total: number;
}

export interface ILoginResponse {
  status: number;
  message: string;
  data: {
    user: IUser;
    accessToken?: string;
    refreshToken?: string;
  };
}

export interface IGoogleSignInResponse {
  status: number;
  message: string;
  data: IUser;
}

export interface ISignupFormInputs {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  mobile: string;
}

export interface ISignupResponse {
  status: number;
  message: string;
  data: {
    user: IUser;
  };
}

export interface IProfileResponse {
  profilePicture?: string | null;
  status: number;
  message: string;
  data: IUser;
}

export interface IUpdateProfileResponse {
  status: number;
  message: string;
  data: IUser;
}


// type BookingResponse = {
//   success: boolean;
//   message: string;
//   razorpayOrder?: any; // Replace with proper Razorpay order type
//   redirect?: boolean;
// };

export interface IReviewResponse {
  data: {
    _id: string;
    doctor_id: string;
    user_id: string;
    appointment_id: string;
    reviewText: string;
    rating: number;
    createdAt: string;
    updatedAt: string;
  };
  message: string;
}

export interface IReviewCheckResponse {
  data: {
    existingReview: {
      _id: string;
      rating: number;
      reviewText: string;
    } | null;
    canReview: boolean;
  };
  message: string;
}