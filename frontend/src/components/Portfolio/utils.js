export const createNumberArray = (toNumber) => {
  const numbersArray = [];
  for (let i = 1; i <= toNumber; i++) {
    numbersArray.push(i);
  }
  return numbersArray;
}

export const handleCurrentPagesNames = (numbersList) => {
  const currentPagesNames = [];
  for (let number of numbersList) {
    if (number === 1) {
      currentPagesNames.push("Landing Page");
    } else if (number === 2) {
      currentPagesNames.push("Projects");
      
    }
  }
  return currentPagesNames;
}