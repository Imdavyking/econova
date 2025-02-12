export const saveTwitterAuth = async (data) => {
  localStorage.setItem("authToken", data.authToken);
};

export const getTwitterAuth = async () => {
  return localStorage.getItem("authToken");
};

export const removeTwitterAuth = async () => {
  localStorage.removeItem("authToken");
};
