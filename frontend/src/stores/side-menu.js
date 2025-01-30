import { atom } from "recoil";

const sideMenu = atom({
	key: "sideMenu",
	default: {
		menu: [
			{
				icon: "Home",
				pathname: "/dashboard",
				title: "Dashboard",
			},
			{
				icon: "ShoppingCart",
				pathname: "/dashboard/orders",
				title: "Orders",
			},
			{
				icon: "Settings",
				pathname: "/dashboard/settings",
				title: "Settings",
			},
		],
	},
});

export { sideMenu };
