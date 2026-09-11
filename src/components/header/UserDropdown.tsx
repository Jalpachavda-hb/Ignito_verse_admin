import { useState, useEffect } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { Link, useNavigate } from "react-router";
import { getAdminProfile, logoutUser } from "../../services/authService";

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [admin, setAdmin] = useState(() => getAdminProfile());
  const navigate = useNavigate();

  useEffect(() => {
    setAdmin(getAdminProfile());
  }, [isOpen]);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  function handleSignOut() {
    closeDropdown();
    logoutUser();
    navigate("/signin", { replace: true });
  }

  const initials = `${admin.firstName?.[0] || "A"}${admin.lastName?.[0] || ""}`.toUpperCase();

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center text-gray-700 dropdown-toggle hover:opacity-85 transition-opacity cursor-pointer"
        aria-expanded={isOpen}
      >
        <span className="mr-3 overflow-hidden rounded-full h-11 w-11 border border-gray-200 bg-brand-50 flex items-center justify-center shrink-0">
          {admin.profileImage ? (
            <img
              src={admin.profileImage}
              alt={admin.firstName}
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          ) : (
            <span className="text-sm font-semibold text-brand-600">
              {initials}
            </span>
          )}
        </span>

        <span className="block mr-1 font-medium text-theme-sm text-gray-800">
          {admin.firstName || "Admin"}
        </span>
        <svg
          className={`stroke-gray-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          width="18"
          height="20"
          viewBox="0 0 18 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-[17px] flex w-[280px] flex-col rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-lg z-50 animate-fadeIn"
      >
        {/* Admin Header Info */}
        <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
          <div className="h-12 w-12 rounded-full overflow-hidden border border-gray-200 bg-brand-50 flex items-center justify-center shrink-0">
            {admin.profileImage ? (
              <img
                src={admin.profileImage}
                alt={admin.firstName}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            ) : (
              <span className="text-base font-bold text-brand-600">
                {initials}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-gray-800 text-sm truncate">
              {admin.firstName} {admin.lastName}
            </h4>
            <span className="inline-block mt-0.5 px-2 py-0.5 text-[11px] font-semibold text-brand-600 bg-brand-50 border border-brand-100 rounded-full">
              {admin.adminRoleName || "Administrator"}
            </span>
          </div>
        </div>

        {/* Basic Details List */}
        <div className="py-3 border-b border-gray-100 space-y-2 text-xs text-gray-600">
          <div className="flex items-center gap-2 truncate">
            <svg className="size-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="truncate text-gray-700" title={admin.emailId || "admin@ignitoverse.com"}>
              {admin.emailId || "admin@ignitoverse.com"}
            </span>
          </div>
          {admin.mobileNumber && (
            <div className="flex items-center gap-2 truncate">
              <svg className="size-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span className="truncate text-gray-700">{admin.mobileNumber}</span>
            </div>
          )}
        </div>

        {/* Action Options: Profile & Sign Out */}
        <div className="pt-2 space-y-1">
          <Link
            to="/profile"
            onClick={closeDropdown}
            className="flex items-center gap-2.5 px-3 py-2 text-theme-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="size-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>View Profile</span>
          </Link>

          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-theme-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
          >
            <svg className="size-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Sign Out</span>
          </button>
        </div>
      </Dropdown>
    </div>
  );
}
