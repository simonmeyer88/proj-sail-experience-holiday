export const useHoursDifference = (first: Date, second: Date) => {
  const diffInMs = Math.abs(first.getTime() - second.getTime());
  const diffInHours = diffInMs / (1000 * 60 * 60);

  return parseInt(diffInHours.toFixed());
};
