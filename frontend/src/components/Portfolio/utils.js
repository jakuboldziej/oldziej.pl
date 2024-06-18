import { useEffect, useRef } from "react";
import { textData } from '@/assets/text'


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
      currentPagesNames.push(textData?.[lang].pagination.home);
    } else if (number === 2) {
      currentPagesNames.push(textData?.[lang].pagination.experience);
    } else if (number === 3) {
      currentPagesNames.push(textData?.[lang].pagination.about);
    }
  }
  return currentPagesNames;
}

export const scrollToTop = (ref, smoothness = 'smooth') => {
  window.scrollTo({ top: ref, behavior: smoothness });
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