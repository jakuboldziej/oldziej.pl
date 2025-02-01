export const handleTimePlayed = (gameCreatedAt, gameFinishedAt) => {
  if (gameFinishedAt === 0) return "00:00";
  const date = new Date(gameCreatedAt);
  const finishedDate = new Date(gameFinishedAt);

  const timeDifference = finishedDate.getTime() - date.getTime();

  const minutesDifference = Math.floor(timeDifference / (1000 * 60));
  const secondsDifference = Math.floor((timeDifference % (1000 * 60)) / 1000);

  const formattedTimeDifference = `${minutesDifference.toString().padStart(2, '0')}:${secondsDifference.toString().padStart(2, '0')}`;
  return formattedTimeDifference;
}