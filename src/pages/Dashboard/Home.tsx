import { useState, useEffect, useCallback } from "react";
import PageMeta from "../../components/common/PageMeta";
import {
  DashboardHeader,
  DashboardMetrics,
  CourseDistributionChart,
  CurriculumStructureChart,
  LiveSessionsChart,
  RecentCoursesTable,
  RecentQuizSubmissionsTable,
  UpcomingSessionsCard,
  QuickActionHub,
} from "../../components/dashboard";
import { DashboardMetricsData } from "../../components/dashboard/DashboardMetrics";

// APIs and Services
import {
  adminMicrocredentialCourseList,
  microcredentialModuleMasterList,
  adminGetMicroCourseManyDiscussionForumQuestionsList,
} from "../../services/adminMicrocredentialService";
import { fetchPaginatedMicrocredentialQuizList } from "../../services/AdminQuizPageService";
import { fetchMicrocredentialQuizStudentResultList } from "../../services/microcredentialQuizResultService";
import { getZoomMeetingList } from "../../services/microcredentialZoomService";
import { getGoogleMeetList } from "../../services/microcredentialGoogleMeetService";
import { getGoogleCalendarEventList } from "../../services/microcredentialGoogleCalendarService";
import {
  getTestimonialReviewList,
  getAdminHomePageList,
} from "../../services/AdminHomePageServices";
import { getTrustedByLogoList } from "../../services/trustedByLogoService";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Real data state collections
  const [courses, setCourses] = useState<any[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [quizResults, setQuizResults] = useState<any[]>([]);
  const [zoomMeetings, setZoomMeetings] = useState<any[]>([]);
  const [googleMeets, setGoogleMeets] = useState<any[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);

  // Calculated Metrics
  const [metrics, setMetrics] = useState<DashboardMetricsData>({
    totalCourses: 0,
    activeCourses: 0,
    inactiveCourses: 0,
    totalModules: 0,
    totalQuizzes: 0,
    activeQuizzes: 0,
    totalZoomMeetings: 0,
    totalGoogleMeets: 0,
    totalQuizResults: 0,
    totalTestimonials: 0,
    totalLogos: 0,
    totalBanners: 0,
    totalDiscussions: 0,
  });

  const fetchDashboardData = useCallback(async () => {
    try {
      const results = await Promise.allSettled([
        adminMicrocredentialCourseList(1, 100, "MicrocredentialCourseId", "DESC", 0, 1, ""),
        microcredentialModuleMasterList(1, 100, "UpdatedOn", "DESC", "", 1),
        fetchPaginatedMicrocredentialQuizList({ pageNo: 1, pageSize: 100 }),
        fetchMicrocredentialQuizStudentResultList({ pageNo: 1, pageSize: 50 }),
        getZoomMeetingList({ pageNo: 1, pageSize: 50 }),
        getGoogleMeetList({ pageNo: 1, pageSize: 50 }),
        getGoogleCalendarEventList({ pageNo: 1, pageSize: 50 }),
        getTestimonialReviewList(1, 50),
        getTrustedByLogoList({ pageNo: 1, pageSize: 50 }),
        getAdminHomePageList(1, 50),
        adminGetMicroCourseManyDiscussionForumQuestionsList(1, 50, "CreatedOn", "DESC", 0, 1, ""),
      ]);

      // 1. Courses
      let fetchedCourses: any[] = [];
      let totalCoursesCount = 0;
      if (results[0].status === "fulfilled") {
        const val = results[0].value as any;
        if (val && val.success !== false) {
          fetchedCourses =
            val.microcredentialCourseOutPutList ||
            val.MicrocredentialCourseOutPutList ||
            val.data ||
            [];
          totalCoursesCount = val.pageDetail?.totalRecords || fetchedCourses.length;
        }
      }
      setCourses(fetchedCourses);

      // Active vs Inactive course calculation
      const activeCourses = fetchedCourses.filter((c: any) => {
        const s = String(c.courseStatus || "").toLowerCase();
        return s === "active" || s === "1" || !c.courseStatus;
      }).length;
      const inactiveCourses = Math.max(0, fetchedCourses.length - activeCourses);

      // 2. Modules
      let fetchedModules: any[] = [];
      let totalModulesCount = 0;
      if (results[1].status === "fulfilled") {
        const val = results[1].value as any;
        if (val && val.success !== false) {
          fetchedModules =
            val.microcredentialModuleMasterList ||
            val.MicrocredentialModuleMasterList ||
            val.moduleList ||
            val.data ||
            [];
          totalModulesCount = val.pageDetail?.totalRecords || fetchedModules.length;
        }
      }
      setModules(fetchedModules);

      // 3. Quizzes
      let fetchedQuizzes: any[] = [];
      let totalQuizzesCount = 0;
      let activeQuizzesCount = 0;
      if (results[2].status === "fulfilled") {
        const val = results[2].value as any;
        if (val && val.success !== false) {
          fetchedQuizzes =
            val.mainDegreeQuizOutputList ||
            val.quizList ||
            val.degreeQuizList ||
            val.data ||
            [];
          totalQuizzesCount = val.pageDetail?.totalRecords || fetchedQuizzes.length;
          activeQuizzesCount = fetchedQuizzes.filter((q: any) => q.isActive !== false).length;
        }
      }
      setQuizzes(fetchedQuizzes);

      // 4. Student Quiz Results
      let fetchedResults: any[] = [];
      let totalResultsCount = 0;
      if (results[3].status === "fulfilled") {
        const val = results[3].value as any;
        if (val) {
          fetchedResults = val.studentResultList || val.quizStudentResultList || val.data || [];
          totalResultsCount = val.totalRecords || fetchedResults.length;
        }
      }
      setQuizResults(fetchedResults);

      // 5. Zoom Meetings
      let fetchedZoom: any[] = [];
      let totalZoomCount = 0;
      if (results[4].status === "fulfilled") {
        const val = results[4].value as any;
        if (val && val.isSuccess !== false) {
          fetchedZoom = val.zoomMeetingOutputList || val.data || [];
          totalZoomCount = val.pageDetail?.totalRecords || fetchedZoom.length;
        }
      }
      setZoomMeetings(fetchedZoom);

      // 6. Google Meet
      let fetchedMeet: any[] = [];
      let totalMeetCount = 0;
      if (results[5].status === "fulfilled") {
        const val = results[5].value as any;
        if (val && val.isSuccess !== false) {
          fetchedMeet = val.googleMeetList || val.data || [];
          totalMeetCount = val.pageDetail?.totalRecords || fetchedMeet.length;
        }
      }
      setGoogleMeets(fetchedMeet);

      // 7. Google Calendar Events
      let fetchedCalendar: any[] = [];
      if (results[6].status === "fulfilled") {
        const val = results[6].value as any;
        if (val && val.isSuccess !== false) {
          fetchedCalendar = val.googleCalenderEventList || val.calendarEventList || val.data || [];
        }
      }
      setCalendarEvents(fetchedCalendar);

      // 8. Testimonials
      let totalTestimonialsCount = 0;
      if (results[7].status === "fulfilled") {
        const val = results[7].value as any;
        if (val && val.success !== false) {
          const list = val.testimonialReviewList || val.testimonialList || val.data || [];
          totalTestimonialsCount = val.pageDetail?.totalRecords || list.length;
        }
      }

      // 9. Trusted Partner Logos
      let totalLogosCount = 0;
      if (results[8].status === "fulfilled") {
        const val = results[8].value as any;
        if (val && val.success !== false) {
          const list = val.trustedByLogoList || val.logoList || val.data || [];
          totalLogosCount = val.pageDetail?.totalRecords || list.length;
        }
      }

      // 10. Homepage Banners
      let totalBannersCount = 0;
      if (results[9].status === "fulfilled") {
        const val = results[9].value as any;
        if (val && val.success !== false) {
          const list = val.homePageList || val.data || [];
          totalBannersCount = val.pageDetail?.totalRecords || list.length;
        }
      }

      // 11. Discussion Forum Questions
      let totalDiscussionsCount = 0;
      if (results[10].status === "fulfilled") {
        const val = results[10].value as any;
        if (val && val.success !== false) {
          const list = val.getMicroCourseManyDiscussionForumQuestions || val.data || [];
          totalDiscussionsCount = val.pageDetail?.totalRecords || list.length;
        }
      }

      // Update Aggregated Metrics
      setMetrics({
        totalCourses: totalCoursesCount || fetchedCourses.length,
        activeCourses: activeCourses || fetchedCourses.length,
        inactiveCourses,
        totalModules: totalModulesCount || fetchedModules.length,
        totalQuizzes: totalQuizzesCount || fetchedQuizzes.length,
        activeQuizzes: activeQuizzesCount || fetchedQuizzes.length,
        totalZoomMeetings: totalZoomCount || fetchedZoom.length,
        totalGoogleMeets: totalMeetCount || fetchedMeet.length,
        totalQuizResults: totalResultsCount || fetchedResults.length,
        totalTestimonials: totalTestimonialsCount,
        totalLogos: totalLogosCount,
        totalBanners: totalBannersCount,
        totalDiscussions: totalDiscussionsCount,
      });

      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  return (
    <>
      <PageMeta
        title="Dashboard & Analytics | Ignito Verse Admin"
        description="Comprehensive real-time analytics, course management, quizzes, live classrooms, and portal statistics for Ignito Verse Admin."
      />

      <div className="space-y-6 pb-8">
        {/* Top Welcome & Live Refresh Header */}
        <DashboardHeader
          lastUpdated={lastUpdated}
          loading={loading || refreshing}
          onRefresh={handleManualRefresh}
        />

        {/* Quick Action Shortcuts Hub */}
        <QuickActionHub />

        {/* Core KPI Metrics Grid */}
        <DashboardMetrics metrics={metrics} loading={loading} />

        {/* Interactive Charts Row 1: Course Distribution & Curriculum Depth */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <CourseDistributionChart courses={courses} loading={loading} />
          </div>

          <div className="lg:col-span-7">
            <CurriculumStructureChart
              courses={courses}
              modules={modules}
              quizzes={quizzes}
              loading={loading}
            />
          </div>
        </div>

        {/* Live Virtual Sessions Timeline */}
        <LiveSessionsChart
          zoomMeetings={zoomMeetings}
          googleMeets={googleMeets}
          calendarEvents={calendarEvents}
          loading={loading}
        />

        {/* Data Tables & Upcoming Feed Row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column: Recent Courses & Recent Submissions */}
          <div className="space-y-6 lg:col-span-8">
            <RecentCoursesTable courses={courses} loading={loading} />
            <RecentQuizSubmissionsTable quizResults={quizResults} loading={loading} />
          </div>

          {/* Right Column: Upcoming Sessions Card & Portal Summary */}
          <div className="space-y-6 lg:col-span-4">
            <UpcomingSessionsCard
              zoomMeetings={zoomMeetings}
              googleMeets={googleMeets}
              loading={loading}
            />

            {/* Quick Content Summary Card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900 md:p-6">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Platform Content Summary
              </h3>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                Marketing assets & student feedback status
              </p>

              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between rounded-xl bg-gray-50 p-3 dark:bg-gray-800/60">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Student Testimonials
                  </span>
                  <span className="rounded-md bg-white px-2 py-0.5 text-xs font-bold text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white">
                    {metrics.totalTestimonials}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-gray-50 p-3 dark:bg-gray-800/60">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Partner & University Logos
                  </span>
                  <span className="rounded-md bg-white px-2 py-0.5 text-xs font-bold text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white">
                    {metrics.totalLogos}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-gray-50 p-3 dark:bg-gray-800/60">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Active Homepage Banners
                  </span>
                  <span className="rounded-md bg-white px-2 py-0.5 text-xs font-bold text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white">
                    {metrics.totalBanners}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-gray-50 p-3 dark:bg-gray-800/60">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Discussion Forum Threads
                  </span>
                  <span className="rounded-md bg-white px-2 py-0.5 text-xs font-bold text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white">
                    {metrics.totalDiscussions}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
