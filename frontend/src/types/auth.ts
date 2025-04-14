
export interface ProfilePictureResponse {
    status: number;
    message: string;
    data: {
      profilePicture: string;
    };
  }

  export interface AxiosError {
    response?: {
      data?: {
        message?: string;
      };
    };
  }

   
export interface User {
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
}


 

export  interface FetchUsersResponse {
  users: User[];
  total: number;
}

export interface LoginResponse {
  status: number;
  message: string;
  data: {
    user: User;
    accessToken?: string;
    refreshToken?: string;
  };
}

export interface GoogleSignInResponse {
  status: number;
  message: string;
  data: User;
}

export interface SignupFormInputs {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  mobile: string;
}

export interface SignupResponse {
  status: number;
  message: string;
  data: {
    user: User;
  };
}

export interface ProfileResponse {
  profilePicture?: string | null;
  status: number;
  message: string;
  data: User;
}

export interface UpdateProfileResponse {
  status: number;
  message: string;
  data: User;
}
