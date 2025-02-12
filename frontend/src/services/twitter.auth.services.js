export const saveTwitterAuth = (data) => {
  localStorage.setItem("authToken", data.authToken);
};

export const getTwitterAuth = () => {
  return localStorage.getItem("authToken");
};

export const removeTwitterAuth = () => {
  localStorage.removeItem("authToken");
};
