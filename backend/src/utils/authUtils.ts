
export const getRoleFromPath = (path: string): string | null => {
    const firstSegment = path.split('/')[1];
    return ['doctor', 'admin', 'user'].includes(firstSegment) ? firstSegment : null;
};
  
export const getStorageKey = (role?: string | null): string => {
    return role ? `authToken_${role}` : 'authToken';
  };