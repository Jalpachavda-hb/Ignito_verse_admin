import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation, Link } from "react-router";
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
  getMicroCourseTopicDetail,
  getMicrocredentialStudentDownloadDocuments,
  downloadMicroTopicTemplate,
  uploadMicroTopicExcel,
} from "../../services/adminMicrocredentialService";
import { formatImageUrl } from "../../dto/output/homepageOutputs";

export default function AddEditMicrocredentialCourseTopic({ isEdit: propIsEdit }) {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  // Determine edit mode from params, query param, or navigation state
  const searchParams = new URLSearchParams(location.search);
  const queryCourseId = Number(
    searchParams.get("MicrocredentialCourseId") ||
    searchParams.get("microcredentialCourseId") ||
    searchParams.get("id") ||
    0
  );
  const stateCourseId = Number(
    location.state?.item?.microcredentialCourseId ||
    location.state?.item?.MicrocredentialCourseId ||
    location.state?.courseId ||
    0
  );
  const routeCourseId = params.id
    ? Number(params.id)
    : (queryCourseId || stateCourseId || 0);
  const isEdit = Boolean(propIsEdit || routeCourseId > 0);

  // Loading & notification states
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [saving, setSaving] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const [uploadingExcel, setUploadingExcel] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Dropdowns state
  const [streamList, setStreamList] = useState([]);
  const [courseList, setCourseList] = useState([]);
  const [selectedStreamId, setSelectedStreamId] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState(routeCourseId || "");

  // Student Download Documents: [{ id, originalFileName, givenFileName, filePath, file, uploading, previewUrl }]
  const [studentDocs, setStudentDocs] = useState([]);

  // Topics list state
  // Item format: { topicName, videoTitle, topicVideoUrl, topicPdf, pdfFile }
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

  // 1. Initial Load: Fetch Stream list and load course details if editing
  useEffect(() => {
    let isMounted = true;

    async function loadStreams() {
      setLoadingInitial(true);
      try {
        // If routeCourseId is present, fetch topics immediately in parallel
        if (routeCourseId > 0) {
          loadTopicDetailsForCourse(routeCourseId);
        }

        const streamRes = await getStreamData();
        if (isMounted && streamRes && streamRes.success) {
          const streams = streamRes.streamDataList || [];
          setStreamList(streams);

          // If in Edit mode and location.state passed course item
          const stateItem = location.state?.item;
          let targetStreamId = "";

          if (stateItem?.streamId || stateItem?.StreamId) {
            targetStreamId = Number(stateItem.streamId || stateItem.StreamId);
          } else if (stateItem?.streamName) {
            const found = streams.find(
              (s) => s.streamName?.toLowerCase() === stateItem.streamName?.toLowerCase()
            );
            if (found) targetStreamId = found.streamId;
          }

          if (stateItem?.uploadMicroDocument) {
            setUploadMicroDocument(stateItem.uploadMicroDocument);
          }

          if (targetStreamId) {
            setSelectedStreamId(targetStreamId);
            await loadCoursesForStream(targetStreamId, routeCourseId);
          } else if (routeCourseId > 0) {
            // Find which stream owns this course
            await loadCourseDetail(routeCourseId, streams);
          }
        }
      } catch (err) {
        console.error("Error loading stream list:", err);
      } finally {
        if (isMounted) setLoadingInitial(false);
      }
    }

    loadStreams();

    return () => {
      isMounted = false;
    };
  }, [routeCourseId]);

  // Load courses for a specific stream
  const loadCoursesForStream = async (streamId, autoSelectCourseId = 0) => {
    if (!streamId) {
      setCourseList([]);
      return;
    }
    setLoadingCourses(true);
    try {
      const res = await getMicrocredentialCourse(streamId);
      if (res && res.success) {
        const list = res.microcredentialCourseOutputList || [];
        setCourseList(list);

        if (autoSelectCourseId > 0) {
          setSelectedCourseId(String(autoSelectCourseId));
          await loadTopicDetailsForCourse(autoSelectCourseId);
        }
      } else {
        setCourseList([]);
      }
    } catch (err) {
      console.error("Error loading courses for stream:", err);
      setCourseList([]);
    } finally {
      setLoadingCourses(false);
    }
  };

  // Load course detail when streamId wasn't passed directly in state
  const loadCourseDetail = async (courseId, streams = []) => {
    try {
      const res = await getMicroCourseTopicDetail(courseId, 0);
      if (res && res.success) {
        populateExistingTopics(res);
      }

      // Also try fetching student documents if separate
      const targetModId = Number(location.state?.moduleId || location.state?.item?.microcredentialModuleMasterId || 0);
      const studentDocsRes = await getMicrocredentialStudentDownloadDocuments(courseId, targetModId);
      if (studentDocsRes && studentDocsRes.success) {
        const list =
          studentDocsRes.adminGetMicrocredentialStudentDownloadDocumentsData ||
          studentDocsRes.microcredentialStudentDownloadDocumentList ||
          studentDocsRes?.rawData?.adminGetMicrocredentialStudentDownloadDocumentsData ||
          studentDocsRes?.rawData?.AdminGetMicrocredentialStudentDownloadDocumentsData ||
          [];
        if (list.length > 0) {
          setStudentDocs(
            list.map((d, index) => {
              const docIdNum = Number(d.microcredentialStudentDownloadDocumentId ?? d.MicrocredentialStudentDownloadDocumentId ?? 0);
              return {
                id: docIdNum > 0 ? docIdNum : `doc_${Date.now()}_${index}`,
                documentId: docIdNum,
                microcredentialStudentDownloadDocumentId: docIdNum,
                originalFileName: d.originalFileName || d.OriginalFileName || "Student Document",
                givenFileName: d.givenFileName || d.GivenFileName || d.originalFileName || d.OriginalFileName || "Student Document",
                filePath:
                  d.filePath ||
                  d.microcredentialStudentDownloadDocument ||
                  d.MicrocredentialStudentDownloadDocument ||
                  "",
                file: null,
                isExisting: true,
              };
            })
          );
        }
      }

      // Check if course info matches a stream in streams
      // If course is in courseList across streams, find it
      for (const s of streams) {
        const sId = s.streamId;
        const cRes = await getMicrocredentialCourse(sId);
        if (cRes && cRes.success) {
          const cList = cRes.microcredentialCourseOutputList || [];
          const matched = cList.find(
            (c) => Number(c.microcredentialCourseId) === Number(courseId)
          );
          if (matched) {
            setSelectedStreamId(sId);
            setCourseList(cList);
            setSelectedCourseId(courseId);
            break;
          }
        }
      }
    } catch (err) {
      console.error("Error loading course topic detail:", err);
    }
  };

  // Populate topics and docs from getMicroCourseTopicDetail response
  const populateExistingTopics = (detailData) => {
    const rawTopicList =
      detailData.getMicroCourseTopicDetailList ||
      detailData.microCourseTopicDetailList ||
      detailData.topicList ||
      [];

    if (Array.isArray(rawTopicList) && rawTopicList.length > 0) {
      setTopics(
        rawTopicList.map((t) => ({
          topicName:
            t.microcredentialTopicName ||
            t.topicName ||
            t.TopicName ||
            "",
          videoTitle:
            t.videoTitle ||
            t.VideoTitle ||
            t.videoName ||
            "",
          topicVideoUrl:
            t.videoURL ||
            t.watchVideoURL ||
            t.videoUrl ||
            t.TopicVideoUrl ||
            "",
          topicPdf:
            t.topicDocument ||
            t.topicPDF ||
            t.TopicPdf ||
            t.topicPdf ||
            "",
          pdfFile: null,
        }))
      );
    }

    const rawStudentDocList =
      detailData.microcredentialStudentDownloadDocumentList ||
      detailData.MicrocredentialStudentDownloadDocumentList ||
      [];

    if (Array.isArray(rawStudentDocList) && rawStudentDocList.length > 0) {
      setStudentDocs(
        rawStudentDocList.map((d, index) => ({
          id: d.microcredentialStudentDownloadDocumentId || `doc_${Date.now()}_${index}`,
          originalFileName:
            d.originalFileName || d.OriginalFileName || "Student Document",
          givenFileName: d.givenFileName || d.GivenFileName || "",
          filePath:
            d.filePath ||
            d.microcredentialStudentDownloadDocument ||
            d.MicrocredentialStudentDownloadDocument ||
            "",
          file: null,
          isExisting: true,
        }))
      );
    }
  };

  // When selected course changes
  const loadTopicDetailsForCourse = async (courseId) => {
    if (!courseId) return;
    try {
      const res = await getMicroCourseTopicDetail(courseId, 0);
      if (res && res.success) {
        populateExistingTopics(res);
      }

      const targetModId = Number(location.state?.moduleId || location.state?.item?.microcredentialModuleMasterId || 0);
      const docsRes = await getMicrocredentialStudentDownloadDocuments(courseId, targetModId);
      if (docsRes && docsRes.success) {
        const list =
          docsRes.adminGetMicrocredentialStudentDownloadDocumentsData ||
          docsRes.microcredentialStudentDownloadDocumentList ||
          [];
        if (list.length > 0) {
          setStudentDocs(
            list.map((d, index) => ({
              id: d.microcredentialStudentDownloadDocumentId || `doc_${Date.now()}_${index}`,
              originalFileName:
                d.originalFileName || d.OriginalFileName || "Document",
              givenFileName: d.givenFileName || d.GivenFileName || "",
              filePath:
                d.filePath ||
                d.microcredentialStudentDownloadDocument ||
                d.MicrocredentialStudentDownloadDocument ||
                "",
              file: null,
              isExisting: true,
            }))
          );
        }
      }
    } catch (err) {
      console.warn("Could not load details for course:", err);
    }
  };

  // Stream select handler
  const handleStreamChange = async (e) => {
    const streamId = e.target.value;
    setSelectedStreamId(streamId);
    setSelectedCourseId("");
    if (streamId) {
      await loadCoursesForStream(streamId);
    } else {
      setCourseList([]);
    }
  };

  // Course select handler
  const handleCourseChange = async (e) => {
    const courseId = e.target.value;
    setSelectedCourseId(courseId);
    if (courseId) {
      await loadTopicDetailsForCourse(courseId);
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
      // Clear instead of removing last card
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

  // Update topic field
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
        setSuccessMessage("Excel parsed successfully! Topics have been loaded.");

        if (res.stream && streamList.length > 0) {
          const matchedStream = streamList.find(
            (s) => s.streamName?.toLowerCase() === res.stream?.toLowerCase()
          );
          if (matchedStream) {
            setSelectedStreamId(matchedStream.streamId);
            await loadCoursesForStream(matchedStream.streamId);
          }
        }

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

  // Form Submit Handler (API 5)
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

    // Filter valid topics
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
      // 1. Upload Student Download Documents if any newly selected
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
        MicrocredentialModuleMasterId: Number(location.state?.moduleId || location.state?.item?.microcredentialModuleMasterId || 0),
        AdminId: 1,
        UploadMicroDocument: "",
        MicrocredentialCourseTopicList: finalTopicsList,
        MicrocredentialStudentDownloadDocumentList: finalStudentDocsList,
      };

      const res = await microCourseTopicAddUpdate(payload);

      if (res && res.success !== false) {
        const msg =
          res.message ||
          (isEdit
            ? "Microcredential course topics updated successfully."
            : "Microcredential course topics added successfully.");
        setSuccessMessage(msg);

        // Redirect back to list after short delay
        setTimeout(() => {
          navigate("/microcredential/topic-list", {
            state: { successMessage: msg },
          });
        }, 1200);
      } else {
        setErrorMessage(
          res.message || "Failed to save topics. Please check your data and retry."
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
        title={`${isEdit ? "Update" : "Add"} Topic Microcredential Courses | Ignito Admin`}
        description="Add and update topics, video links, PDFs, and student download documents for microcredential courses."
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
              {isEdit ? "Update Topics" : "Add Topics"}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>{isEdit ? "Update" : "Add"} Topic Microcredential Courses</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Manage course topics, lecture videos, downloadable PDFs, and student resources.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Excel Template Download Button */}
          <button
            type="button"
            onClick={handleDownloadTemplate}
            disabled={downloadingTemplate || !selectedCourseId}
            title={!selectedCourseId ? "Select a course first to download template" : "Download Excel Template"}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-xs hover:border-gray-300 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          >
            <DownloadIcon className="size-3.5 text-gray-500" />
            <span>{downloadingTemplate ? "Downloading..." : "Download Excel Template"}</span>
          </button>

          {/* Hidden Excel File Input */}
          <input
            type="file"
            ref={excelInputRef}
            onChange={handleExcelUpload}
            accept=".xlsx,.xls"
            className="hidden"
          />

          {/* Excel Upload Button */}
          <button
            type="button"
            onClick={() => excelInputRef.current?.click()}
            disabled={uploadingExcel}
            className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50/90 px-3.5 py-2 text-xs font-semibold text-blue-700 shadow-xs hover:border-blue-300 hover:bg-blue-100 disabled:opacity-50 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-300"
          >
            <FileIcon className="size-3.5" />
            <span>{uploadingExcel ? "Processing Excel..." : "Upload Excel"}</span>
          </button>

          {/* Back Button */}
          <button
            type="button"
            onClick={() => navigate("/microcredential/topic-list")}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-xs hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
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
          {/* Top 4 Fields Grid matching Screenshot 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-start pb-6 border-b border-gray-100 dark:border-gray-800">
            {/* Field 1: Select Stream */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Select Stream <span className="text-red-500">*</span>
              </label>
              <select
                id="ddMicrocredentialCourseStreamId"
                name="ddMicrocredentialCourseStreamId"
                value={selectedStreamId}
                onChange={handleStreamChange}
                disabled={loadingInitial || saving}
                className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="">Select Microcredential Course Stream</option>
                {streamList.map((stream) => (
                  <option
                    key={stream.streamId || stream.id}
                    value={String(stream.streamId || stream.id)}
                  >
                    {stream.streamName || stream.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Field 2: Select Microcredential Course */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Select Microcredential <span className="text-red-500">*</span>
              </label>
              <select
                id="courseSelect"
                name="courseSelect"
                value={selectedCourseId}
                onChange={handleCourseChange}
                disabled={!selectedStreamId || loadingCourses || saving}
                className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800/60"
              >
                <option value="">
                  {loadingCourses ? "Loading courses..." : "Select micro credential course"}
                </option>
                {courseList.map((course) => (
                  <option
                    key={course.microcredentialCourseId}
                    value={String(course.microcredentialCourseId)}
                  >
                    {course.microcredentialCourseName}
                  </option>
                ))}
              </select>
            </div>

            {/* Field 3: Student Download Document (Multiple Documents with Remove Button) */}
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
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500 bg-white px-4 py-2 text-xs font-semibold text-emerald-600 shadow-xs hover:bg-emerald-50 active:scale-95 transition dark:bg-gray-800 dark:hover:bg-emerald-950/30"
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
              onClick={() => navigate("/microcredential/topic-list")}
              disabled={saving}
              className="rounded-lg bg-[#2D3748] px-6 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-gray-700 active:scale-95 transition disabled:opacity-50 dark:bg-gray-700 dark:hover:bg-gray-600"
            >
              Cancel
            </button>

            {/* Update / Submit Button */}
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-[#C53030] px-6 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#9B2C2C] active:scale-95 transition disabled:opacity-50"
            >
              {saving && (
                <div className="size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              )}
              <span>{saving ? "Saving..." : isEdit ? "Update" : "Submit"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
