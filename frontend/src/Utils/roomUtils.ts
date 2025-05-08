export const generateChatRoom = (userId: string, doctorId: string) =>
    `chat_user_${userId}_${doctorId}`;
  
export const generateVideoRoom = (userId: string, doctorId: string) =>
    `video_user_${userId}_${doctorId}`;