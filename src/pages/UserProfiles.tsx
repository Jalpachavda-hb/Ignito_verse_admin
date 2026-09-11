import { useState, useEffect } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import { getAdminProfile } from "../services/authService";

export default function UserProfiles() {
  const [admin, setAdmin] = useState(() => getAdminProfile());

  useEffect(() => {
    setAdmin(getAdminProfile());
  }, []);

  const initials = `${admin.firstName?.[0] || "A"}${admin.lastName?.[0] || ""}`.toUpperCase();

  return (
    <>
      <PageMeta
        title="Admin Profile | IgnitoVerse Admin"
        description="Administrator Profile details and credentials"
      />
      <PageBreadcrumb pageTitle="Admin Profile" />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-7 shadow-theme-xs space-y-6">
        {/* Top Header Card */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-6 border-b border-gray-100">
          <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-brand-100 bg-brand-50 flex items-center justify-center shrink-0 shadow-sm">
            {admin.profileImage ? (
              <img
                src={admin.profileImage}
                alt={`${admin.firstName} ${admin.lastName}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            ) : (
              <span className="text-3xl font-bold text-brand-600">
                {initials}
              </span>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-1.5">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                {admin.firstName} {admin.lastName}
              </h2>
              <span className="inline-flex items-center justify-center self-center sm:self-auto px-3 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200">
                {admin.adminRoleName || "Administrator"}
              </span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-200 text-xs text-gray-600 mt-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Active Administrator Account</span>
            </div>
          </div>
        </div>

        {/* Basic Information Grid (Read-Only) */}
        <div>
          <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="size-4.5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>Basic Administrator Details</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
            {/* First Name */}
            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50">
              <span className="block text-xs font-medium text-gray-500 mb-1">
                First Name
              </span>
              <span className="block text-sm font-semibold text-gray-900">
                {admin.firstName || "—"}
              </span>
            </div>

            {/* Last Name */}
            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50">
              <span className="block text-xs font-medium text-gray-500 mb-1">
                Last Name
              </span>
              <span className="block text-sm font-semibold text-gray-900">
                {admin.lastName || "—"}
              </span>
            </div>

            {/* Email ID */}
            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50">
              <span className="block text-xs font-medium text-gray-500 mb-1">
                Email Address
              </span>
              <div className="flex items-center gap-2">
                <svg className="size-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-semibold text-gray-900 break-all">
                  {admin.emailId || "—"}
                </span>
              </div>
            </div>

            {/* Mobile Number */}
            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50">
              <span className="block text-xs font-medium text-gray-500 mb-1">
                Mobile Number
              </span>
              <div className="flex items-center gap-2">
                <svg className="size-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-sm font-semibold text-gray-900">
                  {admin.mobileNumber || "—"}
                </span>
              </div>
            </div>

            {/* Admin Role Name */}
            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 md:col-span-2">
              <span className="block text-xs font-medium text-gray-500 mb-1">
                Admin Role
              </span>
              <div className="flex items-center gap-2">
                <svg className="size-4 text-brand-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="text-sm font-semibold text-gray-900">
                  {admin.adminRoleName || "Administrator"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Read-Only Notice */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-blue-700">
          <svg className="size-4 text-blue-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            Profile details are verified credentials synchronized from the administration server and are read-only.
          </div>
        </div>
      </div>
    </>
  );
}
