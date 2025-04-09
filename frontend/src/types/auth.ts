
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