/** @format */

import React from "react";
import logoUrl from "@/assets/images/logo.png";
import { Link } from "react-router-dom";
import { APP_NAME } from "../../utils/constants";

const Footer = () => {
  return (
    <footer className="bg-darkmode-600 text-white py-8 px-6">
      {/* Logo and Name */}
      <div className="flex items-center justify-center md:justify-start mb-6">
        <img alt={APP_NAME} className="w-10 h-10" src={logoUrl} />
        <span className="text-lg font-semibold ml-3">{APP_NAME}</span>
      </div>

      {/* Footer Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center md:text-left">
        <ul className="space-y-2">
          <li className="font-semibold">Terms of Operation</li>
          <li>
            <Link to="/">Terms & Condition</Link>
          </li>
          <li>
            <Link to="/">Privacy Policy</Link>
          </li>
          <li>
            <Link to="/">Company Policy</Link>
          </li>
          <li>
            <Link to="/">CopyRight & Trademark</Link>
          </li>
          <li>
            <Link to="/">Terms of Use</Link>
          </li>
        </ul>

        <ul className="space-y-2">
          <li className="font-semibold">Learn More</li>
          <li>
            <Link to="/">Reviews</Link>
          </li>
          <li>
            <Link to="/">Privacy Policy</Link>
          </li>
          <li>
            <Link to="/">Giving Back</Link>
          </li>
          <li>
            <Link to="/">Career</Link>
          </li>
          <li>
            <Link to="/">Our Story</Link>
          </li>
        </ul>

        <ul className="space-y-2">
          <li className="font-semibold">Contact</li>
          <li>
            <Link to="/">Contact Us</Link>
          </li>
          <li>
            <Link to="/">Help & FAQ</Link>
          </li>
          <li>
            <Link to="/">Careers</Link>
          </li>
          <li>
            <Link to="/">Offers</Link>
          </li>
        </ul>

        <ul className="space-y-2">
          <li className="font-semibold">Connect</li>
          <li>
            <Link to="/donate">Donate</Link>
          </li>
          <li>
            <Link to="/">Twitter</Link>
          </li>
          <li>
            <Link to="/">Facebook</Link>
          </li>
          <li>
            <Link to="/">Instagram</Link>
          </li>
          <li>
            <Link to="/">Pinterest</Link>
          </li>
          <li>
            <Link to="/">LinkedIn</Link>
          </li>
        </ul>
      </div>

      {/* Footer Bottom */}
      <div className="mt-6 border-t border-gray-500 pt-4 text-center">
        <small>
          {APP_NAME} &copy; {new Date().getFullYear()} All Rights Reserved
        </small>

        {/* Social Media Icons */}
        <div className="flex justify-center mt-4 space-x-4">
          <Link to="/">
            <svg width="30" height="30" viewBox="0 0 30 30" fill="white">
              <circle cx="15" cy="15" r="15" fill="#000000" />
            </svg>
          </Link>
          <Link to="/">
            <svg width="30" height="30" viewBox="0 0 30 30" fill="white">
              <circle cx="15" cy="15" r="15" fill="#000000" />
            </svg>
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
