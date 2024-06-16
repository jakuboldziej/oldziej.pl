import { useEffect, useRef } from "react";

export const createNumberArray = (toNumber) => {
  const numbersArray = [];
  for (let i = 1; i <= toNumber; i++) {
    numbersArray.push(i);
  }
  return numbersArray;
}

export const handleCurrentPagesNames = (numbersList, lang) => {
  const currentPagesNames = [];
  for (let number of numbersList) {
    if (number === 1) {
      currentPagesNames.push(lang === "pl" ? "Home" : "Home");
    } else if (number === 2) {
      currentPagesNames.push(lang === "pl" ? "Projekty" : "Projects");
    } else if (number === 3) {
      currentPagesNames.push(lang === "pl" ? "O mnie" : "About");
    }
  }
  return currentPagesNames;
}

// Navbar

export const useDimensions = ref => {
  const dimensions = useRef({ width: 0, height: 0 });

  useEffect(() => {
    dimensions.current.width = ref.current.offsetWidth;
    dimensions.current.height = ref.current.offsetHeight;
  }, []);

  return dimensions.current;
};
