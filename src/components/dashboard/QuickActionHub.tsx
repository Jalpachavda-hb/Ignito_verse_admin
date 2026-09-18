import React from "react";
import { Link } from "react-router";
import {
  BookOpenIcon,
  FolderMenuIcon,
  MedalAwardIcon,
  ZoomMeetingIcon,
  DesktopMonitorIcon,
  QuoteReviewIcon,
  UserCheckIcon,
  ListCheckIcon,
} from "../../icons/menuIcons";

export const QuickActionHub: React.FC = () => {
  const actions = [
    {
      title: "New Course",
      description: "Add microcredential course",
      icon: <BookOpenIcon className="h-5 w-5 text-brand-600 dark:text-brand-400" />,
      bg: "bg-brand-50 hover:bg-brand-100/80 dark:bg-brand-950/40 dark:hover:bg-brand-900/50",
      link: "/microcredential/course-add",
    },
    {
      title: "Add Module",
      description: "Curriculum topic group",
      icon: <FolderMenuIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
      bg: "bg-blue-50 hover:bg-blue-100/80 dark:bg-blue-950/40 dark:hover:bg-blue-900/50",
      link: "/microcredential/module-add",
    },
    {
      title: "Add Topic",
      description: "Video lecture or lesson",
      icon: <ListCheckIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />,
      bg: "bg-indigo-50 hover:bg-indigo-100/80 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50",
      link: "/microcredential/topic-add",
    },
    {
      title: "Create Quiz",
      description: "Degree assessment test",
      icon: <MedalAwardIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />,
      bg: "bg-amber-50 hover:bg-amber-100/80 dark:bg-amber-950/40 dark:hover:bg-amber-900/50",
      link: "/microcredential/quiz-add",
    },
    {
      title: "Zoom Meeting",
      description: "Schedule live class",
      icon: <ZoomMeetingIcon className="h-5 w-5 text-sky-600 dark:text-sky-400" />,
      bg: "bg-sky-50 hover:bg-sky-100/80 dark:bg-sky-950/40 dark:hover:bg-sky-900/50",
      link: "/zoom-meeting-list",
    },
    {
      title: "Google Meet",
      description: "Host virtual session",
      icon: <DesktopMonitorIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />,
      bg: "bg-emerald-50 hover:bg-emerald-100/80 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50",
      link: "/google-meet-list",
    },
    {
      title: "Testimonial",
      description: "Add student review",
      icon: <QuoteReviewIcon className="h-5 w-5 text-rose-600 dark:text-rose-400" />,
      bg: "bg-rose-50 hover:bg-rose-100/80 dark:bg-rose-950/40 dark:hover:bg-rose-900/50",
      link: "/website/testimonial-review-list",
    },
    {
      title: "Discussion Forum",
      description: "Student inquiries",
      icon: <UserCheckIcon className="h-5 w-5 text-teal-600 dark:text-teal-400" />,
      bg: "bg-teal-50 hover:bg-teal-100/80 dark:bg-teal-950/40 dark:hover:bg-teal-900/50",
      link: "/microcredential/common-discussion",
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900 md:p-6">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
          Quick Action Shortcuts
        </h3>
        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
          Fast workflows to create and publish content
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        {actions.map((act) => (
          <Link
            key={act.title}
            to={act.link}
            className={`group flex flex-col items-center justify-center rounded-xl p-3 text-center transition-all duration-200 hover:-translate-y-0.5 ${act.bg}`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm transition-transform duration-200 group-hover:scale-110 dark:bg-gray-800">
              {act.icon}
            </div>
            <span className="mt-2 text-xs font-semibold text-gray-800 dark:text-gray-200">
              {act.title}
            </span>
            <span className="mt-0.5 line-clamp-1 text-[10px] text-gray-500 dark:text-gray-400">
              {act.description}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickActionHub;
