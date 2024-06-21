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

export const useDimensions = ref => {
  const dimensions = useRef({ width: 0, height: 0 });

  useEffect(() => {
    dimensions.current.width = ref.current.offsetWidth;
    dimensions.current.height = ref.current.offsetHeight;
  }, []);

  return dimensions.current;
};

export const calcCurrentPage = (scrollY, pagesRefs, currentPage, setCurrentPage, isMobile) => {
  const viewportHeight = window.innerHeight;
  const [landingPageRef, experienceRef, aboutRef] = pagesRefs;
  if (scrollY > 0) {
    if (scrollY >= landingPageRef.current.offsetTop
      && scrollY < experienceRef.current.offsetTop - (isMobile ? viewportHeight / 2 : 200)
      && currentPage !== 1) {
      setCurrentPage(1);
    } else if (scrollY >= experienceRef.current.offsetTop - (isMobile ? viewportHeight / 2 : 200)
      && scrollY < aboutRef.current.offsetTop - (isMobile ? viewportHeight / 2 : 200)
      && currentPage !== 2) {
        console.log("exp");
      setCurrentPage(2);
    } else if (scrollY >= aboutRef.current.offsetTop - (isMobile ? viewportHeight / 2 : 200)
      && (aboutRef.current.getBoundingClientRect().top >= 0 || isMobile)
      && currentPage !== 3) {
      setCurrentPage(3);
    } else if (aboutRef.current.getBoundingClientRect().top < -300 && !isMobile) {
      setCurrentPage(4);
    }
  }
}