const key = "authToken";

export const saveTwitterAuth = (authToken) => {
  localStorage.setItem(key, authToken);
};

export const getTwitterAuth = () => {
  return localStorage.getItem(key);
};

export const removeTwitterAuth = () => {
  localStorage.removeItem(key);
};
