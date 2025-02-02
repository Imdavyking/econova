const saveToLocalStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const getFromLocalStorage = (key) => {
  const data = localStorage.getItem(key);
  if (!data) {
    return null;
  }
  return JSON.parse(data);
};

const deleteFromLocalStorage = (key) => {
  localStorage.removeItem(key);
};

export { saveToLocalStorage, getFromLocalStorage, deleteFromLocalStorage };
