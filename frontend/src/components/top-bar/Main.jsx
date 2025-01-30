/** @format */

import { useState } from "react";
import {
	Lucide,
	Dropdown,
	DropdownToggle,
	DropdownMenu,
	DropdownContent,
	DropdownItem,
	DropdownHeader,
	DropdownDivider,
} from "@/base-components";
import { faker as $f } from "@/utils";
import * as $_ from "lodash";
import classnames from "classnames";
import { Link, useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { userAccount } from "@/stores/userData";
import { APP_NAME } from "../../utils/constants";

function Main(props) {
	const [searchDropdown, setSearchDropdown] = useState(false);
	const showSearchDropdown = () => {
		setSearchDropdown(true);
  };
  const navigate = useNavigate();
	const hideSearchDropdown = () => {
    setSearchDropdown( false );
    
	};
	const [data, setData] = useRecoilState(userAccount);

	const Logout = () => {
		localStorage.removeItem("user_Details");
		setData({
			userDetails: null,
			token: null,
    } );
    navigate( "/login" );
	};

	return (
		<>
			{/* BEGIN: Top Bar */}
			<div className="top-bar">
				{/* BEGIN: Breadcrumb */}
				<nav
					aria-label="breadcrumb"
					className="-intro-x mr-auto hidden sm:flex">
					<ol className="breadcrumb">
						<li className="breadcrumb-item">
							<a href="#">Application</a>
						</li>
						<li className="breadcrumb-item active" aria-current="page">
							Dashboard
						</li>
					</ol>
				</nav>

				<Dropdown className="intro-x w-8 h-8">
					<DropdownToggle
						tag="div"
						role="button"
						className="w-8 h-8 rounded-full overflow-hidden shadow-lg image-fit zoom-in">
						<img
							alt={APP_NAME}
							src={$f()[9].photos[0]}
						/>
					</DropdownToggle>
					<DropdownMenu className="w-56">
						<DropdownContent className="bg-primary text-white">
							<DropdownHeader tag="div" className="!font-normal">
								<div className="font-medium">
									{data?.userDetails?.full_name}
								</div>
								<div className="text-xs text-white/70 mt-0.5 dark:text-slate-500">
									{data?.userDetails?.email}
								</div>
							</DropdownHeader>
							<DropdownDivider className="border-white/[0.08]" />
							<DropdownItem className="hover:bg-white/5" >
								<Lucide icon="User" className="w-4 h-4 mr-2" /> Profile
								{/* <div onClick={() => navigate("dashboard/settings")}>
									<Lucide icon="User" className="w-4 h-4 mr-2" /> Profile
								</div> */}
							</DropdownItem>
							<DropdownItem className="hover:bg-white/5">
								<Lucide icon="Edit" className="w-4 h-4 mr-2" /> Add Account
							</DropdownItem>

							<DropdownItem className="hover:bg-white/5">
								<Lucide icon="HelpCircle" className="w-4 h-4 mr-2" /> Help
							</DropdownItem>
							<DropdownDivider className="border-white/[0.08]" />
						</DropdownContent>
					</DropdownMenu>
				</Dropdown>
				<button onClick={Logout} className="btn btn-primary mx-4">
					<Lucide icon="ToggleRight" className="w-4 h-4 mr-2" /> Logout
				</button>
				{/* END: Account Menu */}
			</div>
			{/* END: Top Bar */}
		</>
	);
}

export default Main;
