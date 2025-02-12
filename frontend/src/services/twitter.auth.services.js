const key = "authToken";

export const saveTwitterAuth = (data) => {
  localStorage.setItem(key, data.authToken);
};

export const getTwitterAuth = () => {
  return localStorage.getItem(key);
};

export const removeTwitterAuth = () => {
  localStorage.removeItem(key);
};
