import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation, Link } from "react-router";
import PageMeta from "../common/PageMeta";
import RichTextEditor from "../common/RichTextEditor";
import {
  CheckCircleIcon,
  AlertIcon,
  CloseIcon,
} from "../../icons";
import {
  microcredentialCourseAddUpdate,
  commonUploadFile,
  getStreamData,
  getMicroCredentialCourseLevel,
  getProgrammeLanguage,
  getMicroCourseMaterialIncludeData,
  getMicroCourseLearnData,
  adminMicrocredentialCourseList,
} from "../../services/adminMicrocredentialService";
import { getMicrocredentialCourseDetail } from "../../services/microcredentialService";
import { formatImageUrl } from "../../dto/output/homepageOutputs";

export default function EditMicrocredentialCourse() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const courseId = Number(id || 0);
  const passedItem = location.state?.item || null;

  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Dropdown options from backend
  const [streamOptions, setStreamOptions] = useState([]);
  const [levelOptions, setLevelOptions] = useState([]);
  const [languageOptions, setLanguageOptions] = useState([]);

  // Split Duration State matching Screenshot 3
  const [durationValue, setDurationValue] = useState("3");
  const [durationUnit, setDurationUnit] = useState("Month(s)");

  // Main Form Data
  const [formData, setFormData] = useState({
    adminId: 1,
    microcredentialCourseId: courseId,
    microcredentialCourseStreamId: 0,
    microcredentialCourseName: "",
    microcredentialCourseLevelId: 0,
    microcredentialCoursePrice: 0,
    microcredentialCourseRating: 5.0,
    aboutMicrocredentialCourse: "",
    microcredentialCourseDescription: "",
    microcredentialCourseIntroImage: "",
    microcredentialCourseIntroURL: "",
    microcredentialCourseFormat: "Online",
    certificateName: "",
    certificateImage: "",
    certificatioSkillLevel: "Foundation",
    languageId: 0,
    streamName: "",
    courseLevel: "",
    language: "",
  });

  // Dynamic Lists
  const [materialsList, setMaterialsList] = useState([]);
  const [newMaterialInput, setNewMaterialInput] = useState("");
  const [learnList, setLearnList] = useState([]);
  const [newLearnInput, setNewLearnInput] = useState("");

  // Image Upload State - Intro Image
  const [introFile, setIntroFile] = useState(null);
  const [introPreviewUri, setIntroPreviewUri] = useState("");
  const [uploadingIntro, setUploadingIntro] = useState(false);

  // Image Upload State - Certificate Image
  const [certFile, setCertFile] = useState(null);
  const [certPreviewUri, setCertPreviewUri] = useState("");
  const [uploadingCert, setUploadingCert] = useState(false);

  // Populate data
  useEffect(() => {
    async function loadData() {
      if (!courseId) {
        setErrorMessage("Invalid course ID.");
        setInitialLoading(false);
        return;
      }

      setInitialLoading(true);

      try {
        // 1. Fetch dropdowns
        const [streamsRes, levelsRes, langsRes] = await Promise.allSettled([
          getStreamData(),
          getMicroCredentialCourseLevel(),
          getProgrammeLanguage(),
        ]);

        if (streamsRes.status === "fulfilled" && streamsRes.value?.success) {
          setStreamOptions(streamsRes.value.streamDataList || []);
        }
        if (levelsRes.status === "fulfilled" && levelsRes.value?.success) {
          setLevelOptions(levelsRes.value.microCredentialCourseLevelList || []);
        }
        if (langsRes.status === "fulfilled" && langsRes.value?.success) {
          setLanguageOptions(
            langsRes.value.getProgrammeLanguage ||
            langsRes.value.programmeLanguageList ||
            []
          );
        }

        // 2. Find course data from passedItem, getMicrocredentialCourseDetail, or adminMicrocredentialCourseList
        let targetCourse = passedItem ? { ...passedItem } : null;

        // Fetch detail directly by ID to ensure full attributes including Intro URL
        try {
          const detailRes = await getMicrocredentialCourseDetail(courseId);
          if (detailRes && (detailRes.success || detailRes.microcredentialCourseName || detailRes.MicrocredentialCourseName)) {
            targetCourse = { ...(targetCourse || {}), ...detailRes };
          }
        } catch (detailErr) {
          console.warn("Could not fetch detail from getMicrocredentialCourseDetail:", detailErr);
        }

        if (!targetCourse || !targetCourse.microcredentialCourseName) {
          const listRes = await adminMicrocredentialCourseList(1, 100, "MicrocredentialCourseId", "DESC", 0, 1);
          const allCourses =
            listRes?.microcredentialCourseOutPutList ||
            listRes?.MicrocredentialCourseOutPutList ||
            listRes?.data ||
            [];

          const found = allCourses.find(
            (c) =>
              Number(c.microcredentialCourseId || c.MicrocredentialCourseId || c.id || 0) === courseId
          );
          if (found) {
            targetCourse = { ...(targetCourse || {}), ...found };
          }
        }

        if (targetCourse) {
          // Parse duration string into value and unit (e.g. "3 Month(s)" or "6 Month")
          const rawDuration =
            targetCourse.microcredentialCourseDuration ||
            targetCourse.MicrocredentialCourseDuration ||
            "";
          if (rawDuration) {
            const match = rawDuration.match(/^(\d+)\s*(.*)$/);
            if (match) {
              setDurationValue(match[1] || "3");
              const foundUnit = match[2]?.trim();
              if (["Day(s)", "Week(s)", "Month(s)", "Year(s)"].includes(foundUnit)) {
                setDurationUnit(foundUnit);
              } else if (foundUnit && foundUnit.toLowerCase().startsWith("day")) {
                setDurationUnit("Day(s)");
              } else if (foundUnit && foundUnit.toLowerCase().startsWith("week")) {
                setDurationUnit("Week(s)");
              } else if (foundUnit && foundUnit.toLowerCase().startsWith("year")) {
                setDurationUnit("Year(s)");
              } else {
                setDurationUnit("Month(s)");
              }
            } else {
              setDurationValue("3");
              setDurationUnit("Month(s)");
            }
          }

          // Robust extraction of Intro URL covering all backend casing variations
          const rawIntroUrl =
            targetCourse.microcredentialCourseIntroURL ||
            targetCourse.MicrocredentialCourseIntroURL ||
            targetCourse.microcredentialCourseIntroUrl ||
            targetCourse.MicrocredentialCourseIntroUrl ||
            targetCourse.introURL ||
            targetCourse.introUrl ||
            targetCourse.IntroURL ||
            targetCourse.IntroUrl ||
            targetCourse.courseIntroURL ||
            targetCourse.courseIntroUrl ||
            targetCourse.CourseIntroURL ||
            targetCourse.CourseIntroUrl ||
            targetCourse.introductionURL ||
            targetCourse.introductionUrl ||
            targetCourse.IntroductionURL ||
            targetCourse.IntroductionUrl ||
            "";

          setFormData({
            adminId: 1,
            microcredentialCourseId: courseId,
            microcredentialCourseStreamId:
              targetCourse.microcredentialCourseStreamId ||
              targetCourse.MicrocredentialCourseStreamId ||
              0,
            microcredentialCourseName:
              targetCourse.microcredentialCourseName ||
              targetCourse.MicrocredentialCourseName ||
              "",
            microcredentialCourseLevelId:
              targetCourse.microcredentialCourseLevelId ||
              targetCourse.MicrocredentialCourseLevelId ||
              0,
            microcredentialCoursePrice: Number(
              targetCourse.microcredentialCoursePrice ?? targetCourse.MicrocredentialCoursePrice ?? 0
            ),
            microcredentialCourseRating: Number(
              targetCourse.microcredentialCourseRating ?? targetCourse.MicrocredentialCourseRating ?? 5
            ),
            aboutMicrocredentialCourse:
              targetCourse.aboutMicrocredentialCourse ||
              targetCourse.AboutMicrocredentialCourse ||
              "",
            microcredentialCourseDescription:
              targetCourse.microcredentialCourseDescription ||
              targetCourse.MicrocredentialCourseDescription ||
              "",
            microcredentialCourseIntroImage:
              targetCourse.microcredentialCourseIntroImage ||
              targetCourse.MicrocredentialCourseIntroImage ||
              "",
            microcredentialCourseIntroURL: rawIntroUrl,
            microcredentialCourseFormat:
              targetCourse.microcredentialCourseFormat ||
              targetCourse.MicrocredentialCourseFormat ||
              "Online",
            certificateName:
              targetCourse.certificateName || targetCourse.CertificateName || "",
            certificateImage:
              targetCourse.certificateImage || targetCourse.CertificateImage || "",
            certificatioSkillLevel:
              targetCourse.certificatioSkillLevel ||
              targetCourse.CertificatioSkillLevel ||
              "Foundation",
            languageId: targetCourse.languageId ?? targetCourse.LanguageId ?? 0,
            streamName: targetCourse.streamName || "",
            courseLevel: targetCourse.courseLevel || "",
            language: targetCourse.language || "",
          });

          // Pre-populate previews
          if (targetCourse.microcredentialCourseIntroImage) {
            setIntroPreviewUri(formatImageUrl(targetCourse.microcredentialCourseIntroImage));
          }
          if (targetCourse.certificateImage) {
            setCertPreviewUri(formatImageUrl(targetCourse.certificateImage));
          }

          // Initial materials from summary text if available
          if (targetCourse.microcredentialCourseMaterialInclude) {
            const splitted = targetCourse.microcredentialCourseMaterialInclude
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);
            setMaterialsList(splitted);
          }
        } else {
          setErrorMessage("Course details could not be found.");
        }

        // 3. Fetch specific sub-item lists (Materials & Learn)
        const [matRes, learnRes] = await Promise.allSettled([
          getMicroCourseMaterialIncludeData(courseId),
          getMicroCourseLearnData(courseId),
        ]);

        if (matRes.status === "fulfilled" && matRes.value?.success) {
          const mList = matRes.value.microCourseMaterialIncludeDataList || [];
          if (mList.length > 0) {
            setMaterialsList(
              mList.map((m) => m.materialInclude || m.MaterialInclude || "").filter(Boolean)
            );
          }
        }

        if (learnRes.status === "fulfilled" && learnRes.value?.success) {
          const lList = learnRes.value.microCourseLearnDataList || [];
          if (lList.length > 0) {
            setLearnList(
              lList.map((l) => l.microCourseLearn || l.MicroCourseLearn || "").filter(Boolean)
            );
          }
        }
      } catch (err) {
        console.error("Error loading course details:", err);
        setErrorMessage(err.message || "Failed to load course details.");
      } finally {
        setInitialLoading(false);
      }
    }

    loadData();
  }, [courseId, passedItem]);

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  // Intro Image Handler (UploadSource: "IntroImage")
  const handleIntroImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(jpeg|jpg|png|webp)/i)) {
      setErrorMessage("Please select a valid image file (.jpg, .jpeg, .png, .webp).");
      return;
    }

    setIntroFile(file);
    setIntroPreviewUri(URL.createObjectURL(file));
    setErrorMessage("");
  };

  const handleRemoveIntroImage = () => {
    setIntroFile(null);
    setIntroPreviewUri("");
    setFormData((prev) => ({ ...prev, microcredentialCourseIntroImage: "" }));
  };

  // Certificate Image Handler (UploadSource: "Certificate")
  const handleCertImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(jpeg|jpg|png|webp)/i)) {
      setErrorMessage("Please select a valid certificate image (.jpg, .jpeg, .png, .webp).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Certificate image file size should be less than 5MB.");
      return;
    }

    setCertFile(file);
    setCertPreviewUri(URL.createObjectURL(file));
    setErrorMessage("");
  };

  const handleRemoveCertImage = () => {
    setCertFile(null);
    setCertPreviewUri("");
    setFormData((prev) => ({ ...prev, certificateImage: "" }));
  };

  // Materials Management
  const handleAddMaterial = () => {
    const trimmed = newMaterialInput.trim();
    if (!trimmed) return;
    setMaterialsList((prev) => [...prev, trimmed]);
    setNewMaterialInput("");
  };

  const handleRemoveMaterial = (index) => {
    setMaterialsList((prev) => prev.filter((_, i) => i !== index));
  };

  // Learn Management
  const handleAddLearn = () => {
    const trimmed = newLearnInput.trim();
    if (!trimmed) return;
    setLearnList((prev) => [...prev, trimmed]);
    setNewLearnInput("");
  };

  const handleRemoveLearn = (index) => {
    setLearnList((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit Update
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.microcredentialCourseName.trim()) {
      setErrorMessage("Course Name is required.");
      return;
    }

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      let finalIntroImagePath = formData.microcredentialCourseIntroImage;
      let finalCertImagePath = formData.certificateImage;

      // 1. Upload Intro Image if replaced (UploadSource: "IntroImage")
      if (introFile) {
        setUploadingIntro(true);
        const introRes = await commonUploadFile(introFile, "UploadSource", "IntroImage");
        if (introRes?.filePath) {
          finalIntroImagePath = introRes.filePath;
        } else if (introRes?.documentList?.[0]?.filePath) {
          finalIntroImagePath = introRes.documentList[0].filePath;
        } else if (Array.isArray(introRes?.rawData) && introRes.rawData[0]?.filePath) {
          finalIntroImagePath = introRes.rawData[0].filePath;
        } else if (introRes?.rawData?.filePath) {
          finalIntroImagePath = introRes.rawData.filePath;
        } else {
          throw new Error(introRes?.message || introRes?.errorDescription || "Failed to upload course intro image.");
        }
        setUploadingIntro(false);
      }

      // 2. Upload Certificate Image if replaced (UploadSource: "Certificate")
      if (certFile) {
        setUploadingCert(true);
        const certRes = await commonUploadFile(certFile, "UploadSource", "Certificate");
        if (certRes?.filePath) {
          finalCertImagePath = certRes.filePath;
        } else if (certRes?.documentList?.[0]?.filePath) {
          finalCertImagePath = certRes.documentList[0].filePath;
        } else if (Array.isArray(certRes?.rawData) && certRes.rawData[0]?.filePath) {
          finalCertImagePath = certRes.rawData[0].filePath;
        } else if (certRes?.rawData?.filePath) {
          finalCertImagePath = certRes.rawData.filePath;
        } else {
          throw new Error(certRes?.message || certRes?.errorDescription || "Failed to upload certificate image.");
        }
        setUploadingCert(false);
      }

      const formattedDuration = `${durationValue.trim()} ${durationUnit}`.trim();

      // 3. Build update payload with AdminId: 1
      const payload = {
        AdminId: 1,
        MicrocredentialCourseId: courseId,
        MicrocredentialCourseStreamId: Number(formData.microcredentialCourseStreamId || 0),
        MicrocredentialCourseName: formData.microcredentialCourseName.trim(),
        MicrocredentialCourseLevelId: Number(formData.microcredentialCourseLevelId || 0),
        MicrocredentialCoursePrice: Number(formData.microcredentialCoursePrice || 0),
        MicrocredentialCourseRating: Number(formData.microcredentialCourseRating || 5),
        AboutMicrocredentialCourse: formData.aboutMicrocredentialCourse.trim(),
        MicrocredentialCourseDescription: formData.microcredentialCourseDescription.trim(),
        MicrocredentialCourseDuration: formattedDuration,
        MicrocredentialCourseIntroImage: finalIntroImagePath,
        MicrocredentialCourseIntroURL: formData.microcredentialCourseIntroURL.trim(),
        MicrocredentialCourseMaterialInclude: materialsList.join(", "),
        MicrocredentialCourseFormat: formData.microcredentialCourseFormat.trim(),
        CertificateName: formData.certificateName.trim(),
        CertificateImage: finalCertImagePath,
        CertificatioSkillLevel: formData.certificatioSkillLevel.trim(),
        LanguageId: Number(formData.languageId || 0),
        MaterialIncludeList: materialsList.map((m) => ({ MaterialInclude: m })),
        MicroCourseLearnList: learnList.map((l) => ({ MicroCourseLearn: l })),
      };

      const res = await microcredentialCourseAddUpdate(payload);

      if (res && res.success !== false) {
        const msg = res.message || "Microcredential course updated successfully.";
        setSuccessMessage(msg);

        setTimeout(() => {
          navigate("/microcredential/course-list", {
            state: { successMessage: msg },
          });
        }, 800);
      } else {
        throw new Error(res?.message || res?.errorDescription || "Failed to update course.");
      }
    } catch (err) {
      console.error("Error updating course:", err);
      setErrorMessage(err.message || "Failed to update microcredential course.");
    } finally {
      setSaving(false);
      setUploadingIntro(false);
      setUploadingCert(false);
    }
  };

  const selectedStreamName =
    streamOptions.find(
      (s) => (s.streamId || s.id) === Number(formData.microcredentialCourseStreamId)
    )?.streamName || formData.streamName || "Stream";

  return (
    <div className="w-full pb-14">
      <PageMeta
        title="Edit Microcredential Course | IgnitoVerse Admin"
        description="Update course details, certificate, syllabus, and curriculum outcomes"
      />

      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-5 dark:border-gray-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1.5">
            <Link to="/" className="hover:text-brand-500 transition">
              Home
            </Link>
            <span>/</span>
            <Link
              to="/microcredential/course-list"
              className="hover:text-brand-500 transition"
            >
              Microcredential Courses
            </Link>
            <span>/</span>
            <span className="font-semibold text-gray-800 dark:text-white">
              Edit Course #{courseId}
            </span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Edit Microcredential Course
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Modify course curriculum, rich descriptions, certificate templates, and pricing.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/microcredential/course-list")}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-xs transition hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Course List</span>
        </button>
      </div>

      {/* Success Alert */}
      {successMessage && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-xs text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300">
          <CheckCircleIcon className="size-4.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span className="flex-1 font-semibold">{successMessage}</span>
          <button
            type="button"
            onClick={() => setSuccessMessage("")}
            className="rounded-lg p-1 text-emerald-600 hover:bg-emerald-100"
          >
            <CloseIcon className="size-3.5" />
          </button>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-xs text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          <AlertIcon className="size-4.5 shrink-0 text-red-600 dark:text-red-400" />
          <span className="flex-1 font-semibold">{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage("")}
            className="rounded-lg p-1 text-red-600 hover:bg-red-100"
          >
            <CloseIcon className="size-3.5" />
          </button>
        </div>
      )}

      {initialLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="size-9 animate-spin rounded-full border-3 border-brand-500 border-t-transparent mb-3" />
          <p className="text-xs text-gray-500 dark:text-gray-400">Loading course information...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-12">
          {/* Left 8 Cols: Main Form Sections */}
          <div className="space-y-6 xl:col-span-8">
            {/* Card 1: Basic Information */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-4">
                1. Basic Course Details
              </h2>

              <div className="grid gap-4 sm:grid-cols-2 text-xs">
                {/* Course Name */}
                <div className="sm:col-span-2">
                  <label className="mb-1 block font-semibold text-gray-700 dark:text-gray-300">
                    Course Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="microcredentialCourseName"
                    value={formData.microcredentialCourseName}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:text-white"
                    required
                  />
                </div>

                {/* Stream Dropdown */}
                <div>
                  <label className="mb-1 block font-semibold text-gray-700 dark:text-gray-300">
                    Stream / Category
                  </label>
                  <select
                    name="microcredentialCourseStreamId"
                    value={formData.microcredentialCourseStreamId}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  >
                    <option value={0}>Select Stream</option>
                    {streamOptions.map((stream) => (
                      <option
                        key={stream.streamId || stream.id}
                        value={stream.streamId || stream.id}
                      >
                        {stream.streamName || stream.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Course Level */}
                <div>
                  <label className="mb-1 block font-semibold text-gray-700 dark:text-gray-300">
                    Course Level
                  </label>
                  <select
                    name="microcredentialCourseLevelId"
                    value={formData.microcredentialCourseLevelId}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  >
                    <option value={0}>Select Level</option>
                    {levelOptions.map((lvl) => (
                      <option
                        key={lvl.courseValue || lvl.microCredentialCourseLevelId || lvl.id}
                        value={lvl.courseValue || lvl.microCredentialCourseLevelId || lvl.id}
                      >
                        {lvl.courseLevel || lvl.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Language */}
                <div>
                  <label className="mb-1 block font-semibold text-gray-700 dark:text-gray-300">
                    Language
                  </label>
                  <select
                    name="languageId"
                    value={formData.languageId}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  >
                    <option value={0}>Select Language</option>
                    {languageOptions.map((lang) => (
                      <option
                        key={lang.languageId || lang.id}
                        value={lang.languageId || lang.id}
                      >
                        {lang.language || lang.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Duration matching Screenshot 3: Number + Dropdown */}
                <div>
                  <label className="mb-1 block font-semibold text-gray-700 dark:text-gray-300">
                    Duration <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="1"
                      value={durationValue}
                      onChange={(e) => setDurationValue(e.target.value)}
                      placeholder="3"
                      className="w-24 rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-xs text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:text-white"
                    />
                    <select
                      value={durationUnit}
                      onChange={(e) => setDurationUnit(e.target.value)}
                      className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    >
                      <option value="Day(s)">Day(s)</option>
                      <option value="Week(s)">Week(s)</option>
                      <option value="Month(s)">Month(s)</option>
                      <option value="Year(s)">Year(s)</option>
                    </select>
                  </div>
                </div>

                {/* Format */}
                <div>
                  <label className="mb-1 block font-semibold text-gray-700 dark:text-gray-300">
                    Format
                  </label>
                  <input
                    type="text"
                    name="microcredentialCourseFormat"
                    value={formData.microcredentialCourseFormat}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-xs text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:text-white"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="mb-1 block font-semibold text-gray-700 dark:text-gray-300">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    name="microcredentialCoursePrice"
                    value={formData.microcredentialCoursePrice}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-xs text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:text-white"
                  />
                </div>

                {/* Rating */}
                <div>
                  <label className="mb-1 block font-semibold text-gray-700 dark:text-gray-300">
                    Rating (1 - 5)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    name="microcredentialCourseRating"
                    value={formData.microcredentialCourseRating}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-xs text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:text-white"
                  />
                </div>

                {/* Introduction URL with full URL display, Open Link button, and editability */}
                <div className="sm:col-span-2">
                  <div className="mb-1 flex items-center justify-between">
                    <label className="block font-semibold text-gray-700 dark:text-gray-300">
                      Introduction URL
                    </label>
                    {formData.microcredentialCourseIntroURL ? (
                      <a
                        href={formData.microcredentialCourseIntroURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 hover:text-brand-700 hover:underline dark:text-brand-400"
                        title="Test link in new tab"
                      >
                        <span>Open / Test URL</span>
                        <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                      </a>
                    ) : null}
                  </div>

                  <div className="relative flex items-center">
                    <input
                      type="text"
                      name="microcredentialCourseIntroURL"
                      value={formData.microcredentialCourseIntroURL || ""}
                      onChange={handleChange}
                      placeholder="https://www.youtube.com/watch?v=15GaKTP0gFE"
                      className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-9 text-xs font-mono text-gray-900 shadow-xs focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                    {formData.microcredentialCourseIntroURL ? (
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            microcredentialCourseIntroURL: "",
                          }))
                        }
                        className="absolute right-2.5 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                        title="Clear URL"
                      >
                        <CloseIcon className="size-3.5" />
                      </button>
                    ) : null}
                  </div>

                  {formData.microcredentialCourseIntroURL ? (
                    <div className="mt-1.5 flex items-start gap-1 text-[11px] text-gray-500 dark:text-gray-400">
                      <span className="shrink-0 font-semibold text-gray-700 dark:text-gray-300">Full URL:</span>
                      <span className="font-mono break-all text-brand-600 dark:text-brand-400">
                        {formData.microcredentialCourseIntroURL}
                      </span>
                    </div>
                  ) : (
                    <p className="mt-1 text-[11px] text-gray-400">
                      Enter complete video or introduction URL (e.g. YouTube, Vimeo, MP4 link).
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Card 2: Descriptions & About with RichTextEditor matching Screenshot 2 */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-4">
                2. About & Course Description
              </h2>

              <div className="space-y-4 text-xs">
                {/* About Course */}
                <div>
                  <label className="mb-1 block font-semibold text-gray-700 dark:text-gray-300">
                    About Course
                  </label>
                  <textarea
                    name="aboutMicrocredentialCourse"
                    rows={3}
                    value={formData.aboutMicrocredentialCourse}
                    onChange={handleChange}
                    placeholder="Comprehensive course covering foundations and practical exercises..."
                    className="w-full rounded-lg border border-gray-300 bg-transparent p-3 text-xs text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:text-white"
                  />
                </div>

                {/* Full Description with RichTextEditor matching Screenshot 2 */}
                <div>
                  <label className="mb-1.5 block font-semibold text-gray-700 dark:text-gray-300">
                    Course Description <span className="text-red-500">*</span>
                  </label>
                  <RichTextEditor
                    value={formData.microcredentialCourseDescription}
                    onChange={(html) =>
                      setFormData((prev) => ({
                        ...prev,
                        microcredentialCourseDescription: html,
                      }))
                    }
                    placeholder="Enter detailed course overview, curriculum highlights, and prerequisites..."
                    minHeight="240px"
                  />
                </div>
              </div>
            </div>

            {/* Card 3: Dynamic Materials & What You'll Learn with Red Add Button matching Screenshot 2 */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-4">
                3. Materials & Learning Outcomes
              </h2>

              {/* What Will You Learn? matching Screenshot 2 */}
              <div className="mb-6 text-xs">
                <label className="mb-1.5 block font-semibold text-gray-700 dark:text-gray-300">
                  What Will You Learn? <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newLearnInput}
                    onChange={(e) => setNewLearnInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddLearn();
                      }
                    }}
                    placeholder="Understand the causes and types of stress in daily life..."
                    className="flex-1 rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-xs text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:text-white"
                  />
                  {/* Red Add Button matching Screenshot 2 */}
                  <button
                    type="button"
                    onClick={handleAddLearn}
                    className="rounded-lg bg-[#b91c1c] px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#991b1b] active:scale-95 transition"
                  >
                    Add
                  </button>
                </div>

                {learnList.length > 0 ? (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {learnList.map((item, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700 dark:bg-red-950/40 dark:text-red-300"
                      >
                        <span>✓ {item}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveLearn(idx)}
                          className="rounded-full text-red-500 hover:text-red-700"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-gray-400 italic">No learning outcomes added yet.</p>
                )}
              </div>

              {/* Material Include Items with Red Add Button */}
              <div className="text-xs">
                <label className="mb-1.5 block font-semibold text-gray-700 dark:text-gray-300">
                  Material Included
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newMaterialInput}
                    onChange={(e) => setNewMaterialInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddMaterial();
                      }
                    }}
                    placeholder="e.g. 100+ Hours of On-Demand Video, Practice Assets..."
                    className="flex-1 rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-xs text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddMaterial}
                    className="rounded-lg bg-[#b91c1c] px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#991b1b] active:scale-95 transition"
                  >
                    Add
                  </button>
                </div>

                {materialsList.length > 0 ? (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {materialsList.map((item, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                      >
                        <span>📦 {item}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveMaterial(idx)}
                          className="rounded-full text-blue-500 hover:text-blue-700"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-gray-400 italic">No materials added yet.</p>
                )}
              </div>
            </div>

            {/* Card 4: Certificate Details */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-4">
                4. Certificate Configuration
              </h2>

              <div className="grid gap-4 sm:grid-cols-2 text-xs">
                <div>
                  <label className="mb-1 block font-semibold text-gray-700 dark:text-gray-300">
                    Certificate Title
                  </label>
                  <input
                    type="text"
                    name="certificateName"
                    value={formData.certificateName}
                    onChange={handleChange}
                    placeholder="e.g. Certificate of Completion in AI"
                    className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-xs text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-semibold text-gray-700 dark:text-gray-300">
                    Certification Skill Level
                  </label>
                  <input
                    type="text"
                    name="certificatioSkillLevel"
                    value={formData.certificatioSkillLevel}
                    onChange={handleChange}
                    placeholder="Foundation / Advanced"
                    className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-xs text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:text-white"
                  />
                </div>

                {/* Certificate Image File */}
                <div className="sm:col-span-2">
                  <label className="mb-1 block font-semibold text-gray-700 dark:text-gray-300">
                    Certificate Template Image
                  </label>
                  <div className="flex items-center gap-4">
                    {certPreviewUri ? (
                      <div className="relative size-20 shrink-0 overflow-hidden rounded-lg border border-gray-200 p-1 dark:border-gray-700">
                        <img
                          src={certPreviewUri}
                          alt="Certificate preview"
                          className="size-full object-contain"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveCertImage}
                          className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white hover:bg-black"
                        >
                          <CloseIcon className="size-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex size-20 shrink-0 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 text-[10px] text-gray-400 dark:border-gray-700 dark:bg-gray-800">
                        No Image
                      </div>
                    )}

                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        onChange={handleCertImageChange}
                        className="block w-full text-xs text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-gray-700 hover:file:bg-gray-200 dark:file:bg-gray-800 dark:file:text-gray-300"
                      />
                      <span className="text-[11px] text-gray-400">PNG, JPG or WEBP up to 5MB</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={saving}
                onClick={() => navigate("/microcredential/course-list")}
                className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-xs font-semibold text-gray-700 shadow-xs hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || uploadingIntro || uploadingCert}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-brand-600 disabled:opacity-50 active:scale-95 transition"
              >
                {saving ? (
                  <>
                    <div className="size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <span>Update Course</span>
                )}
              </button>
            </div>
          </div>

          {/* Right 4 Cols: Image Upload & Live Preview Card */}
          <div className="space-y-6 xl:col-span-4">
            {/* Card: Course Thumbnail / Intro Image */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
                Course Thumbnail Image
              </h3>

              <div className="space-y-3 text-xs">
                {introPreviewUri ? (
                  <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
                    <img
                      src={introPreviewUri}
                      alt="Course Preview"
                      className="size-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveIntroImage}
                      className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black"
                    >
                      <CloseIcon className="size-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex aspect-video w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 text-gray-400 dark:border-gray-800 dark:bg-gray-800/40">
                    <svg className="size-8 stroke-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                      <circle cx="9" cy="9" r="2" />
                      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                    </svg>
                    <span className="mt-1 text-[11px]">Upload Course Intro Image</span>
                  </div>
                )}

                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleIntroImageChange}
                  className="block w-full text-xs text-gray-500 file:mr-2 file:rounded-lg file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-gray-700 hover:file:bg-gray-200 dark:file:bg-gray-800 dark:file:text-gray-300"
                />
              </div>
            </div>

            {/* Live Preview Card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                Live Card Preview
              </h3>

              <div className="overflow-hidden rounded-xl border border-gray-100 bg-gray-50 shadow-xs dark:border-gray-800 dark:bg-gray-800/50">
                <div className="aspect-video w-full overflow-hidden bg-gray-200 dark:bg-gray-800">
                  {introPreviewUri ? (
                    <img
                      src={introPreviewUri}
                      alt="Course Preview"
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center font-bold text-gray-400 text-lg">
                      {formData.microcredentialCourseName
                        ? formData.microcredentialCourseName.charAt(0).toUpperCase()
                        : "C"}
                    </div>
                  )}
                </div>

                <div className="p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-600 dark:bg-brand-950/50 dark:text-brand-400">
                      {selectedStreamName}
                    </span>
                    <span className="text-[11px] font-bold text-gray-900 dark:text-white">
                      {Number(formData.microcredentialCoursePrice) > 0
                        ? `₹${Number(formData.microcredentialCoursePrice).toLocaleString("en-IN")}`
                        : "Free"}
                    </span>
                  </div>

                  <h4 className="font-bold text-gray-900 line-clamp-2 dark:text-white">
                    {formData.microcredentialCourseName || "Course Name Preview"}
                  </h4>

                  <p className="text-[11px] text-gray-500 line-clamp-2 dark:text-gray-400">
                    {formData.aboutMicrocredentialCourse ||
                      "About course overview will be rendered here..."}
                  </p>

                  <div className="flex items-center justify-between border-t border-gray-200/60 pt-2 text-[11px] text-gray-400 dark:border-gray-700/60">
                    <span>{`${durationValue} ${durationUnit}`}</span>
                    <span className="text-amber-500 font-semibold">
                      ★ {Number(formData.microcredentialCourseRating).toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
