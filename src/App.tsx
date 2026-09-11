import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import PlaceholderPage from "./pages/PlaceholderPage";
import TestimonialList from "./components/testimonial/TestimonialList";
import AddTestimonialReview from "./components/testimonial/AddTestimonialReview";
import EditTestimonialReview from "./components/testimonial/EditTestimonialReview";
import LogoList from "./components/TrustedLogo/LogoList";
import HeroSectionList from "./components/hompage/HerosectionList";
import {
  MicrocredentialCourse,
  AddMicrocredentialCourse,
  EditMicrocredentialCourse,
} from "./components/MicrocredentialCourse";
import {
  MicrocredentialModuleList,
  AddEditMicrocredentialModule,
} from "./components/MicrocredentialModule";
import {
  MicrocredentialTopicList,
  AddMicrocredentialCourseTopic,
  EditMicrocredentialCourseTopic,
  CommonDiscussion,
} from "./components/MicrocredentialTopic";
import {
  MicrocredentialQuizList,
  AddEditMicrocredentialQuiz,
  MicrocredentialCheckpointQuizList,
  MicrocredentialQuizResult,
  MicrocredentialCheckpointQuizReport,
} from "./components/MicrocredentialQuiz";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            <Route index path="/" element={<Home />} />

            {/* Others Page */}
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/blank" element={<Blank />} />

            {/* Forms */}
            <Route path="/form-elements" element={<FormElements />} />

            {/* Tables */}
            <Route path="/basic-tables" element={<BasicTables />} />

            {/* Ui Elements */}
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/images" element={<Images />} />
            <Route path="/videos" element={<Videos />} />

            {/* Charts */}
            <Route path="/line-chart" element={<LineChart />} />
            <Route path="/bar-chart" element={<BarChart />} />

            {/* Microcredential Routes */}
            <Route
              path="/microcredential/course-list"
              element={<MicrocredentialCourse />}
            />
            <Route
              path="/microcredential/course-add"
              element={<AddMicrocredentialCourse />}
            />
            <Route
              path="/microcredential/course-edit/:id"
              element={<EditMicrocredentialCourse />}
            />
            {/* Microcredential Module Routes */}
            <Route
              path="/microcredential/module-list"
              element={<MicrocredentialModuleList />}
            />
            <Route
              path="/IgnitoMicroCredencialDetail/MicrocredentialModuleMasterList"
              element={<MicrocredentialModuleList />}
            />
            <Route
              path="/microcredential/module-add"
              element={<AddEditMicrocredentialModule />}
            />
            <Route
              path="/microcredential/module-edit/:id"
              element={<AddEditMicrocredentialModule />}
            />
            <Route
              path="/microcredential/topic-list"
              element={<MicrocredentialTopicList />}
            />
            <Route
              path="/microcredential/topic-add"
              element={<AddMicrocredentialCourseTopic />}
            />
            <Route
              path="/microcredential/topic-edit/:id"
              element={<EditMicrocredentialCourseTopic />}
            />
            <Route
              path="/microcredential/edit-topic/:id"
              element={<EditMicrocredentialCourseTopic />}
            />
            <Route
              path="/IgnitoMicroCredencialDetail/AddMicrocredentialCourseTopic"
              element={<EditMicrocredentialCourseTopic />}
            />
            <Route
              path="/microcredential/faq-list"
              element={<PlaceholderPage title="Microcredential FAQ List" />}
            />
            <Route
              path="/microcredential/common-discussion"
              element={<CommonDiscussion />}
            />
            <Route
              path="/IgnitoMicroCredencialDetail/CommonDiscussion"
              element={<CommonDiscussion />}
            />
            <Route
              path="/microcredential/professor-discussion"
              element={<PlaceholderPage title="Professor Discussion" />}
            />
            <Route
              path="/microcredential/quiz"
              element={<MicrocredentialQuizList />}
            />
            <Route
              path="/microcredential/quiz-add"
              element={<AddEditMicrocredentialQuiz />}
            />
            <Route
              path="/microcredential/quiz-edit/:id"
              element={<AddEditMicrocredentialQuiz />}
            />
            <Route
              path="/DegreeQuizMVC/MainDegreeQuizList"
              element={<MicrocredentialQuizList />}
            />
            <Route
              path="/DegreeQuizMVC/DegreeQuizAddUpdate"
              element={<AddEditMicrocredentialQuiz />}
            />
            <Route
              path="/DegreeQuizMVC/DegreeQuizAddUpdate/:id"
              element={<AddEditMicrocredentialQuiz />}
            />
            <Route
              path="/MicrocredentialQuizMVC/MicrocredentialQuizList"
              element={<MicrocredentialQuizList />}
            />
            <Route
              path="/MicrocredentialQuizMVC/MicrocredentialQuizAdd"
              element={<AddEditMicrocredentialQuiz />}
            />
            <Route
              path="/MicrocredentialQuizMVC/MicrocredentialQuizEdit/:id"
              element={<AddEditMicrocredentialQuiz />}
            />
            <Route
              path="/microcredential/quiz-result"
              element={<MicrocredentialQuizResult />}
            />
            <Route
              path="/MicrocredentialQuizMVC/MicrocredentialQuizResult"
              element={<MicrocredentialQuizResult />}
            />
            <Route
              path="/microcredential/checkpoint-quiz"
              element={<MicrocredentialCheckpointQuizList />}
            />
            <Route
              path="/MicrocredentialCourseDetail/MicrocredentialCheckpointQuizList"
              element={<MicrocredentialCheckpointQuizList />}
            />
            <Route
              path="/microcredential/checkpoint-quiz-report"
              element={<MicrocredentialCheckpointQuizReport />}
            />
            <Route
              path="/MicrocredentialCourseDetail/MicrocredentialCheckpointQuizReport"
              element={<MicrocredentialCheckpointQuizReport />}
            />
            <Route
              path="/microcredential/purchased-students"
              element={<PlaceholderPage title="Purchased Students List" />}
            />
            <Route
              path="/microcredential/payment-dashboard"
              element={<PlaceholderPage title="Payment Dashboard" />}
            />

            {/* Free / Credit Courses Route */}
            <Route
              path="/free-credit-courses"
              element={<PlaceholderPage title="Free / Credit Courses" />}
            />

            {/* Website Content Routes */}
            <Route
              path="/website/home-page-list"
              element={<HeroSectionList />}
            />
            <Route
              path="/website/trusted-logo-list"
              element={<LogoList />}
            />
            <Route
              path="/website/about-us-list"
              element={<PlaceholderPage title="About Us List" />}
            />
            <Route
              path="/website/blog-list"
              element={<PlaceholderPage title="Blog List" />}
            />
            <Route
              path="/website/testimonial-review-list"
              element={<TestimonialList />}
            />
            <Route
              path="/website/testimonial-review-add"
              element={<AddTestimonialReview />}
            />
            <Route
              path="/website/add-testimonial-review"
              element={<AddTestimonialReview />}
            />
            <Route
              path="/website/testimonial-review-edit/:id"
              element={<EditTestimonialReview />}
            />
            <Route
              path="/website/edit-testimonial-review/:id"
              element={<EditTestimonialReview />}
            />
            <Route
              path="/website/announcement-list"
              element={<PlaceholderPage title="Announcement List" />}
            />
            <Route
              path="/website/stakeholders-feedback-list"
              element={<PlaceholderPage title="Stakeholders Feedback List" />}
            />
            <Route
              path="/website/common-faq-list"
              element={<PlaceholderPage title="Common FAQ List" />}
            />
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<Navigate to="/signin" replace />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
