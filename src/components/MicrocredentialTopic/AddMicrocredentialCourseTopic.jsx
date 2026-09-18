import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router";
import PageMeta from "../common/PageMeta";
import {
  CheckCircleIcon,
  AlertIcon,
  CloseIcon,
  DownloadIcon,
  FileIcon,
  TrashBinIcon,
} from "../../icons";
import {
  getStreamData,
  getMicrocredentialCourse,
  microCourseTopicAddUpdate,
  commonUploadFile,
  getMicrocredentialStudentDownloadDocuments,
  downloadMicroTopicTemplate,
  uploadMicroTopicExcel,
  getMicrocredentialModuleByCourseId,
} from "../../services/adminMicrocredentialService";
import { formatImageUrl } from "../../dto/output/homepageOutputs";

export default function AddMicrocredentialCourseTopic() {
  const navigate = useNavigate();
  const location = useLocation();

  // Loading and feedback states
  const [loadingStreams, setLoadingStreams] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [saving, setSaving] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const [uploadingExcel, setUploadingExcel] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Passed context flags
  const passedCourseId = location.state?.courseId ? String(location.state.courseId) : "";
  const passedCourseName = location.state?.courseName || "";
  const passedStreamId = location.state?.streamId ? String(location.state.streamId) : "";
  const passedStreamName = location.state?.streamName || "";
  const passedModuleId = location.state?.moduleId ? String(location.state.moduleId) : "";
  const passedModuleName = location.state?.moduleName || "";

  const isCourseLocked = Boolean(passedCourseId || location.state?.isCourseLocked);
  const isModuleLocked = Boolean(passedModuleId || location.state?.isModuleLocked);

  // Dropdown states
  const [streamList, setStreamList] = useState([]);
  const [courseList, setCourseList] = useState([]);
  const [moduleList, setModuleList] = useState([]);
  const [selectedStreamId, setSelectedStreamId] = useState(passedStreamId);
  const [selectedCourseId, setSelectedCourseId] = useState(passedCourseId);
  const [selectedModuleId, setSelectedModuleId] = useState(passedModuleId);
  const [loadingModules, setLoadingModules] = useState(false);

  // Student Download Documents: [{ id, originalFileName, givenFileName, filePath, file, uploading, previewUrl }]
  const [studentDocs, setStudentDocs] = useState([]);

  // Topics list: [{ topicName, videoTitle, topicVideoUrl, topicPdf, pdfFile }]
  const [topics, setTopics] = useState([
    {
      topicName: "",
      videoTitle: "",
      topicVideoUrl: "",
      topicPdf: "",
      pdfFile: null,
    },
  ]);

  const excelInputRef = useRef(null);

  // Fetch Stream list on Mount
  useEffect(() => {
    let isMounted = true;

    async function loadStreams() {
      setLoadingStreams(true);
      try {
        const streamRes = await getStreamData();
        if (isMounted && streamRes && streamRes.success) {
          const streams = streamRes.streamDataList || [];
          setStreamList(streams);

          // Auto-resolve stream ID if we only have streamName or streamId was 0
          if (passedStreamName || (passedStreamId && passedStreamId !== "0")) {
            const matched = streams.find(
              (s) =>
                (passedStreamId && passedStreamId !== "0" && String(s.streamId) === String(passedStreamId)) ||
                (passedStreamName && s.streamName?.toLowerCase().trim() === passedStreamName.toLowerCase().trim())
            );
            if (matched && matched.streamId) {
              setSelectedStreamId(String(matched.streamId));
            }
          }
        }
      } catch (err) {
        console.error("Error loading stream list:", err);
      } finally {
        if (isMounted) setLoadingStreams(false);
      }
    }

    loadStreams();

    return () => {
      isMounted = false;
    };
  }, [passedStreamName, passedStreamId]);

  // Automatically load courses & modules when pre-selected via navigation state
  useEffect(() => {
    let isMounted = true;
    async function loadInitialState() {
      const initialCourseId = passedCourseId;
      const initialStreamId = passedStreamId;
      const initialModuleId = passedModuleId;

      if (initialStreamId || initialCourseId) {
        try {
          const res = await getMicrocredentialCourse(initialStreamId ? String(initialStreamId) : "");
          if (isMounted && res && res.success) {
            let courses = res.microcredentialCourseOutputList || [];
            if (
              initialCourseId &&
              passedCourseName &&
              !courses.some((c) => String(c.microcredentialCourseId) === String(initialCourseId))
            ) {
              courses = [
                {
                  microcredentialCourseId: Number(initialCourseId),
                  microcredentialCourseName: passedCourseName,
                  streamId: Number(initialStreamId || 0),
                },
                ...courses,
              ];
            }
            setCourseList(courses);
            if (!initialStreamId && initialCourseId) {
              const matched = courses.find(
                (c) => String(c.microcredentialCourseId) === String(initialCourseId)
              );
              if (matched && matched.streamId) {
                setSelectedStreamId(String(matched.streamId));
              }
            }
          }
        } catch (err) {
          console.error("Error loading courses for initial state:", err);
        }
      }

      if (initialCourseId) {
        setLoadingModules(true);
        try {
          const modRes = await getMicrocredentialModuleByCourseId(Number(initialCourseId));
          if (isMounted && modRes && modRes.success) {
            let mods = modRes.microcredentialModuleList || [];
            if (
              initialModuleId &&
              passedModuleName &&
              !mods.some((m) => String(m.microcredentialModuleMasterId) === String(initialModuleId))
            ) {
              mods = [
                {
                  microcredentialModuleMasterId: Number(initialModuleId),
                  moduleName: passedModuleName,
                  microcredentialCourseId: Number(initialCourseId),
                },
                ...mods,
              ];
            }
            setModuleList(mods);
          }
        } catch (err) {
          console.error("Error loading modules for initial state:", err);
        } finally {
          if (isMounted) setLoadingModules(false);
        }

        try {
          const docsRes = await getMicrocredentialStudentDownloadDocuments(Number(initialCourseId));
          const list =
            docsRes?.adminGetMicrocredentialStudentDownloadDocumentsData ||
            docsRes?.microcredentialStudentDownloadDocumentList ||
            docsRes?.rawData?.adminGetMicrocredentialStudentDownloadDocumentsData ||
            docsRes?.rawData?.AdminGetMicrocredentialStudentDownloadDocumentsData ||
            [];
          if (isMounted && Array.isArray(list) && list.length > 0) {
            setStudentDocs(
              list.map((d, index) => {
                const docIdNum = Number(d.microcredentialStudentDownloadDocumentId ?? d.MicrocredentialStudentDownloadDocumentId ?? 0);
                return {
                  id: docIdNum > 0 ? docIdNum : `doc_${Date.now()}_${index}`,
                  documentId: docIdNum,
                  microcredentialStudentDownloadDocumentId: docIdNum,
                  originalFileName: d.originalFileName || d.OriginalFileName || "Student Document",
                  givenFileName: d.givenFileName || d.GivenFileName || d.originalFileName || d.OriginalFileName || "Student Document",
                  filePath: d.microcredentialStudentDownloadDocument || d.MicrocredentialStudentDownloadDocument || d.filePath || "",
                  file: null,
                  isExisting: true,
                };
              })
            );
          }
        } catch (dErr) {
          console.warn("Could not load initial student docs:", dErr);
        }
      }
    }

    loadInitialState();
    return () => {
      isMounted = false;
    };
  }, [passedCourseId, passedStreamId, passedModuleId, passedCourseName, passedModuleName]);

  // Stream dropdown change - load microcredential courses for selected stream
  const handleStreamChange = async (e) => {
    const streamId = e.target.value;
    setSelectedStreamId(streamId);
    setSelectedCourseId("");
    setSelectedModuleId("");
    setCourseList([]);
    setModuleList([]);
    if (streamId) {
      setLoadingCourses(true);
      try {
        const res = await getMicrocredentialCourse(streamId);
        if (res && res.success) {
          setCourseList(res.microcredentialCourseOutputList || []);
        } else {
          setCourseList([]);
        }
      } catch (err) {
        console.error("Error loading courses for stream:", err);
        setCourseList([]);
      } finally {
        setLoadingCourses(false);
      }
    } else {
      setCourseList([]);
    }
  };

  // Course dropdown change - load modules and optionally pre-populate if topics already exist
  const handleCourseChange = async (e) => {
    const courseId = e.target.value;
    setSelectedCourseId(courseId);
    setSelectedModuleId("");
    setModuleList([]);
    if (!courseId) return;

    // Load modules for this course
    setLoadingModules(true);
    try {
      const modRes = await getMicrocredentialModuleByCourseId(Number(courseId));
      if (modRes && modRes.success) {
        setModuleList(modRes.microcredentialModuleList || []);
      } else {
        setModuleList([]);
      }
    } catch (err) {
      console.error("Error loading modules for course:", err);
      setModuleList([]);
    } finally {
      setLoadingModules(false);
    }

    // Reset topic list and fetch documents for course
    setTopics([
      {
        topicName: "",
        videoTitle: "",
        topicVideoUrl: "",
        topicPdf: "",
        pdfFile: null,
      },
    ]);
    try {
      const docsRes = await getMicrocredentialStudentDownloadDocuments(Number(courseId));
      const list =
        docsRes?.adminGetMicrocredentialStudentDownloadDocumentsData ||
        docsRes?.microcredentialStudentDownloadDocumentList ||
        docsRes?.rawData?.adminGetMicrocredentialStudentDownloadDocumentsData ||
        docsRes?.rawData?.AdminGetMicrocredentialStudentDownloadDocumentsData ||
        [];
      if (Array.isArray(list) && list.length > 0) {
        setStudentDocs(
          list.map((d, index) => {
            const docIdNum = Number(d.microcredentialStudentDownloadDocumentId ?? d.MicrocredentialStudentDownloadDocumentId ?? 0);
            return {
              id: docIdNum > 0 ? docIdNum : `doc_${Date.now()}_${index}`,
              documentId: docIdNum,
              microcredentialStudentDownloadDocumentId: docIdNum,
              originalFileName: d.originalFileName || d.OriginalFileName || "Student Document",
              givenFileName: d.givenFileName || d.GivenFileName || d.originalFileName || d.OriginalFileName || "Student Document",
              filePath: d.microcredentialStudentDownloadDocument || d.MicrocredentialStudentDownloadDocument || d.filePath || "",
              file: null,
              isExisting: true,
            };
          })
        );
      } else {
        setStudentDocs([]);
      }
    } catch (dErr) {
      setStudentDocs([]);
    }
  };

  // Add a new topic card
  const handleAddTopic = () => {
    setTopics((prev) => [
      ...prev,
      {
        topicName: "",
        videoTitle: "",
        topicVideoUrl: "",
        topicPdf: "",
        pdfFile: null,
      },
    ]);
  };

  // Remove topic card
  const handleRemoveTopic = (indexToRemove) => {
    if (topics.length === 1) {
      setTopics([
        {
          topicName: "",
          videoTitle: "",
          topicVideoUrl: "",
          topicPdf: "",
          pdfFile: null,
        },
      ]);
      return;
    }
    setTopics((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Edit topic field
  const handleTopicFieldChange = (index, field, value) => {
    setTopics((prev) =>
      prev.map((topic, idx) =>
        idx === index ? { ...topic, [field]: value } : topic
      )
    );
  };

  // Topic PDF file selection
  const handleTopicPdfChange = async (index, e) => {
    const file = e.target.files?.[0];
    if (file) {
      const blobUrl = URL.createObjectURL(file);
      setTopics((prev) =>
        prev.map((topic, idx) =>
          idx === index
            ? { ...topic, pdfFile: file, topicPdf: file.name, previewUrl: blobUrl, uploadingPdf: true }
            : topic
        )
      );

      try {
        const uploadRes = await commonUploadFile(
          file,
          "UploadSource",
          "MicroCourseTopicpdf"
        );
        const serverPath = uploadRes?.filePath || uploadRes?.documentList?.[0]?.filePath;
        if (uploadRes?.success && serverPath) {
          setTopics((prev) =>
            prev.map((topic, idx) =>
              idx === index
                ? { ...topic, topicPdf: serverPath, pdfFile: null, uploadingPdf: false }
                : topic
            )
          );
        } else {
          setTopics((prev) =>
            prev.map((topic, idx) =>
              idx === index ? { ...topic, uploadingPdf: false } : topic
            )
          );
        }
      } catch (err) {
        console.warn("Topic PDF immediate upload deferred to submit:", err);
        setTopics((prev) =>
          prev.map((topic, idx) =>
            idx === index ? { ...topic, uploadingPdf: false } : topic
          )
        );
      }
    }
  };

  // Student download document multi-file selection
  const handleStudentDocsChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    for (const file of files) {
      const docId = `new_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const blobUrl = URL.createObjectURL(file);
      const tempDoc = {
        id: docId,
        originalFileName: file.name,
        givenFileName: file.name,
        filePath: "",
        file: file,
        previewUrl: blobUrl,
        uploading: true,
        isExisting: false,
      };
      setStudentDocs((prev) => [...prev, tempDoc]);

      try {
        const uploadDocRes = await commonUploadFile(
          file,
          "UploadSource",
          "MicrocredentialStudentDownloadDocument"
        );
        const serverPath = uploadDocRes?.filePath || uploadDocRes?.documentList?.[0]?.filePath;
        const givenName = uploadDocRes?.documentList?.[0]?.givenName || file.name;
        const originalName = uploadDocRes?.documentList?.[0]?.originalName || file.name;

        if (uploadDocRes?.success && serverPath) {
          setStudentDocs((prev) =>
            prev.map((d) =>
              d.id === docId
                ? {
                    ...d,
                    filePath: serverPath,
                    givenFileName: givenName,
                    originalFileName: originalName,
                    file: null,
                    uploading: false,
                  }
                : d
            )
          );
        } else {
          setStudentDocs((prev) =>
            prev.map((d) => (d.id === docId ? { ...d, uploading: false } : d))
          );
        }
      } catch (err) {
        console.warn("Student doc upload deferred to submit:", err);
        setStudentDocs((prev) =>
          prev.map((d) => (d.id === docId ? { ...d, uploading: false } : d))
        );
      }
    }

    e.target.value = "";
  };

  // Remove student download document
  const removeStudentDownloadDocument = (documentId) => {
    const id = parseInt(documentId, 10);
    setStudentDocs((prev) =>
      prev.filter((doc, idx) => {
        const docId = parseInt(
          doc.MicrocredentialStudentDownloadDocumentId ??
          doc.microcredentialStudentDownloadDocumentId ??
          doc.documentId ??
          doc.id,
          10
        );
        if (!isNaN(id) && !isNaN(docId) && id > 0 && docId > 0) {
          return docId !== id;
        }
        if (doc.id !== undefined && doc.id !== null) {
          return String(doc.id) !== String(documentId);
        }
        return idx !== documentId;
      })
    );
  };

  const handleRemoveStudentDoc = removeStudentDownloadDocument;

  // Download Excel Template (API 1)
  const handleDownloadTemplate = async () => {
    const selectedStream = streamList.find(
      (s) => Number(s.streamId) === Number(selectedStreamId)
    );
    const selectedCourse = courseList.find(
      (c) => Number(c.microcredentialCourseId) === Number(selectedCourseId)
    );

    const streamName = selectedStream?.streamName || "General";
    const courseName = selectedCourse?.microcredentialCourseName || "MicroCourse";

    setDownloadingTemplate(true);
    setErrorMessage("");
    try {
      const res = await downloadMicroTopicTemplate(
        streamName,
        courseName,
        uploadMicroDocument || "",
        true
      );
      if (res && res.success) {
        setSuccessMessage(`Excel template downloaded: ${res.fileName}`);
      } else {
        setErrorMessage(res.message || "Failed to download Excel template.");
      }
    } catch (err) {
      console.error("Error downloading template:", err);
      setErrorMessage("Error downloading Excel template.");
    } finally {
      setDownloadingTemplate(false);
    }
  };

  // Upload Excel File (API 6)
  const handleExcelUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingExcel(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await uploadMicroTopicExcel(file);
      if (res && res.success) {
        setSuccessMessage("Excel parsed successfully! Topics loaded.");

        if (res.uploadMicroDocument) {
          setUploadMicroDocument(res.uploadMicroDocument);
        }

        if (Array.isArray(res.microCourseExcelTopicList) && res.microCourseExcelTopicList.length > 0) {
          setTopics(
            res.microCourseExcelTopicList.map((t) => ({
              topicName: t.topicName || t.TopicName || "",
              videoTitle: t.videoTitle || t.VideoTitle || "",
              topicVideoUrl: t.topicVideoUrl || t.TopicVideoUrl || "",
              topicPdf: t.topicPdf || t.TopicPdf || "",
              pdfFile: null,
            }))
          );
        }
      } else {
        setErrorMessage(res.message || "Failed to process Excel file.");
      }
    } catch (err) {
      console.error("Error uploading Excel:", err);
      setErrorMessage("Error uploading Excel file.");
    } finally {
      setUploadingExcel(false);
      if (excelInputRef.current) {
        excelInputRef.current.value = "";
      }
    }
  };

  // Submit Handler: Add Microcredential Course Topic (API 5)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedStreamId) {
      setErrorMessage("Please select a stream.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!selectedCourseId) {
      setErrorMessage("Please select a microcredential course.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!selectedModuleId && moduleList.length > 0) {
      setErrorMessage("Please select a module for this topic.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const validTopics = topics.filter(
      (t) =>
        t.topicName.trim() !== "" ||
        t.videoTitle.trim() !== "" ||
        t.topicVideoUrl.trim() !== ""
    );

    if (validTopics.length === 0) {
      setErrorMessage("Please add at least one topic with a Topic Name.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      // 1. Upload Student Download Documents if newly selected
      const finalStudentDocsList = [];
      for (const doc of studentDocs) {
        if (doc.file && !doc.filePath) {
          const uploadDocRes = await commonUploadFile(
            doc.file,
            "UploadSource",
            "MicrocredentialStudentDownloadDocument"
          );

          let filePath = "";
          let givenName = doc.givenFileName || doc.file.name;
          let originalName = doc.originalFileName || doc.file.name;

          if (uploadDocRes?.documentList?.[0]?.filePath) {
            filePath = uploadDocRes.documentList[0].filePath;
            givenName = uploadDocRes.documentList[0].givenName || givenName;
            originalName = uploadDocRes.documentList[0].originalName || originalName;
          } else if (Array.isArray(uploadDocRes?.rawData) && uploadDocRes.rawData[0]?.filePath) {
            filePath = uploadDocRes.rawData[0].filePath;
            givenName = uploadDocRes.rawData[0].givenName || givenName;
            originalName = uploadDocRes.rawData[0].originalName || originalName;
          } else if (uploadDocRes?.filePath) {
            filePath = uploadDocRes.filePath;
          } else if (uploadDocRes?.rawData?.filePath) {
            filePath = uploadDocRes.rawData.filePath;
          }

          if (filePath) {
            finalStudentDocsList.push({
              MicrocredentialStudentDownloadDocumentId: 0,
              microcredentialStudentDownloadDocumentId: 0,
              OriginalFileName: originalName,
              GivenFileName: givenName,
              MicrocredentialStudentDownloadDocument: filePath,
              originalFileName: originalName,
              givenFileName: givenName,
              microcredentialStudentDownloadDocument: filePath,
            });
          }
        } else if (doc.filePath) {
          const existingDocId = doc.isExisting
            ? Number(doc.documentId ?? doc.microcredentialStudentDownloadDocumentId ?? (typeof doc.id === "number" ? doc.id : 0) ?? 0)
            : 0;
          const validDocId = !isNaN(existingDocId) ? existingDocId : 0;

          finalStudentDocsList.push({
            MicrocredentialStudentDownloadDocumentId: validDocId,
            microcredentialStudentDownloadDocumentId: validDocId,
            OriginalFileName: doc.originalFileName || "Document",
            GivenFileName: doc.givenFileName || doc.originalFileName || "Document",
            MicrocredentialStudentDownloadDocument: doc.filePath,
            originalFileName: doc.originalFileName || "Document",
            givenFileName: doc.givenFileName || doc.originalFileName || "Document",
            microcredentialStudentDownloadDocument: doc.filePath,
          });
        }
      }

      // 2. Upload Topic PDFs if newly selected
      const finalTopicsList = [];
      for (const topic of validTopics) {
        let topicPdfPath = topic.topicPdf || "";

        if (topic.pdfFile) {
          const pdfRes = await commonUploadFile(
            topic.pdfFile,
            "UploadSource",
            "MicroCourseTopicpdf"
          );

          if (pdfRes?.documentList?.[0]?.filePath) {
            topicPdfPath = pdfRes.documentList[0].filePath;
          } else if (Array.isArray(pdfRes?.rawData) && pdfRes.rawData[0]?.filePath) {
            topicPdfPath = pdfRes.rawData[0].filePath;
          } else if (pdfRes?.rawData?.filePath) {
            topicPdfPath = pdfRes.rawData.filePath;
          }
        }

        finalTopicsList.push({
          TopicName: topic.topicName.trim(),
          VideoTitle: topic.videoTitle.trim(),
          TopicVideoUrl: topic.topicVideoUrl.trim(),
          TopicPdf: topicPdfPath,
        });
      }

      // 3. API 5 Payload: MicroCourseTopicAddUpdate
      const payload = {
        StreamId: Number(selectedStreamId),
        MicrocredentialCourseId: Number(selectedCourseId),
        MicrocredentialModuleMasterId: Number(selectedModuleId || 0),
        AdminId: 1,
        UploadMicroDocument: "",
        MicrocredentialCourseTopicList: finalTopicsList,
        MicrocredentialStudentDownloadDocumentList: finalStudentDocsList,
      };

      const res = await microCourseTopicAddUpdate(payload);

      if (res && res.success !== false) {
        const msg = res.message || "Microcredential course topics added successfully.";
        setSuccessMessage(msg);

        setTimeout(() => {
          if (selectedModuleId) {
            navigate(`/microcredential/module-topics/${selectedModuleId}`, {
              state: { successMessage: msg },
            });
          } else {
            navigate("/microcredential/module-list", {
              state: { successMessage: msg },
            });
          }
        }, 1000);
      } else {
        setErrorMessage(
          res.message || "Failed to save topics. Please verify your fields and retry."
        );
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err) {
      console.error("Error submitting micro course topic:", err);
      setErrorMessage("An unexpected error occurred while saving topics.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full pb-14">
      <PageMeta
        title="Add Topic Microcredential Courses | Ignito Admin"
        description="Add topics, video lectures, PDFs, and student download documents for microcredential courses."
      />

      {/* Header Bar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-5 dark:border-gray-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1.5">
            <Link to="/" className="hover:text-brand-500 transition">
              Home
            </Link>
            <span>/</span>
            <Link
              to="/microcredential/topic-list"
              className="hover:text-brand-500 transition"
            >
              Microcredential Topics
            </Link>
            <span>/</span>
            <span className="font-semibold text-gray-800 dark:text-white">
              Add Topics
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Add  Topic Microcredential Courses</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Create course topics, lecture videos, downloadable PDFs, and student resources.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Download Excel Template */}
          <button
            type="button"
            onClick={handleDownloadTemplate}
            disabled={downloadingTemplate || !selectedCourseId}
            title={!selectedCourseId ? "Select a course first" : "Download Excel Template"}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/90 px-4 py-2 text-xs font-semibold text-emerald-700 shadow-xs hover:border-emerald-300 hover:bg-emerald-100 disabled:opacity-60 active:scale-95 transition dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300 dark:hover:bg-emerald-950/50"
          >
            <DownloadIcon className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{downloadingTemplate ? "Downloading..." : "Download Excel Template"}</span>
          </button>

          {/* Hidden Excel Input */}
          <input
            type="file"
            ref={excelInputRef}
            onChange={handleExcelUpload}
            accept=".xlsx,.xls"
            className="hidden"
          />

          {/* Upload Excel */}
          <button
            type="button"
            onClick={() => excelInputRef.current?.click()}
            disabled={uploadingExcel}
            className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50/90 px-4 py-2 text-xs font-semibold text-blue-700 shadow-xs hover:border-blue-300 hover:bg-blue-100 disabled:opacity-60 active:scale-95 transition dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-300 dark:hover:bg-blue-950/50"
          >
            <FileIcon className="size-3.5" />
            <span>{uploadingExcel ? "Processing..." : "Upload Excel"}</span>
          </button>

          {/* Back Button */}
          <button
            type="button"
            onClick={() => {
              if (selectedModuleId) {
                navigate(`/microcredential/module-topics/${selectedModuleId}`);
              } else {
                navigate("/microcredential/module-list");
              }
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50/90 px-4 py-2 text-xs font-semibold text-gray-700 shadow-xs hover:border-gray-300 hover:bg-gray-100 active:scale-95 transition dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <svg
              className="size-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span>Back to Topic List</span>
          </button>
        </div>
      </div>

      {/* Success Banner */}
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

      {/* Error Banner */}
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

      {/* Main Card Container */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <form onSubmit={handleSubmit}>
          {/* Top Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start pb-6 border-b border-gray-100 dark:border-gray-800">
            {/* Field 1: Select Stream */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Select Stream <span className="text-red-500">*</span>
                </label>
                {isCourseLocked && (
                  <span className="text-[10px] text-blue-600 font-medium bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 rounded">
                    🔒 Locked
                  </span>
                )}
              </div>
              <select
                id="ddMicrocredentialCourseStreamId"
                name="ddMicrocredentialCourseStreamId"
                value={selectedStreamId}
                onChange={handleStreamChange}
                disabled={isCourseLocked || loadingStreams || saving}
                className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800/80 disabled:text-gray-600 dark:disabled:text-gray-300 disabled:cursor-not-allowed"
              >
                <option value="">Select Stream</option>
                {streamList.map((stream) => (
                  <option
                    key={stream.streamId || stream.id}
                    value={String(stream.streamId || stream.id)}
                  >
                    {stream.streamName || stream.name}
                  </option>
                ))}
                {selectedStreamId &&
                  !streamList.some(
                    (s) => String(s.streamId || s.id) === String(selectedStreamId)
                  ) && (
                    <option value={selectedStreamId}>
                      {passedStreamName || `Stream #${selectedStreamId}`}
                    </option>
                  )}
              </select>
            </div>

            {/* Field 2: Select Microcredential Course */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Select Course <span className="text-red-500">*</span>
                </label>
                {isCourseLocked && (
                  <span className="text-[10px] text-blue-600 font-medium bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 rounded">
                    🔒 Locked
                  </span>
                )}
              </div>
              <select
                id="courseSelect"
                name="courseSelect"
                value={selectedCourseId}
                onChange={handleCourseChange}
                disabled={isCourseLocked || loadingCourses || saving}
                className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800/80 disabled:text-gray-600 dark:disabled:text-gray-300 disabled:cursor-not-allowed"
              >
                <option value="">
                  {loadingCourses ? "Loading courses..." : "Select Course"}
                </option>
                {courseList.map((c) => (
                  <option
                    key={c.microcredentialCourseId}
                    value={String(c.microcredentialCourseId)}
                  >
                    {c.microcredentialCourseName}
                  </option>
                ))}
                {selectedCourseId &&
                  !courseList.some(
                    (c) => String(c.microcredentialCourseId) === String(selectedCourseId)
                  ) && (
                    <option value={selectedCourseId}>
                      {passedCourseName || `Course #${selectedCourseId}`}
                    </option>
                  )}
              </select>
            </div>

            {/* Field 3: Select Module (Microcredential Module Master) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Select Module {moduleList.length > 0 && <span className="text-red-500">*</span>}
                </label>
                {isModuleLocked && (
                  <span className="text-[10px] text-purple-600 font-medium bg-purple-50 dark:bg-purple-950/40 px-1.5 py-0.5 rounded">
                    🔒 Locked
                  </span>
                )}
              </div>
              <select
                id="moduleSelect"
                name="moduleSelect"
                value={selectedModuleId}
                onChange={(e) => setSelectedModuleId(e.target.value)}
                disabled={isModuleLocked || loadingModules || saving}
                className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800/80 disabled:text-gray-600 dark:disabled:text-gray-300 disabled:cursor-not-allowed"
              >
                <option value="">
                  {loadingModules
                    ? "Loading modules..."
                    : !selectedCourseId
                    ? "Select course first"
                    : moduleList.length === 0
                    ? "-- No Modules (Create in Module List) --"
                    : "-- Select Module --"}
                </option>
                {moduleList.map((m) => (
                  <option
                    key={m.microcredentialModuleMasterId}
                    value={String(m.microcredentialModuleMasterId)}
                  >
                    {m.moduleName}
                  </option>
                ))}
                {selectedModuleId &&
                  !moduleList.some(
                    (m) => String(m.microcredentialModuleMasterId) === String(selectedModuleId)
                  ) && (
                    <option value={selectedModuleId}>
                      {passedModuleName || `Module #${selectedModuleId}`}
                    </option>
                  )}
              </select>
              {selectedCourseId && moduleList.length === 0 && !loadingModules && (
                <div className="mt-1">
                  <Link
                    to="/microcredential/module-add"
                    state={{ courseId: selectedCourseId, streamId: selectedStreamId }}
                    className="text-[11px] text-blue-600 hover:underline inline-flex items-center gap-1 font-medium"
                  >
                    + Add Module
                  </Link>
                </div>
              )}
            </div>

            {/* Field 4: Student Download Document (Multiple Documents with Remove Button) */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Student Download Document
              </label>
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.zip,.rar,.xls,.xlsx,.ppt,.pptx"
                onChange={handleStudentDocsChange}
                disabled={saving}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs text-gray-700 file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-gray-700 hover:file:bg-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:file:bg-gray-700 dark:file:text-gray-200"
              />

              {/* Uploaded / Selected / Existing Document List */}
              {studentDocs.length > 0 && (
                <div className="mt-2.5 space-y-2 max-h-48 overflow-y-auto pr-1">
                  <p className="text-[11px] font-semibold text-gray-600 dark:text-gray-400">
                    Documents ({studentDocs.length}):
                  </p>
                  {studentDocs.map((doc, idx) => (
                    <div
                      key={doc.id || idx}
                      id={doc.id || doc.microcredentialStudentDownloadDocumentId || `doc-${idx}`}
                      className="flex items-center justify-between gap-2 rounded-xl border border-gray-200 bg-gray-50/80 px-3 py-2 text-xs dark:border-gray-700 dark:bg-gray-800/60"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <FileIcon className="size-4 shrink-0 text-brand-500" />
                        <div className="min-w-0 flex-1">
                          <p
                            className="truncate font-medium text-gray-800 dark:text-gray-200 text-xs"
                            title={doc.originalFileName || doc.givenFileName || "Document"}
                          >
                            {doc.originalFileName || doc.givenFileName || "Document"}
                          </p>
                          {doc.uploading ? (
                            <span className="flex items-center gap-1 text-[10px] font-medium text-blue-600">
                              <span className="inline-block size-2.5 animate-spin rounded-full border border-blue-600 border-t-transparent" />
                              <span>Uploading...</span>
                            </span>
                          ) : (doc.previewUrl || doc.filePath) ? (
                            <a
                              href={doc.previewUrl || formatImageUrl(doc.filePath)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-brand-600 hover:text-brand-700 hover:underline dark:text-brand-400 font-medium inline-flex items-center gap-1"
                            >
                              <span>View / Download</span>
                            </a>
                          ) : null}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeStudentDownloadDocument(doc.id || doc.microcredentialStudentDownloadDocumentId || idx)}
                        disabled={saving}
                        title="Remove document from course"
                        className="shrink-0 rounded-lg p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700 transition dark:hover:bg-red-950/40"
                      >
                        <TrashBinIcon className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Row: + Add Topic Button right-aligned */}
          <div className="flex items-center justify-end py-5">
            <button
              type="button"
              onClick={handleAddTopic}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/90 px-4 py-2 text-xs font-semibold text-emerald-700 shadow-xs hover:border-emerald-300 hover:bg-emerald-100 active:scale-95 transition dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300 dark:hover:bg-emerald-950/50"
            >
              <svg
                className="size-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>+ Add Topic</span>
            </button>
          </div>

          {/* Dynamic Topic Cards matching Screenshots 1 & 4 */}
          <div className="space-y-5">
            {topics.map((topic, index) => (
              <div
                key={index}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs transition dark:border-gray-700 dark:bg-gray-800/40"
              >
                {/* Topic Card Header */}
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                   
                    <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400">
                      Topic {index + 1}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveTopic(index)}
                    disabled={saving}
                    className="inline-flex items-center gap-1 rounded-lg bg-[#2D3748] px-3 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-gray-700 active:scale-95 transition dark:bg-gray-700 dark:hover:bg-gray-600"
                  >
                    <span>🗑</span>
                    <span>Remove</span>
                  </button>
                </div>

                {/* 2x2 Grid inside Topic Card */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  {/* Row 1, Col 1: Topic Name */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      Topic Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={topic.topicName}
                      onChange={(e) =>
                        handleTopicFieldChange(index, "topicName", e.target.value)
                      }
                      placeholder="Enter topic name"
                      disabled={saving}
                      className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-800 placeholder-gray-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                  </div>

                  {/* Row 1, Col 2: Video Title */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  
                      <span>Video Title</span>
                    </label>
                    <input
                      type="text"
                      value={topic.videoTitle}
                      onChange={(e) =>
                        handleTopicFieldChange(index, "videoTitle", e.target.value)
                      }
                      placeholder="Enter video title"
                      disabled={saving}
                      className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-800 placeholder-gray-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                  </div>

                  {/* Row 2, Col 1: Video Url */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                   
                      <span>Video Url</span>
                    </label>
                    <input
                      type="text"
                      value={topic.topicVideoUrl}
                      onChange={(e) =>
                        handleTopicFieldChange(index, "topicVideoUrl", e.target.value)
                      }
                      placeholder="https://www.youtube.com/watch?v=8ihY2TXZuz0"
                      disabled={saving}
                      className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-800 placeholder-gray-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                  </div>

                  {/* Row 2, Col 2: Upload PDF */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                
                      <span>Upload PDF</span>
                    </label>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handleTopicPdfChange(index, e)}
                      disabled={saving}
                      className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs text-gray-700 file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-gray-700 hover:file:bg-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:file:bg-gray-700 dark:file:text-gray-200"
                    />
                    {topic.topicPdf && (
                      <div className="mt-1.5 flex items-center gap-2 text-xs">
                        {topic.uploadingPdf ? (
                          <span className="flex items-center gap-1 font-medium text-blue-600">
                            <span className="inline-block size-3 animate-spin rounded-full border border-blue-600 border-t-transparent" />
                            <span>Uploading PDF...</span>
                          </span>
                        ) : (
                          <a
                            href={topic.previewUrl || formatImageUrl(topic.topicPdf)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                          >
                            <FileIcon className="size-3.5 shrink-0" />
                            <span>View uploaded PDF</span>
                          </a>
                        )}
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-600 dark:text-gray-400 truncate max-w-xs" title={topic.topicPdf}>
                          {topic.topicPdf.split("/").pop()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Action Buttons matching Screenshots 1 & 4 */}
          <div className="mt-8 flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            {/* Cancel Button */}
            <button
              type="button"
              onClick={() => {
                if (selectedModuleId) {
                  navigate(`/microcredential/module-topics/${selectedModuleId}`);
                } else {
                  navigate("/microcredential/module-list");
                }
              }}
              disabled={saving}
              className="rounded-lg bg-[#2D3748] px-6 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-gray-700 active:scale-95 transition disabled:opacity-50 dark:bg-gray-700 dark:hover:bg-gray-600"
            >
              Cancel
            </button>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-[#C53030] px-6 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#9B2C2C] active:scale-95 transition disabled:opacity-50"
            >
              {saving && (
                <div className="size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              )}
              <span>{saving ? "Submitting..." : "Submit"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
