import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-[#EBF1F8] flex items-center justify-center p-4 sm:p-6 lg:p-10 font-outfit">
      {/* 2-Part Centered Card with Both-Side Space */}
      <div className="w-full max-w-[1100px] xl:max-w-[1160px] bg-white rounded-[26px] shadow-[0_20px_60px_-15px_rgba(15,23,42,0.14)] border border-gray-100 overflow-hidden flex flex-col lg:flex-row items-stretch min-h-[620px] lg:h-[670px]">
        {/* Left Side: Show Image with Brand Copy, Badges & Handwriting */}
        <div
          className="w-full lg:w-[53%] xl:w-[55%] bg-cover bg-center bg-no-repeat relative p-7 sm:p-10 lg:p-10 xl:p-12 flex flex-col justify-between overflow-hidden"
          style={{ backgroundImage: "url('/login_page.png')" }}
        >
          {/* Logo */}
          <div className="relative z-10 mb-4">
            <a href="/" className="inline-block">
              <img
                src="/Ignitoverse_Logo.png"
                alt="IgnitoVerse Online Learning Platform"
                className="h-9 sm:h-10 w-auto object-contain"
              />
            </a>
          </div>

          {/* Main Headline & Features */}
          <div className="relative z-10 space-y-3.5 max-w-[340px]">
            {/* Headline */}
            <h1 className="text-3xl xl:text-[38px] font-black text-[#0F172A] leading-[1.12] tracking-tight">
              Knowledge <br />
              Today <br />
              <span className="text-[#1D64F2]">A Brighter</span> <br />
              <span className="text-[#1D64F2]">Tomorrow</span>
            </h1>

            {/* Subheading */}
            <p className="text-xs sm:text-[13px] text-gray-600 font-normal leading-relaxed">
              Empowering institutions, educators, and learners with industry-recognized credentials.
            </p>

            {/* 3 Feature Pills */}
            <div className="space-y-2.5 pt-1">
              {/* 1. Trusted Learning */}
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-full bg-[#1D64F2] flex items-center justify-center text-white shadow-xs shrink-0">
                  <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM3.45 12.31L12 17l8.55-4.69V17c0 3.31-3.82 6-8.55 6s-8.55-2.69-8.55-6v-4.69z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs sm:text-[13px] font-bold text-[#0F172A] leading-tight">
                    Trusted Learning
                  </h4>
                  <p className="text-[11px] text-gray-500 font-normal">
                    Industry-recognized credentials
                  </p>
                </div>
              </div>

              {/* 2. Data-Driven Growth */}
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-full bg-[#1D64F2] flex items-center justify-center text-white shadow-xs shrink-0">
                  <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M5 19h2v-6H5v6zm4 0h2v-10H9v10zm4 0h2V5h-2v14zm4 0h2v-8h-2v8zm4 0h2v-4h-2v4z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs sm:text-[13px] font-bold text-[#0F172A] leading-tight">
                    Data-Driven Growth
                  </h4>
                  <p className="text-[11px] text-gray-500 font-normal">
                    Insights for better outcomes
                  </p>
                </div>
              </div>

              {/* 3. Secure & Scalable */}
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-full bg-[#1D64F2] flex items-center justify-center text-white shadow-xs shrink-0">
                  <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs sm:text-[13px] font-bold text-[#0F172A] leading-tight">
                    Secure & Scalable
                  </h4>
                  <p className="text-[11px] text-gray-500 font-normal">
                    Built for modern education
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Cursive Handwriting Slogan at Bottom Left */}
          <div className="relative z-10 pt-4 select-none">
            <div className="font-['Caveat',cursive] text-2xl text-gray-500 leading-tight">
              <span className="block italic">Skills for</span>
              <span className="italic relative inline-block">
                <span className="text-gray-400 font-sans text-xs mr-1 font-normal">a</span>
                Better Tomorrow
                <svg
                  className="w-full h-2 text-gray-400/90 mt-0.5"
                  viewBox="0 0 120 10"
                  fill="none"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M2 7C30 1.5 85 8.5 118 3"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Show Login Fields on Clean White Panel */}
        <div className="w-full lg:w-[47%] xl:w-[45%] bg-white flex flex-col justify-center p-6 sm:p-9 lg:p-10 relative">
          {children}
        </div>
      </div>

    </div>
  );
}
