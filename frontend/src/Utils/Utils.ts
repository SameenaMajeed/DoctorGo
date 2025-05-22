export function cn(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(' ');
}

export const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

export const getFriendlyError = (error: Error) => {
  switch(error.name) {
    case 'NotAllowedError':
      return 'Please allow camera and microphone access';
    case 'NotFoundError':
      return 'No media devices found';
    case 'NotReadableError':
      return 'Could not access media devices (in use by another app?)';
    case 'OverconstrainedError':
      return 'Requested constraints cannot be satisfied';
    case 'SecurityError':
      return 'Media access is not allowed in this context';
    case 'TypeError':
      return 'Invalid constraints specified';
    default:
      return 'Failed to establish call - please try again';
  }
};
