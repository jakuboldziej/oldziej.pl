import Cookies from 'js-cookie';

let memoryToken = null;

export const setApiToken = (token) => {
  memoryToken = token;
};

export const getApiToken = () => {
  return memoryToken || Cookies.get("_auth");
};