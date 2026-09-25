import { useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "react-router";

// Icons from internal icons directory and custom menu icons
import {
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
} from "../icons";
import {
  BookOpenIcon,
  FolderMenuIcon,
  HelpCircleIcon,
  UserCheckIcon,
  MedalAwardIcon,
  TrendingUpIcon,
  WebsiteContentIcon,
  HomeMenuIcon,
  HandshakeIcon,
  QuoteReviewIcon,
  ZoomMeetingIcon,
  GoogleGIcon,
  DesktopMonitorIcon,
  ToolIcon,
} from "../icons/menuIcons";
import { useSidebar } from "../context/SidebarContext";

export type SubItem = {
  name: string;
  path: string;
  icon?: React.ReactNode;
  badge?: string | number;
};

export type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  badge?: string | number;
  subItems?: SubItem[];
};

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/",
  },
  {
    name: "Microcredential Course List",
    path: "/microcredential/course-list",
    icon: <BookOpenIcon className="w-5 h-5" />,
  },
  {
    name: "Microcredential Module List",
    path: "/microcredential/module-list",
    icon: <FolderMenuIcon className="w-5 h-5" />,
  },
  {
    name: "Common Discussion",
    icon: <UserCheckIcon className="w-5 h-5" />,
    path: "/microcredential/common-discussion",
    badge: "0",
  },
  {
    name: "Quizzes",
    icon: <MedalAwardIcon className="w-5 h-5" />,
    subItems: [
      {
        name: "Microcredential Quiz",
        path: "/microcredential/quiz",
        icon: <HelpCircleIcon className="w-4 h-4" />,
      },
      {
        name: "Microcredential Quiz Result",
        path: "/microcredential/quiz-result",
        icon: <TrendingUpIcon className="w-4 h-4" />,
      },
      // {
      //   name: "Microcredential Checkpoint Quiz",
      //   path: "/microcredential/checkpoint-quiz",
      //   icon: <MedalAwardIcon className="w-4 h-4" />,
      // },
      // {
      //   name: "Microcredential Checkpoint Quiz Report",
      //   path: "/microcredential/checkpoint-quiz-report",
      //   icon: <BarChartReportIcon className="w-4 h-4" />,
      // },
    ],
  },

  {
    icon: <WebsiteContentIcon className="w-5 h-5" />,
    name: "Website Content",
    subItems: [
      {
        name: "Home Page List",
        path: "/website/home-page-list",
        icon: <HomeMenuIcon className="w-4 h-4" />,
      },
      {
        name: "Trusted Logo List",
        path: "/website/trusted-logo-list",
        icon: <HandshakeIcon className="w-4 h-4" />,
      },
      {
        name: "Testimonial Review List",
        path: "/website/testimonial-review-list",
        icon: <QuoteReviewIcon className="w-4 h-4" />,
      },
    ],
  },
  {
    name: "Tool",
    icon: <ToolIcon className="w-5 h-5" />,
    subItems: [
      {
        name: "Zoom Meeting List",
        path: "/zoom-meeting-list",
        icon: <ZoomMeetingIcon className="w-4 h-4" />,
      },
      {
        name: "Google Calender List",
        path: "/google-calender-list",
        icon: <GoogleGIcon className="w-4 h-4" />,
      },
      {
        name: "Google Meet List",
        path: "/google-meet-list",
        icon: <DesktopMonitorIcon className="w-4 h-4" />,
      },
    ],
  },
];

const AppSidebar: React.FC = () => {
  const {
    isExpanded,
    isMobileOpen,
    isHovered,
    setIsHovered,
    toggleMobileSidebar,
  } = useSidebar();
  const location = useLocation();

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const isActive = useCallback(
    (path?: string) => (path ? location.pathname === path : false),
    [location.pathname]
  );

  const isParentActive = useCallback(
    (nav: NavItem): boolean => {
      if (!nav.subItems) return false;
      return nav.subItems.some((sub) => isActive(sub.path));
    },
    [isActive]
  );

  useEffect(() => {
    const activeParentIndex = navItems.findIndex((nav) =>
      nav.subItems?.some((subItem) => subItem.path && isActive(subItem.path))
    );
    if (activeParentIndex !== -1) {
      setOpenIndex(activeParentIndex);
    } else {
      setOpenIndex(null);
    }
  }, [location.pathname, isActive]);

  const handleToggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  const renderMenuItems = (items: NavItem[]) => (
    <ul className="flex flex-col gap-2">
      {items.map((nav, index) => {
        const isParentOpen = openIndex === index;
        const hasSubItems = Boolean(nav.subItems && nav.subItems.length > 0);
        const itemActive = nav.path ? isActive(nav.path) : false;

        return (
          <li key={nav.name}>
            {hasSubItems ? (
              <button
                onClick={() => handleToggle(index)}
                className={`menu-item group menu-item-inactive cursor-pointer ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "lg:justify-start"
                }`}
              >
                <span
                  className={`menu-item-icon-size ${
                    isParentActive(nav) || isParentOpen
                      ? "text-brand-500 dark:text-brand-400"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span
                    className={`menu-item-text ${
                      isParentActive(nav)
                        ? "font-semibold text-gray-900 dark:text-white"
                        : ""
                    }`}
                  >
                    {nav.name}
                  </span>
                )}
                {(isExpanded || isHovered || isMobileOpen) && (
                  <ChevronDownIcon
                    className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                      isParentOpen
                        ? "rotate-180 text-brand-500"
                        : "text-gray-400 group-hover:text-gray-500"
                    }`}
                  />
                )}
              </button>
            ) : (
              nav.path && (
                <Link
                  to={nav.path}
                  onClick={() => isMobileOpen && toggleMobileSidebar()}
                  className={`menu-item group ${
                    itemActive ? "menu-item-active" : "menu-item-inactive"
                  } ${
                    !isExpanded && !isHovered
                      ? "lg:justify-center"
                      : "lg:justify-start"
                  }`}
                >
                  <span
                    className={`menu-item-icon-size ${
                      itemActive
                        ? "menu-item-icon-active"
                        : "menu-item-icon-inactive"
                    }`}
                  >
                    {nav.icon}
                  </span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className="menu-item-text">{nav.name}</span>
                  )}
                  {(isExpanded || isHovered || isMobileOpen) &&
                    nav.badge !== undefined && (
                      <span className="ml-auto bg-error-500 text-white text-xs font-bold px-2 py-0.5 rounded-md min-w-[20px] text-center">
                        {nav.badge}
                      </span>
                    )}
                </Link>
              )
            )}

            {/* Submenu */}
            {hasSubItems &&
              isParentOpen &&
              (isExpanded || isHovered || isMobileOpen) && (
                <ul className="mt-1 space-y-1 ml-7">
                  {nav.subItems!.map((subItem) => (
                    <li key={subItem.name}>
                      <Link
                        to={subItem.path}
                        onClick={() => isMobileOpen && toggleMobileSidebar()}
                        className={`menu-dropdown-item flex items-center justify-between ${
                          isActive(subItem.path)
                            ? "menu-dropdown-item-active"
                            : "menu-dropdown-item-inactive"
                        }`}
                      >
                        <span className="flex items-center gap-2.5 truncate">
                          {subItem.icon && (
                            <span className="w-4 h-4 shrink-0 flex items-center justify-center">
                              {subItem.icon}
                            </span>
                          )}
                          <span className="truncate">{subItem.name}</span>
                        </span>
                        {subItem.badge !== undefined && (
                          <span className="ml-auto bg-error-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-md min-w-[20px] text-center shadow-xs">
                            {subItem.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${isExpanded || isMobileOpen
          ? "w-[290px]"
          : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
          }`}
      >
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <img
              src="/newlg.png"
              alt="Ignitoverse Logo"
              className="h-10 w-auto max-w-[190px] object-contain"
            />
          ) : (
            <img
              src="/fav.png"
              alt="Ignitoverse Icon"
              className="h-8 w-8 object-contain"
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              {renderMenuItems(navItems)}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
