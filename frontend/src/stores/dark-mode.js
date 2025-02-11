import { atom, selector } from "recoil";

const darkModeValue = atom({
  key: "darkModeValue",
  default: localStorage.getItem("darkMode") !== "false",
});

const darkMode = selector({
  key: "darkMode",
  get: ({ get }) => {
    if (localStorage.getItem("darkMode") === null) {
      localStorage.setItem("darkMode", true);
    }

    return get(darkModeValue);
  },
});

export { darkModeValue, darkMode };
