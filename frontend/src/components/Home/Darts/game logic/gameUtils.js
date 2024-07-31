export const handleTimePlayed = (gameCreatedAt) => {
  const date = new Date(gameCreatedAt);
  const currentDate = new Date();

  const timeDifference = currentDate.getTime() - date.getTime();

  const hoursDifference = Math.floor(timeDifference / (1000 * 60 * 60));
  const minutesDifference = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));

  const formattedTimeDifference = `${hoursDifference.toString().padStart(2, '0')}:${minutesDifference.toString().padStart(2, '0')}`;
  return formattedTimeDifference;
}