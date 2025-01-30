/** @format */

import { atom } from "recoil";
const localStorageEffect =
	(key) =>
	({ setSelf, onSet }) => {
		const savedValue = localStorage.getItem(key);
		if (savedValue != null) {
			setSelf(JSON.parse(savedValue));
		}

		onSet((newValue, _, isReset) => {
			isReset
				? localStorage.removeItem(key)
				: localStorage.setItem(key, JSON.stringify(newValue));
		});
	};

const userAccount = atom({
	key: "user_Details",
	default: {
		userDetails: null,
		token: null,
		apiKey: null,
	},
	effects: [localStorageEffect("user_Details")],
});

export { userAccount };
