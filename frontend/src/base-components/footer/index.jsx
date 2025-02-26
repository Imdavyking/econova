/** @format */

import React from "react";
import logoUrl from "@/assets/images/logo.png";
import { Link } from "react-router-dom";
import { APP_NAME } from "../../utils/constants";
import AddTokenButton from "../../components/add-token-btn/Main";

const Footer = () => {
  return (
    <footer className="bg-darkmode-600 text-white py-8 px-6">
      <div className="flex items-center justify-center md:justify-start mb-6">
        <AddTokenButton />
      </div>
      {/* Logo and Name */}
      <div className="flex items-center justify-center md:justify-start mb-6">
        <img alt={APP_NAME} className="w-10 h-10" src={logoUrl} />
        <span className="text-lg font-semibold ml-3">{APP_NAME}</span>
      </div>

      {/* Footer Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center md:text-left">
        <ul className="space-y-2">
          <li className="font-semibold">Product & Charity</li>
          <li>
            <Link to="/donate">Donate</Link>
          </li>
          <li>
            <Link to="/bridge">Bridge</Link>
          </li>
          <li>
            <Link to="/tx-analysis">Tx Analysis</Link>
          </li>
        </ul>

        <ul className="space-y-2">
          <li className="font-semibold">AI Tools</li>
          <li>
            <Link to="/ai-health">AI Health Advisor</Link>
          </li>
          <li>
            <Link to="/ai-tutor">AI Tutor</Link>
          </li>
          <li>
            <Link to="/ai-audit">AI Audit</Link>
          </li>
          <li>
            <Link to="/ai-investment">AI Investment</Link>
          </li>
        </ul>

        <ul className="space-y-2">
          <li className="font-semibold">Legal & Socials</li>
          <li>
            <Link to="https://x.com/EcoNova_Bot" target="_blank">
              Twitter
            </Link>
          </li>
          <li>
            <Link to="/">Terms & Condition</Link>
          </li>
          <li>
            <Link to="https://econovadocs.vercel.app/" target="_blank">
              Docs
            </Link>
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
            <svg
              width="30"
              height="30"
              viewBox="0 0 30 30"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="15" cy="15" r="15" fill="#000000" />
              <path
                d="M18.334 9.66675H11.6673C9.66732 9.66675 8.33398 11.0001 8.33398 13.0001V17.0001C8.33398 19.0001 9.66732 20.3334 11.6673 20.3334H18.334C20.334 20.3334 21.6673 19.0001 21.6673 17.0001V13.0001C21.6673 11.0001 20.334 9.66675 18.334 9.66675ZM16.2607 15.6867L14.614 16.6734C13.9473 17.0734 13.4006 16.7668 13.4006 15.9868V14.0068C13.4006 13.2268 13.9473 12.9201 14.614 13.3201L16.2607 14.3067C16.894 14.6934 16.894 15.3067 16.2607 15.6867Z"
                fill="white"
              />
            </svg>
          </Link>
          <Link to="/">
            <svg
              width="30"
              height="30"
              viewBox="0 0 30 30"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="15" cy="15" r="15" fill="#000000" />
              <path
                opacity="0.4"
                d="M17.794 8.33325H12.2073C9.78065 8.33325 8.33398 9.77992 8.33398 12.2066V17.7866C8.33398 20.2199 9.78065 21.6666 12.2073 21.6666H17.7873C20.214 21.6666 21.6607 20.2199 21.6607 17.7933V12.2066C21.6673 9.77992 20.2207 8.33325 17.794 8.33325Z"
                fill="white"
              />
              <path
                d="M21.2007 15.1533H18.8807C18.2273 15.1533 17.6473 15.5133 17.354 16.1L16.794 17.2067C16.6607 17.4733 16.394 17.64 16.1007 17.64H13.914C13.7073 17.64 13.414 17.5933 13.2207 17.2067L12.6607 16.1067C12.3673 15.5267 11.7807 15.16 11.134 15.16H8.80065C8.54065 15.16 8.33398 15.3667 8.33398 15.6267V17.8C8.33398 20.22 9.78732 21.6667 12.214 21.6667H17.8007C20.0873 21.6667 21.494 20.4133 21.6673 18.1867V15.62C21.6673 15.3667 21.4607 15.1533 21.2007 15.1533Z"
                fill="white"
              />
            </svg>
          </Link>
          <Link to="/">
            <svg
              width="30"
              height="30"
              viewBox="0 0 30 30"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="15" cy="15" r="15" fill="#000000" />
              <path
                d="M21.6673 17.7933C21.6673 20.2199 20.2207 21.6666 17.794 21.6666H17.0007C16.634 21.6666 16.334 21.3666 16.334 20.9999V17.1533C16.334 16.9733 16.4806 16.8199 16.6606 16.8199L17.834 16.7999C17.9273 16.7933 18.0073 16.7266 18.0273 16.6333L18.2607 15.3599C18.2807 15.2399 18.1873 15.1266 18.0606 15.1266L16.6406 15.1466C16.454 15.1466 16.3073 14.9999 16.3007 14.8199L16.274 13.1866C16.274 13.0799 16.3606 12.9866 16.474 12.9866L18.074 12.9599C18.1873 12.9599 18.274 12.8733 18.274 12.7599L18.2473 11.1599C18.2473 11.0466 18.1607 10.9599 18.0473 10.9599L16.2473 10.9866C15.1406 11.0066 14.2607 11.9133 14.2807 13.0199L14.314 14.8533C14.3207 15.0399 14.174 15.1866 13.9873 15.1933L13.1873 15.2066C13.074 15.2066 12.9873 15.2932 12.9873 15.4066L13.0073 16.6733C13.0073 16.7866 13.094 16.8733 13.2073 16.8733L14.0073 16.8599C14.194 16.8599 14.3406 17.0066 14.3473 17.1866L14.4073 20.9866C14.414 21.3599 14.114 21.6666 13.7406 21.6666H12.2073C9.78065 21.6666 8.33398 20.2199 8.33398 17.7866V12.2066C8.33398 9.77992 9.78065 8.33325 12.2073 8.33325H17.794C20.2207 8.33325 21.6673 9.77992 21.6673 12.2066V17.7933Z"
                fill="white"
              />
            </svg>
          </Link>
          <Link to="/">
            <svg
              width="30"
              height="30"
              viewBox="0 0 30 30"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="15" cy="15" r="15" fill="#000000" />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M21.6659 11.3001C21.3213 11.7595 20.9049 12.1602 20.4326 12.4868C20.4326 12.6068 20.4326 12.7268 20.4326 12.8535C20.4344 13.9323 20.2217 15.0007 19.8067 15.9965C19.3916 16.9922 18.7827 17.8955 18.0152 18.6537C17.2477 19.4119 16.3371 20.0098 15.3363 20.4126C14.3355 20.8154 13.2646 21.0152 12.1859 21.0001C10.9262 21.0043 9.6826 20.7168 8.55256 20.1601C8.52275 20.1471 8.4974 20.1257 8.47963 20.0984C8.46186 20.0712 8.45245 20.0393 8.45256 20.0068V19.9335C8.45256 19.8875 8.47082 19.8434 8.50333 19.8109C8.53584 19.7784 8.57992 19.7601 8.6259 19.7601C9.86416 19.7193 11.0583 19.2902 12.0392 18.5335C11.49 18.5224 10.9552 18.3563 10.4963 18.0543C10.0374 17.7524 9.6733 17.3268 9.4459 16.8268C9.43437 16.7994 9.43009 16.7695 9.43346 16.7399C9.43683 16.7104 9.44775 16.6822 9.46516 16.6581C9.48256 16.634 9.50588 16.6148 9.53286 16.6023C9.55984 16.5898 9.58959 16.5845 9.61923 16.5868C9.95987 16.621 10.3039 16.5893 10.6326 16.4935C10.0295 16.3683 9.48185 16.0549 9.06848 15.5984C8.6551 15.1419 8.39741 14.5659 8.33256 13.9535C8.33024 13.9238 8.33558 13.8941 8.34807 13.8671C8.36056 13.8401 8.37978 13.8168 8.40388 13.7994C8.42798 13.782 8.45616 13.7711 8.4857 13.7677C8.51524 13.7643 8.54515 13.7686 8.57256 13.7801C8.90459 13.9266 9.26302 14.0037 9.6259 14.0068C9.09871 13.6609 8.70093 13.1502 8.49468 12.5544C8.28844 11.9586 8.28535 11.3112 8.4859 10.7135C8.50682 10.6547 8.54264 10.6025 8.58984 10.5617C8.63703 10.521 8.694 10.4932 8.75515 10.4812C8.8163 10.4691 8.87954 10.473 8.93869 10.4927C8.99784 10.5124 9.05086 10.5471 9.09256 10.5935C10.5556 12.1498 12.5657 13.0772 14.6992 13.1801C14.6446 12.9622 14.6177 12.7382 14.6192 12.5135C14.629 11.9374 14.8097 11.3771 15.1385 10.904C15.4673 10.4308 15.9293 10.0661 16.4659 9.85602C17.0024 9.64598 17.5893 9.60014 18.1519 9.72431C18.7146 9.84849 19.2276 10.1371 19.6259 10.5535C20.1812 10.4477 20.718 10.2613 21.2192 10.0001C21.2372 9.98889 21.258 9.98294 21.2792 9.98294C21.3004 9.98294 21.3212 9.98889 21.3392 10.0001C21.3505 10.0181 21.3564 10.0389 21.3564 10.0601C21.3564 10.0813 21.3505 10.1021 21.3392 10.1201C21.0964 10.6759 20.6863 11.142 20.1659 11.4535C20.6216 11.4006 21.0692 11.2932 21.4992 11.1335C21.5169 11.1214 21.5378 11.115 21.5592 11.115C21.5806 11.115 21.6015 11.1214 21.6192 11.1335C21.6342 11.1403 21.6475 11.1503 21.6582 11.1629C21.6689 11.1754 21.6768 11.1901 21.6812 11.206C21.6857 11.2218 21.6866 11.2385 21.684 11.2547C21.6813 11.271 21.6751 11.2865 21.6659 11.3001Z"
                fill="white"
              />
            </svg>
          </Link>
          <Link to="/">
            <svg
              width="30"
              height="30"
              viewBox="0 0 30 30"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="15" cy="15" r="15" fill="#000000" />
              <path
                d="M12.0007 13.3333V20C12.0007 20.0884 11.9655 20.1732 11.903 20.2357C11.8405 20.2982 11.7557 20.3333 11.6673 20.3333H10.0007C9.91225 20.3333 9.82746 20.2982 9.76495 20.2357C9.70244 20.1732 9.66732 20.0884 9.66732 20V13.3333C9.66732 13.2449 9.70244 13.1601 9.76495 13.0976C9.82746 13.0351 9.91225 13 10.0007 13H11.6673C11.7557 13 11.8405 13.0351 11.903 13.0976C11.9655 13.1601 12.0007 13.2449 12.0007 13.3333ZM21.0007 15.94C21.0118 15.2394 20.7832 14.556 20.3528 14.0031C19.9224 13.4502 19.3159 13.061 18.634 12.9C18.17 12.8001 17.6888 12.8127 17.2307 12.9368C16.7725 13.0609 16.3508 13.2929 16.0007 13.6133V13.3333C16.0007 13.2449 15.9655 13.1601 15.903 13.0976C15.8405 13.0351 15.7557 13 15.6673 13H14.0007C13.9122 13 13.8275 13.0351 13.7649 13.0976C13.7024 13.1601 13.6673 13.2449 13.6673 13.3333V20C13.6673 20.0884 13.7024 20.1732 13.7649 20.2357C13.8275 20.2982 13.9122 20.3333 14.0007 20.3333H15.6673C15.7557 20.3333 15.8405 20.2982 15.903 20.2357C15.9655 20.1732 16.0007 20.0884 16.0007 20V16.24C15.9927 15.9156 16.0992 15.5989 16.3016 15.3453C16.504 15.0917 16.7893 14.9175 17.1073 14.8533C17.3004 14.82 17.4984 14.8296 17.6874 14.8815C17.8763 14.9335 18.0515 15.0264 18.2004 15.1537C18.3494 15.281 18.4684 15.4395 18.5491 15.6181C18.6298 15.7966 18.6702 15.9908 18.6673 16.1867V20C18.6673 20.0884 18.7024 20.1732 18.7649 20.2357C18.8275 20.2982 18.9122 20.3333 19.0007 20.3333H20.6673C20.7557 20.3333 20.8405 20.2982 20.903 20.2357C20.9655 20.1732 21.0007 20.0884 21.0007 20V15.94ZM10.6673 9C10.4036 9 10.1458 9.0782 9.92656 9.22471C9.70729 9.37122 9.5364 9.57945 9.43548 9.82309C9.33456 10.0667 9.30816 10.3348 9.3596 10.5935C9.41105 10.8521 9.53804 11.0897 9.72451 11.2761C9.91098 11.4626 10.1486 11.5896 10.4072 11.641C10.6658 11.6925 10.9339 11.6661 11.1776 11.5652C11.4212 11.4643 11.6294 11.2934 11.7759 11.0741C11.9225 10.8548 12.0007 10.597 12.0007 10.3333C12.0007 9.97971 11.8602 9.64057 11.6101 9.39052C11.3601 9.14048 11.0209 9 10.6673 9Z"
                fill="white"
              />
            </svg>
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
