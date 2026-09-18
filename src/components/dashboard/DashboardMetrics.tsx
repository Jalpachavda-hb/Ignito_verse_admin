import React from "react";
import { Link } from "react-router";
import {
  BookOpenIcon,
  FolderMenuIcon,
  MedalAwardIcon,
  ZoomMeetingIcon,
  UserCheckIcon,
  HandshakeIcon,
} from "../../icons/menuIcons";

export interface DashboardMetricsData {
  totalCourses: number;
  activeCourses: number;
  inactiveCourses: number;
  totalModules: number;
  totalQuizzes: number;
  activeQuizzes: number;
  totalZoomMeetings: number;
  totalGoogleMeets: number;
  totalQuizResults: number;
  totalTestimonials: number;
  totalLogos: number;
  totalBanners: number;
  totalDiscussions: number;
}

interface DashboardMetricsProps {
  metrics: DashboardMetricsData;
  loading: boolean;
}

export const DashboardMetrics: React.FC<DashboardMetricsProps> = ({ metrics, loading }) => {
  const cards = [
    {
      id: "courses",
      title: "Microcredential Courses",
      count: metrics.totalCourses,
      subtitle: `${metrics.activeCourses} Active · ${metrics.inactiveCourses} Inactive`,
      icon: <BookOpenIcon className="h-6 w-6 text-brand-500 dark:text-brand-400" />,
      iconBg: "bg-brand-50 dark:bg-brand-950/50",
      accentBorder: "hover:border-brand-300 dark:hover:border-brand-700",
      badge: "Core Content",
      badgeColor: "bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400",
      link: "/microcredential/course-list",
    },
    {
      id: "modules",
      title: "Curriculum Modules",
      count: metrics.totalModules,
      subtitle: `Structured into learning tracks`,
      icon: <FolderMenuIcon className="h-6 w-6 text-blue-500 dark:text-blue-400" />,
      iconBg: "bg-blue-50 dark:bg-blue-950/50",
      accentBorder: "hover:border-blue-300 dark:hover:border-blue-700",
      badge: "Structure",
      badgeColor: "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400",
      link: "/microcredential/module-list",
    },
    {
      id: "quizzes",
      title: "Quizzes & Assessments",
      count: metrics.totalQuizzes,
      subtitle: `${metrics.activeQuizzes} Active assessments`,
      icon: <MedalAwardIcon className="h-6 w-6 text-amber-500 dark:text-amber-400" />,
      iconBg: "bg-amber-50 dark:bg-amber-950/50",
      accentBorder: "hover:border-amber-300 dark:hover:border-amber-700",
      badge: "Assessments",
      badgeColor: "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400",
      link: "/microcredential/quiz",
    },
    {
      id: "live_meetings",
      title: "Live Virtual Sessions",
      count: metrics.totalZoomMeetings + metrics.totalGoogleMeets,
      subtitle: `${metrics.totalZoomMeetings} Zoom · ${metrics.totalGoogleMeets} Google Meet`,
      icon: <ZoomMeetingIcon className="h-6 w-6 text-emerald-500 dark:text-emerald-400" />,
      iconBg: "bg-emerald-50 dark:bg-emerald-950/50",
      accentBorder: "hover:border-emerald-300 dark:hover:border-emerald-700",
      badge: "Interactive",
      badgeColor: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400",
      link: "/zoom-meeting-list",
    },
    {
      id: "submissions",
      title: "Student Quiz Submissions",
      count: metrics.totalQuizResults,
      subtitle: `Completed student attempts`,
      icon: <UserCheckIcon className="h-6 w-6 text-purple-500 dark:text-purple-400" />,
      iconBg: "bg-purple-50 dark:bg-purple-950/50",
      accentBorder: "hover:border-purple-300 dark:hover:border-purple-700",
      badge: "Student Data",
      badgeColor: "bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400",
      link: "/microcredential/quiz-result",
    },
    {
      id: "website_assets",
      title: "Website Content & Assets",
      count: metrics.totalTestimonials + metrics.totalLogos + metrics.totalBanners,
      subtitle: `${metrics.totalTestimonials} Reviews · ${metrics.totalLogos} Logos · ${metrics.totalBanners} Banners`,
      icon: <HandshakeIcon className="h-6 w-6 text-rose-500 dark:text-rose-400" />,
      iconBg: "bg-rose-50 dark:bg-rose-950/50",
      accentBorder: "hover:border-rose-300 dark:hover:border-rose-700",
      badge: "Marketing",
      badgeColor: "bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400",
      link: "/website/testimonial-review-list",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
      {cards.map((card) => (
        <Link
          key={card.id}
          to={card.link}
          className={`group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-theme-md dark:border-gray-800 dark:bg-gray-900 ${card.accentBorder}`}
        >
          <div className="flex items-start justify-between">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110 ${card.iconBg}`}>
              {card.icon}
            </div>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${card.badgeColor}`}>
              {card.badge}
            </span>
          </div>

          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {card.title}
            </h3>
            <div className="mt-1 flex items-baseline gap-2">
              {loading ? (
                <div className="h-8 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-800"></div>
              ) : (
                <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                  {card.count.toLocaleString()}
                </span>
              )}
            </div>
            <p className="mt-1.5 flex items-center text-xs text-gray-500 dark:text-gray-400">
              {loading ? (
                <span className="h-3 w-36 animate-pulse rounded bg-gray-100 dark:bg-gray-800"></span>
              ) : (
                card.subtitle
              )}
            </p>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs font-medium text-gray-500 dark:border-gray-800/80 dark:text-gray-400">
            <span className="group-hover:text-brand-500 dark:group-hover:text-brand-400">Manage details</span>
            <svg
              className="h-4 w-4 transform transition-transform group-hover:translate-x-1 group-hover:text-brand-500 dark:group-hover:text-brand-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default DashboardMetrics;
