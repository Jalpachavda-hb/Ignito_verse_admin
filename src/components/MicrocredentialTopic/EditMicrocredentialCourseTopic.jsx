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
  getMicrocredentialCourseDetail,
  microCourseTopicAddUpdate,
  commonUploadFile,
  getMicroCourseTopicDetail,
  
  getMicrocredentialStudentDownloadDocuments,
  downloadMicroTopicTemplate,
  uploadMicroTopicExcel,
  getMicrocredentialModuleByCourseId,
  getMicrocredentialTopicByModuleId,
} from "../../services/adminMicrocredentialService";
import { formatImageUrl } from "../../dto/output/homepageOutputs";

export default function EditMicrocredentialCourseTopic() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  // Extract courseId from URL params, query string, or location.state
  const searchParams = new URLSearchParams(location.search);
  const queryCourseId = Number(
    searchParams.get("MicrocredentialCourseId") ||
    searchParams.get("microcredentialCourseId") ||
    searchParams.get("courseId") ||
    searchParams.get("id") ||
    0
  );
  const stateCourseId = Number(
    location.state?.courseId ||
    location.state?.item?.microcredentialCourseId ||
    location.state?.item?.MicrocredentialCourseId ||
    0
  );
  const paramCourseId = params.id ? Number(params.id) : 0;

  // Extract moduleId from params, query, or state
  const queryModuleId = Number(
    searchParams.get("MicrocredentialModuleMasterId") ||
    searchParams.get("microcredentialModuleMasterId") ||
    searchParams.get("moduleId") ||
    0
  );
  const stateModuleId = Number(
    location.state?.moduleId ||
    location.state?.item?.microcredentialModuleMasterId ||
    location.state?.item?.MicrocredentialModuleMasterId ||
    0
  );
  const paramModuleId = params.moduleId ? Number(params.moduleId) : 0;

  // Check sessionStorage for last cached edit context
  let cachedEditContext = null;
  const lookupKey = paramModuleId || queryModuleId || stateModuleId || paramCourseId || queryCourseId || stateCourseId;
  if (lookupKey) {
    try {
      const stored = sessionStorage.getItem(`ignito_edit_topic_ctx_${lookupKey}`) || sessionStorage.getItem("ignito_edit_topic_ctx_last");
      if (stored) cachedEditContext = JSON.parse(stored);
    } catch {}
  }

  const courseId = paramCourseId || queryCourseId || stateCourseId || cachedEditContext?.courseId || 0;
  const initialModuleId = paramModuleId || queryModuleId || stateModuleId || cachedEditContext?.moduleId || 0;

  // Passed context values for pre-selection / locking
  const passedCourseName =
    location.state?.courseName ||
    location.state?.item?.microcredentialCourseName ||
    searchParams.get("courseName") ||
    cachedEditContext?.courseName ||
    "";
  const passedStreamId = location.state?.streamId
    ? String(location.state.streamId)
    : (searchParams.get("streamId") || (cachedEditContext?.streamId ? String(cachedEditContext.streamId) : ""));
  const passedStreamName =
    location.state?.streamName ||
    searchParams.get("streamName") ||
    cachedEditContext?.streamName ||
    "";
  const passedModuleName =
    location.state?.moduleName ||
    location.state?.item?.moduleName ||
    searchParams.get("moduleName") ||
    cachedEditContext?.moduleName ||
    "";

  const isCourseLocked = Boolean(
    location.state?.isCourseLocked ||
    (courseId > 0 && initialModuleId > 0)
  );
  const isModuleLocked = Boolean(
    location.state?.isModuleLocked ||
    initialModuleId > 0
  );

  // Loading and feedback states
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [saving, setSaving] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const [uploadingExcel, setUploadingExcel] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Dropdown states
  const [streamList, setStreamList] = useState([]);
  const [courseList, setCourseList] = useState([]);
  const [moduleList, setModuleList] = useState([]);
  const [selectedStreamId, setSelectedStreamId] = useState(passedStreamId);
  const [selectedCourseId, setSelectedCourseId] = useState(courseId ? String(courseId) : "");
  const [selectedModuleId, setSelectedModuleId] = useState(
    initialModuleId ? String(initialModuleId) : ""
  );
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

  // Load topics specifically by Module ID via GetMicrocredentialTopicByModuleId
  const loadTopicsForModule = async (moduleIdToLoad) => {
    if (!moduleIdToLoad || Number(moduleIdToLoad) <= 0) return null;
    try {
      const topicRes = await getMicrocredentialTopicByModuleId(Number(moduleIdToLoad));
      if (topicRes && topicRes.success) {
        const rawTopics = topicRes.microcredentialTopicList || [];
        if (Array.isArray(rawTopics) && rawTopics.length > 0) {
          setTopics(
            rawTopics.map((t) => ({
              microCourseTopicId: t.microCourseTopicId,
              topicName:
                t.topicName ||
                t.TopicName ||
                "",
              videoTitle:
                t.videoTitle ||
                t.VideoTitle ||
                "",
              topicVideoUrl:
                t.topicVideoUrl ||
                t.TopicVideoUrl ||
                t.videoUrl ||
                t.watchVideoURL ||
                "",
              topicPdf:
                t.topicPdf ||
                t.TopicPdf ||
                t.topicDocument ||
                "",
              pdfFile: null,
            }))
          );
        } else {
          setTopics([
            {
              topicName: "",
              videoTitle: "",
              topicVideoUrl: "",
              topicPdf: "",
              pdfFile: null,
            },
          ]);
        }
        return topicRes;
      }
    } catch (err) {
      console.warn("Could not load topics by module ID:", err);
    }
    return null;
  };

  // Fetch Stream list & Load Existing Course Data on Mount
  useEffect(() => {
    let isMounted = true;

    async function initializeEditPage() {
      setLoadingInitial(true);
      setErrorMessage("");

      try {
        // 1. Fetch Streams
        const streamRes = await getStreamData();
        const streams = streamRes?.success ? (streamRes.streamDataList || []) : [];
        if (isMounted) setStreamList(streams);

        let targetCourseId = courseId;
        const targetModuleId = initialModuleId;
        const stateItem = location.state?.item;
        let detailRes = null;

        // 2. Fetch Topics strictly assigned to module via GetMicrocredentialTopicByModuleId
        if (targetModuleId > 0) {
          const modTopicsRes = await loadTopicsForModule(targetModuleId);
          if (modTopicsRes?.microcredentialTopicList?.[0]?.microcredentialCourseId && !targetCourseId) {
            targetCourseId = modTopicsRes.microcredentialTopicList[0].microcredentialCourseId;
          }
        } else if (targetCourseId > 0) {
          // Fallback to course-level topics if no module was specified
          detailRes = await loadTopicDetailsAndDocs(targetCourseId);
        }

        // 3. Fetch modules and course docs for course
        if (targetCourseId > 0) {
          try {
            const modRes = await getMicrocredentialModuleByCourseId(targetCourseId);
            if (modRes && modRes.success) {
              setModuleList(modRes.microcredentialModuleList || []);
            }
          } catch (mErr) {
            console.warn("Could not fetch modules for course:", mErr);
          }

          // Fetch student download documents
          try {
            const docsRes = await getMicrocredentialStudentDownloadDocuments(
              Number(targetCourseId),
              Number(targetModuleId || 0)
            );
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
            }
          } catch (dErr) {
            console.warn("Could not fetch student docs:", dErr);
          }
        }

        // 4. Match Stream & Populate Course Dropdown
        let targetStreamId = passedStreamId ? Number(passedStreamId) : "";
        if (!targetStreamId) {
          if (stateItem?.streamId || stateItem?.StreamId) {
            targetStreamId = Number(stateItem.streamId || stateItem.StreamId);
          } else if (detailRes?.streamId) {
            targetStreamId = Number(detailRes.streamId);
          } else if (passedStreamName || stateItem?.streamName || detailRes?.streamName) {
            const sName = passedStreamName || stateItem?.streamName || detailRes?.streamName;
            const found = streams.find(
              (s) => s.streamName?.toLowerCase().trim() === sName?.toLowerCase().trim()
            );
            if (found) targetStreamId = found.streamId;
          }
        }

        if (!targetStreamId && targetCourseId > 0) {
          try {
            const courseDetailRes = await getMicrocredentialCourseDetail(targetCourseId);
            if (courseDetailRes?.microcredentialCourseStreamId) {
              targetStreamId = Number(courseDetailRes.microcredentialCourseStreamId);
            } else if (courseDetailRes?.streamName) {
              const found = streams.find(
                (s) => s.streamName?.toLowerCase().trim() === courseDetailRes.streamName.toLowerCase().trim()
              );
              if (found) targetStreamId = found.streamId;
            }
          } catch (cErr) {
            console.warn("Could not fetch course detail for stream matching:", cErr);
          }
        }

        // 5. Populate Stream & Load Courses for that Stream
        if (targetStreamId) {
          if (isMounted) {
            setSelectedStreamId(String(targetStreamId));
            if (targetCourseId) setSelectedCourseId(String(targetCourseId));
            if (targetModuleId) setSelectedModuleId(String(targetModuleId));
          }
          await loadCoursesForStream(targetStreamId, targetCourseId);
        } else if (targetCourseId > 0) {
          for (const s of streams) {
            const sId = s.streamId;
            const cRes = await getMicrocredentialCourse(sId);
            if (cRes && cRes.success) {
              const cList = cRes.microcredentialCourseOutputList || [];
              const matched = cList.find(
                (c) => Number(c.microcredentialCourseId) === Number(targetCourseId)
              );
              if (matched && isMounted) {
                setSelectedStreamId(String(sId));
                setCourseList(cList);
                setSelectedCourseId(String(targetCourseId));
                if (targetModuleId) setSelectedModuleId(String(targetModuleId));
                break;
              }
            }
          }
        }

        // Save to sessionStorage for future refreshes
        if (targetCourseId || targetModuleId) {
          try {
            const ctxPayload = JSON.stringify({
              courseId: targetCourseId,
              moduleId: targetModuleId,
              streamId: targetStreamId,
              courseName: passedCourseName,
              moduleName: passedModuleName,
              streamName: passedStreamName,
            });
            if (targetCourseId) sessionStorage.setItem(`ignito_edit_topic_ctx_${targetCourseId}`, ctxPayload);
            if (targetModuleId) sessionStorage.setItem(`ignito_edit_topic_ctx_${targetModuleId}`, ctxPayload);
            sessionStorage.setItem("ignito_edit_topic_ctx_last", ctxPayload);
          } catch {}
        }
      } catch (err) {
        console.error("Error initializing edit topic page:", err);
        if (isMounted) setErrorMessage("Failed to load topic details.");
      } finally {
        if (isMounted) setLoadingInitial(false);
      }
    }

    initializeEditPage();

    return () => {
      isMounted = false;
    };
  }, [courseId, initialModuleId]);

  // Load courses for selected stream
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

  // Load topics & student download documents for course
  const loadTopicDetailsAndDocs = async (id, modId = null) => {
    if (!id || id <= 0) return;
    try {
      // Topics detail API
      const detailRes = await getMicroCourseTopicDetail(id, 0);
      if (detailRes && detailRes.success) {
        const rawTopics =
          detailRes.getMicroCourseTopicDetailList ||
          detailRes.microCourseTopicDetailList ||
          detailRes.topicList ||
          [];

        if (Array.isArray(rawTopics) && rawTopics.length > 0) {
          setTopics(
            rawTopics.map((t) => ({
              topicName:
                t.topicName ||
                t.TopicName ||
                t.microcredentialTopicName ||
                t.MicrocredentialTopicName ||
                "",
              videoTitle:
                t.videoTitle ||
                t.VideoTitle ||
                t.videoName ||
                "",
              topicVideoUrl:
                t.topicVideoUrl ||
                t.TopicVideoUrl ||
                t.videoURL ||
                t.VideoURL ||
                t.videoUrl ||
                t.watchVideoURL ||
                "",
              topicPdf:
                t.topicPdf ||
                t.TopicPdf ||
                t.topicDocument ||
                t.topicPDF ||
                "",
              pdfFile: null,
            }))
          );
        }

        const rawStudentDocs =
          detailRes.microcredentialStudentDownloadDocumentList ||
          detailRes.MicrocredentialStudentDownloadDocumentList ||
          [];

        if (Array.isArray(rawStudentDocs) && rawStudentDocs.length > 0) {
          setStudentDocs(
            rawStudentDocs.map((d, index) => {
              const docIdNum = Number(d.microcredentialStudentDownloadDocumentId ?? d.MicrocredentialStudentDownloadDocumentId ?? 0);
              return {
                id: docIdNum > 0 ? docIdNum : `doc_${Date.now()}_${index}`,
                documentId: docIdNum,
                microcredentialStudentDownloadDocumentId: docIdNum,
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
              };
            })
          );
        }
      }

      // Also fetch student documents endpoint
      try {
        const targetModId = modId !== null ? Number(modId) : Number(selectedModuleId || initialModuleId || 0);
        const studentDocsRes = await getMicrocredentialStudentDownloadDocuments(id, targetModId);
        const list =
          studentDocsRes?.adminGetMicrocredentialStudentDownloadDocumentsData ||
          studentDocsRes?.microcredentialStudentDownloadDocumentList ||
          studentDocsRes?.rawData?.adminGetMicrocredentialStudentDownloadDocumentsData ||
          studentDocsRes?.rawData?.AdminGetMicrocredentialStudentDownloadDocumentsData ||
          [];
        if (Array.isArray(list) && list.length > 0) {
          setStudentDocs(
            list.map((d, index) => {
              const docIdNum = Number(d.microcredentialStudentDownloadDocumentId ?? d.MicrocredentialStudentDownloadDocumentId ?? 0);
              return {
                id: docIdNum > 0 ? docIdNum : `doc_${Date.now()}_${index}`,
                documentId: docIdNum,
                microcredentialStudentDownloadDocumentId: docIdNum,
                originalFileName:
                  d.originalFileName || d.OriginalFileName || "Student Document",
                givenFileName: d.givenFileName || d.GivenFileName || d.originalFileName || d.OriginalFileName || "Student Document",
                filePath:
                  d.microcredentialStudentDownloadDocument ||
                  d.MicrocredentialStudentDownloadDocument ||
                  d.filePath ||
                  "",
                file: null,
                isExisting: true,
              };
            })
          );
        }
      } catch (dErr) {
        console.warn("Could not fetch student docs in loadTopicDetailsAndDocs:", dErr);
      }

      return detailRes;
    } catch (err) {
      console.warn("Could not load topic details for course:", err);
      return null;
    }
  };

  // Stream dropdown change - Sequential Cascade Step 1
  const handleStreamChange = async (e) => {
    const streamId = e.target.value;
    setSelectedStreamId(streamId);
    setSelectedCourseId("");
    setSelectedModuleId("");
    setCourseList([]);
    setModuleList([]);
    setStudentDocs([]);
    setTopics([
      {
        topicName: "",
        videoTitle: "",
        topicVideoUrl: "",
        topicPdf: "",
        pdfFile: null,
      },
    ]);
    if (streamId) {
      await loadCoursesForStream(streamId);
    } else {
      setCourseList([]);
    }
  };

  // Course dropdown change
  const handleCourseChange = async (e) => {
    const newCourseId = e.target.value;
    setSelectedCourseId(newCourseId);
    setSelectedModuleId("");
    setModuleList([]);
    if (!newCourseId) return;

    // Load modules for newly selected course
    setLoadingModules(true);
    try {
      const modRes = await getMicrocredentialModuleByCourseId(Number(newCourseId));
      if (modRes && modRes.success) {
        setModuleList(modRes.microcredentialModuleList || []);
      }
    } catch (err) {
      console.warn("Error loading modules for course:", err);
    } finally {
      setLoadingModules(false);
    }

    try {
      await loadTopicDetailsAndDocs(Number(newCourseId), 0);
    } catch (err) {
      console.error("Error loading topic details for selected course:", err);
    }
  };

  // Module dropdown change: dynamically load topics assigned to this module via GetMicrocredentialTopicByModuleId
  const handleModuleChange = async (e) => {
    const newModId = e.target.value;
    setSelectedModuleId(newModId);
    if (!newModId) return;

    setLoadingInitial(true);
    try {
      await loadTopicsForModule(Number(newModId));
      const targetCId = Number(selectedCourseId || courseId || 0);
      if (targetCId > 0) {
        const studentDocsRes = await getMicrocredentialStudentDownloadDocuments(
          targetCId,
          Number(newModId)
        );
        const list =
          studentDocsRes?.adminGetMicrocredentialStudentDownloadDocumentsData ||
          studentDocsRes?.microcredentialStudentDownloadDocumentList ||
          studentDocsRes?.rawData?.adminGetMicrocredentialStudentDownloadDocumentsData ||
          studentDocsRes?.rawData?.AdminGetMicrocredentialStudentDownloadDocumentsData ||
          [];
        if (Array.isArray(list)) {
          setStudentDocs(
            list.map((d, index) => {
              const docIdNum = Number(d.microcredentialStudentDownloadDocumentId ?? d.MicrocredentialStudentDownloadDocumentId ?? 0);
              return {
                id: docIdNum > 0 ? docIdNum : `doc_${Date.now()}_${index}`,
                documentId: docIdNum,
                microcredentialStudentDownloadDocumentId: docIdNum,
                originalFileName:
                  d.originalFileName || d.OriginalFileName || "Student Document",
                givenFileName: d.givenFileName || d.GivenFileName || d.originalFileName || d.OriginalFileName || "Student Document",
                filePath:
                  d.microcredentialStudentDownloadDocument ||
                  d.MicrocredentialStudentDownloadDocument ||
                  d.filePath ||
                  "",
                file: null,
                isExisting: true,
              };
            })
          );
        }
      }
    } catch (err) {
      console.error("Error loading module topics on module change:", err);
    } finally {
      setLoadingInitial(false);
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

  // Submit Handler: Add / Update Microcredential Course Topic (API 5)
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
        AdminId: 1,
        MicrocredentialCourseId: Number(selectedCourseId),
        MicrocredentialModuleMasterId: Number(selectedModuleId || 0),
        StreamId: Number(selectedStreamId),
        UploadMicroDocument: "",
        MicrocredentialCourseTopicList: finalTopicsList,
        MicrocredentialStudentDownloadDocumentList: finalStudentDocsList,
      };

      const res = await microCourseTopicAddUpdate(payload);

      if (res && res.success !== false) {
        const msg = res.message || "Microcredential module topics updated successfully.";
        setSuccessMessage(msg);

        setTimeout(() => {
          if (selectedModuleId) {
            navigate(`/microcredential/module-topics/${selectedModuleId}`, {
              state: {
                successMessage: msg,
                courseId: selectedCourseId,
                courseName:
                  courseList.find((c) => String(c.microcredentialCourseId) === String(selectedCourseId))?.microcredentialCourseName ||
                  passedCourseName ||
                  location.state?.courseName,
                streamId: selectedStreamId,
                streamName:
                  streamList.find((s) => String(s.streamId) === String(selectedStreamId))?.streamName ||
                  passedStreamName ||
                  location.state?.streamName,
                moduleId: selectedModuleId,
                moduleName:
                  moduleList.find((m) => String(m.microcredentialModuleMasterId) === String(selectedModuleId))?.moduleName ||
                  passedModuleName ||
                  location.state?.moduleName,
              },
            });
          } else {
            navigate("/microcredential/module-list", {
              state: { successMessage: msg },
            });
          }
        }, 1000);
      } else {
        setErrorMessage(
          res.message || "Failed to update topics. Please verify your fields and retry."
        );
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err) {
      console.error("Error submitting micro course topic:", err);
      setErrorMessage("An unexpected error occurred while updating topics.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full pb-14">
      <PageMeta
        title="Update Topic Microcredential Courses | Ignito Admin"
        description="Update topics, video lectures, PDFs, and student download documents for microcredential courses."
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
              Update Topics
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Update Topic Microcredential Courses</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Modify course topics, lecture videos, downloadable PDFs, and student resources.
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
              if (selectedModuleId || initialModuleId) {
                const backModId = selectedModuleId || initialModuleId;
                navigate(`/microcredential/module-topics/${backModId}`, {
                  state: {
                    courseId: selectedCourseId || courseId,
                    courseName:
                      courseList.find((c) => String(c.microcredentialCourseId) === String(selectedCourseId))?.microcredentialCourseName ||
                      passedCourseName ||
                      location.state?.courseName,
                    streamId: selectedStreamId,
                    streamName:
                      streamList.find((s) => String(s.streamId) === String(selectedStreamId))?.streamName ||
                      passedStreamName ||
                      location.state?.streamName,
                    moduleId: backModId,
                    moduleName:
                      moduleList.find((m) => String(m.microcredentialModuleMasterId) === String(backModId))?.moduleName ||
                      passedModuleName ||
                      location.state?.moduleName,
                  },
                });
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
            <span>Back to Topics</span>
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
        {/* Module Context Info Banner if preselected */}
        {selectedModuleId && (
          <div className="mb-6 rounded-xl border border-purple-100 bg-purple-50/70 p-4 text-xs text-purple-800 dark:border-purple-900/40 dark:bg-purple-950/20 dark:text-purple-300 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-bold">Active Module Scope:</span>
              <span className="font-semibold text-purple-950 dark:text-purple-200">
                {moduleList.find((m) => String(m.microcredentialModuleMasterId) === String(selectedModuleId))?.moduleName || passedModuleName || `Module #${selectedModuleId}`}
              </span>
              {passedCourseName && (
                <span className="text-purple-600 dark:text-purple-400">({passedCourseName})</span>
              )}
            </div>
            <span className="text-[11px] font-semibold bg-purple-200/70 dark:bg-purple-900/50 px-2.5 py-0.5 rounded-md">
              Topics Strictly Assigned to Module
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Top Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start pb-6 border-b border-gray-100 dark:border-gray-800">
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
                disabled={isCourseLocked || loadingInitial || saving}
                className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800/60"
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
              </select>
            </div>

            {/* Field 2: Select Microcredential Course */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Select Course <span className="text-red-500">*</span>
              </label>
              <select
                id="courseSelect"
                name="courseSelect"
                value={selectedCourseId}
                onChange={handleCourseChange}
                disabled={isCourseLocked || !selectedStreamId || loadingCourses || saving}
                className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800/60"
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
              </select>
            </div>

            {/* Field 3: Select Module (Microcredential Module Master) */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Select Module {moduleList.length > 0 && <span className="text-red-500">*</span>}
              </label>
              <select
                id="moduleSelect"
                name="moduleSelect"
                value={selectedModuleId}
                onChange={handleModuleChange}
                disabled={isModuleLocked || !selectedCourseId || loadingModules || saving}
                className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800/60"
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

          {/* Topics Header & Add Topic Pill Button */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-gray-800 dark:text-white">
                Course Topics List
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Add, edit, or upload topics for this microcredential course.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddTopic}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50/90 px-3.5 py-1.5 text-xs font-semibold text-emerald-700 shadow-xs hover:border-emerald-300 hover:bg-emerald-100 disabled:opacity-60 active:scale-95 transition dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300 dark:hover:bg-emerald-950/50"
            >
              <svg
                className="size-3.5 text-emerald-600 dark:text-emerald-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>Add Topic</span>
            </button>
          </div>

          {/* Topics Grid / Cards */}
          <div className="mt-4 space-y-4">
            {topics.map((topic, index) => (
              <div
                key={index}
                className="rounded-2xl border border-gray-200 bg-gray-50/50 p-5 dark:border-gray-800 dark:bg-gray-800/40"
              >
                {/* Topic Card Header */}
                <div className="flex items-center justify-between border-b border-gray-200/80 pb-3 mb-4 dark:border-gray-700/80">
                  <div className="flex items-center gap-2">
                    <span className="flex size-6 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white shadow-xs">
                      {index + 1}
                    </span>
                    <span className="text-xs font-bold text-gray-800 dark:text-white">
                      Topic #{index + 1}
                    </span>
                  </div>

                  {topics.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTopic(index)}
                      disabled={saving}
                      className="rounded-lg border border-red-200 bg-red-50/80 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300"
                    >
                      Delete
                    </button>
                  )}
                </div>

                {/* Topic Fields Grid: 2 rows x 2 cols */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      placeholder="e.g. Introduction to Microservices"
                      disabled={saving}
                      className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-800 placeholder-gray-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                  </div>

                  {/* Row 1, Col 2: Video Title */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      Video Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={topic.videoTitle}
                      onChange={(e) =>
                        handleTopicFieldChange(index, "videoTitle", e.target.value)
                      }
                      placeholder="e.g. Session 1 Overview"
                      disabled={saving}
                      className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-800 placeholder-gray-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                  </div>

                  {/* Row 2, Col 1: Topic Video URL */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      Topic Video URL <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={topic.topicVideoUrl}
                      onChange={(e) =>
                        handleTopicFieldChange(index, "topicVideoUrl", e.target.value)
                      }
                      placeholder="https://www.youtube.com/watch?v=..."
                      disabled={saving}
                      className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-800 placeholder-gray-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                  </div>

                  {/* Row 2, Col 2: Upload PDF */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      <FileIcon className="size-3.5 text-gray-500 dark:text-gray-400" />
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
                if (selectedModuleId || initialModuleId) {
                  navigate(`/microcredential/module-topics/${selectedModuleId || initialModuleId}`);
                } else {
                  navigate("/microcredential/module-list");
                }
              }}
              disabled={saving}
              className="rounded-lg bg-[#2D3748] px-6 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-gray-700 active:scale-95 transition disabled:opacity-50 dark:bg-gray-700 dark:hover:bg-gray-600"
            >
              Cancel
            </button>

            {/* Update Button */}
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-[#C53030] px-6 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#9B2C2C] active:scale-95 transition disabled:opacity-50"
            >
              {saving && (
                <div className="size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              )}
              <span>{saving ? "Updating..." : "Update"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
