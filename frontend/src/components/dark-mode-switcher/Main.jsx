import { useRecoilValue, useSetRecoilState } from "recoil";
import { darkModeValue, darkMode as darkModeStore } from "@/stores/dark-mode";
import dom from "@left4code/tw-starter/dist/js/dom";
import classnames from "classnames";
import { FaSun, FaMoon } from "react-icons/fa";

function Main(props) {
  const darkMode = useRecoilValue(darkModeStore);
  const setDarkModeValue = useSetRecoilState(darkModeValue);

  const setDarkModeClass = () => {
    darkMode ? dom("html").addClass("dark") : dom("html").removeClass("dark");
  };

  const switchMode = () => {
    setDarkModeValue(() => !darkMode);
    localStorage.setItem("darkMode", !darkMode);
    setDarkModeClass();
  };

  setDarkModeClass();
  return (
    <div
      className="border-slate-700 dark:border-slate-700 dark-mode-switcher cursor-pointer shadow-md fixed bottom-0 right-4 box border rounded-full w-auto md:w-40 h-12 flex items-center justify-center z-50 mb-10 mr-10"
      onClick={switchMode}
    >
      <div className="mr-4 text-slate-600 dark:text-slate-200 hidden md:block">
        Dark Mode
      </div>
      <div
        className={classnames({
          "dark-mode-switcher__toggle border hidden md:block": true,
          "dark-mode-switcher__toggle--active": darkMode,
        })}
      ></div>
      <div className="md:hidden py-2 px-4 h-12 flex items-center">
        {darkMode ? (
          <FaMoon className="w-6 h-6" />
        ) : (
          <FaSun className="w-6 h-6" />
        )}
      </div>
    </div>
  );
}

export default Main;
