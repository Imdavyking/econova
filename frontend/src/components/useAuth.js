/** @format */

import { useState } from "react";
import { useRecoilState } from "recoil";
import { userAccount } from "@/stores/userData";

const useAuth = () => {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [data] = useRecoilState(userAccount);

	if (data.token && data.userDetails) {
		setIsAuthenticated(true);
	}

	return { isAuthenticated };
};

export default useAuth;
