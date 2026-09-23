import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router";
import PageBreadcrumb from "../common/PageBreadCrumb";
import PageMeta from "../common/PageMeta";
import {
  CheckCircleIcon,
  AlertIcon,
  TrashBinIcon,
  PencilIcon
} from "../../icons";
import {
  getDegreeQuizQuestionsList,
  saveDegreeQuizQuestionMaster,
  toggleDegreeQuizQuestionStatus,
  deleteDegreeQuizQuestion,
  getDegreeQuizDetailsByQuizId,
  finalizeDegreeQuiz
} from "../../services/AdminQuizPageService";

export const QUESTION_TYPES = [
  { id: 1, name: "Multiple Choice", desc: "Single correct option out of multiple choices" },
  { id: 2, name: "True / False", desc: "Binary true or false evaluation" },
  { id: 3, name: "Fill-in-the-Blank", desc: "Passage with blank inputs" },
  { id: 4, name: "Multi-Select", desc: "Multiple checkboxes with multiple correct answers" },
];

export default function MicrocredentialQuizQuestionsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const quizId = Number(id || 0);

  // Tab: "editor" | "list"
  const [activeTab, setActiveTab] = useState(location.state?.fromAdd ? "editor" : "editor");

  // Quiz Meta
  const [quizInfo, setQuizInfo] = useState({
    quizTitle: location.state?.quizTitle || "Quiz Questions",
    moduleName: location.state?.moduleName || "",
  });

  // Questions List State
  const [questions, setQuestions] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Editor State
  const [savingQuestion, setSavingQuestion] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState(0);
  const [questionType, setQuestionType] = useState(1);

  // Common Question Fields
  const [commonForm, setCommonForm] = useState({
    title: "",
    questionText: "",
    questionFeedback: "",
    hint: "",
    shortDescription: "",
    enumeration: "1",
    customWeights: "",
    difficulty: 1,
    points: 1,
    randomizeAnswers: false,
    howPointAssignedToBlanks: "AllOrNothing"
  });

  // Type 1, 4: Options
  const [options, setOptions] = useState([
    { text: "Option 1", isCorrect: true, answerFeedback: "", displayOrder: 1 },
    { text: "Option 2", isCorrect: false, answerFeedback: "", displayOrder: 2 },
    { text: "Option 3", isCorrect: false, answerFeedback: "", displayOrder: 3 },
    { text: "Option 4", isCorrect: false, answerFeedback: "", displayOrder: 4 },
  ]);

  // Type 2: True/False choice
  const [tfCorrect, setTfCorrect] = useState(true);
  const [tfFeedbackTrue, setTfFeedbackTrue] = useState("");
  const [tfFeedbackFalse, setTfFeedbackFalse] = useState("");

  // Type 3: Fill-in-the-Blank
  const [fibPrefix, setFibPrefix] = useState("The capital of France is ");
  const [fibAnswer, setFibAnswer] = useState("Paris");
  const [fibFeedback, setFibFeedback] = useState("Exact match");
  const [fibEvaluationType, setFibEvaluationType] = useState(1);

  // Type 5: Matching
  const [matchChoices, setMatchChoices] = useState([
    { tempChoiceKey: 1, choiceText: "Tokyo", displayOrder: 1 },
    { tempChoiceKey: 2, choiceText: "New Delhi", displayOrder: 2 }
  ]);
  const [matchPairs, setMatchPairs] = useState([
    { prompt: "Japan", correctChoice: 1, displayOrder: 1 },
    { prompt: "India", correctChoice: 2, displayOrder: 2 }
  ]);
  const [shuffleMatches, setShuffleMatches] = useState(true);

  // Type 6: Ordering
  const [orderItems, setOrderItems] = useState([
    { itemValue: "Requirements Gathering", correctOrder: 1, feedback: "Phase 1", displayOrder: 1 },
    { itemValue: "Design", correctOrder: 2, feedback: "Phase 2", displayOrder: 2 },
    { itemValue: "Implementation", correctOrder: 3, feedback: "Phase 3", displayOrder: 3 }
  ]);

  // Type 7: Written Response
  const [writtenSettings, setWrittenSettings] = useState({
    enableHtmlEditor: true,
    enableHtmlEditorText: true,
    addFile: true,
    recordAudio: false,
    recordVideo: false,
    allowLearnerAttachments: true,
    initialLearnerText: "Type your response here...",
    customResponseBoxSize: "Large",
    evaluatorAnswerkey: "Expected points: Model responsibility, View rendering, Controller orchestration."
  });

  // Type 8: Short Answer
  const [shortAnswerText, setShortAnswerText] = useState("Hypertext Transfer Protocol");
  const [shortAnswerMethod, setShortAnswerMethod] = useState("ExactMatch");

  // Type 9: Arithmetic
  const [arithmeticForm, setArithmeticForm] = useState({
    formula: "x * y",
    answerPrecision: 2,
    enforcePrecision: true,
    tolerance: 0.01,
    toleranceType: "Absolute",
    unitText: "sq cm",
    unitWorth: 1.0,
    variables: [
      { variableName: "x", minValue: 1.0, maxValue: 10.0, decimalPlaces: 1, stepValue: 0.5 },
      { variableName: "y", minValue: 2.0, maxValue: 20.0, decimalPlaces: 1, stepValue: 1.0 }
    ]
  });

  // Type 10: Significant Figures
  const [sigFigsForm, setSigFigsForm] = useState({
    formula: "m * a",
    significantFiguresCount: 3,
    deductPercentage: 10.0,
    toleranceValue: 0.05,
    unitText: "N",
    variables: [
      { variableName: "m", minValue: 1.0, minPower: 0, maxValue: 5.0, maxPower: 2, stepValue: 1.0, stepPower: 0 }
    ]
  });

  // Type 11: Multi Short Answer
  const [multiShortAnswers, setMultiShortAnswers] = useState([
    { answerText: "Red", weightInPercentage: 33.33, displayOrder: 1 },
    { answerText: "Blue", weightInPercentage: 33.33, displayOrder: 2 },
    { answerText: "Yellow", weightInPercentage: 33.34, displayOrder: 3 }
  ]);
  const [multiShortInputBox, setMultiShortInputBox] = useState({
    inputBoxCount: 3,
    rowsCount: 3,
    columnsCount: 1
  });

  // Type 12: Likert Scale
  const [likertScaleTypeId, setLikertScaleTypeId] = useState(5);
  const [likertIncludeNA, setLikertIncludeNA] = useState(true);
  const [likertStatements, setLikertStatements] = useState([
    { optionText: "The course materials were clear and easy to follow.", displayOrder: 1 },
    { optionText: "The practical assignments helped reinforce the concepts.", displayOrder: 2 }
  ]);

  // Quiz Master Details & Finalize state
  const [quizMasterDetails, setQuizMasterDetails] = useState(null);
  const [finalizing, setFinalizing] = useState(false);

  // Load Quiz Details
  useEffect(() => {
    if (!quizId) return;
    const fetchDetails = async () => {
      try {
        const res = await getDegreeQuizDetailsByQuizId(quizId);
        const target = res?.quizMaster || res?.quizDetails;
        if (res?.success !== false && target) {
          setQuizInfo({
            quizTitle: target.quizTitle || "Quiz Questions",
            moduleName: target.moduleName || "",
          });
          setQuizMasterDetails(target);
        }
      } catch (e) {
        console.warn("Could not fetch quiz details:", e);
      }
    };
    fetchDetails();
  }, [quizId]);

  // Finalize full quiz and submit
  const handleFinalizeQuiz = async () => {
    setFinalizing(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      let targetDetails = quizMasterDetails;
      if (!targetDetails) {
        const res = await getDegreeQuizDetailsByQuizId(quizId);
        targetDetails = res?.quizMaster || res?.quizDetails;
      }
      if (targetDetails) {
        const finalizeRes = await finalizeDegreeQuiz({
          ...targetDetails,
          quizId,
          QuizId: quizId,
        });
        if (finalizeRes?.success === false) {
          console.warn("Finalize notice:", finalizeRes?.message);
        }
      }
      navigate("/microcredential/quiz", {
        state: {
          successMessage: "Quiz finalized and saved successfully!",
        },
      });
    } catch (err) {
      console.error("Error finalizing quiz:", err);
      navigate("/microcredential/quiz", {
        state: {
          successMessage: "Quiz questions saved.",
        },
      });
    } finally {
      setFinalizing(false);
    }
  };

  // Load Questions
  const loadQuestions = useCallback(async () => {
    if (!quizId) return;
    setLoadingQuestions(true);
    setErrorMessage("");
    try {
      const res = await getDegreeQuizQuestionsList({ quizId, pageSize: 100 });
      if (res?.success !== false) {
        setQuestions(res.questionsList || []);
        setTotalPoints(res.totalPoints || (res.questionsList || []).reduce((s, q) => s + (Number(q.points) || 1), 0));
      } else {
        setQuestions([]);
      }
    } catch (err) {
      console.warn("Error loading quiz questions:", err);
      setQuestions([]);
    } finally {
      setLoadingQuestions(false);
    }
  }, [quizId]);

  useEffect(() => {
    if (quizId) {
      loadQuestions();
    }
  }, [quizId, loadQuestions]);

  // Reset Editor for New Question
  const handleAddNewQuestion = useCallback((typeId = 1) => {
    setEditingQuestionId(0);
    setQuestionType(typeId);
    setCommonForm({
      title: "",
      questionText: "",
      questionFeedback: "",
      hint: "",
      shortDescription: "",
      enumeration: "1",
      customWeights: "",
      difficulty: 1,
      points: 1,
      randomizeAnswers: false,
      howPointAssignedToBlanks: "AllOrNothing"
    });
    setOptions([
      { text: "Option 1", isCorrect: true, answerFeedback: "", displayOrder: 1 },
      { text: "Option 2", isCorrect: false, answerFeedback: "", displayOrder: 2 },
      { text: "Option 3", isCorrect: false, answerFeedback: "", displayOrder: 3 },
      { text: "Option 4", isCorrect: false, answerFeedback: "", displayOrder: 4 },
    ]);
    setTfCorrect(true);
    setTfFeedbackTrue("");
    setTfFeedbackFalse("");
    setFibPrefix("The capital of France is ");
    setFibAnswer("Paris");
    setFibFeedback("Exact match");
    setFibEvaluationType(1);
    setMatchChoices([
      { tempChoiceKey: 1, choiceText: "Tokyo", displayOrder: 1 },
      { tempChoiceKey: 2, choiceText: "New Delhi", displayOrder: 2 }
    ]);
    setMatchPairs([
      { prompt: "Japan", correctChoice: 1, displayOrder: 1 },
      { prompt: "India", correctChoice: 2, displayOrder: 2 }
    ]);
    setShuffleMatches(true);
    setOrderItems([
      { itemValue: "Requirements Gathering", correctOrder: 1, feedback: "Phase 1", displayOrder: 1 },
      { itemValue: "Design", correctOrder: 2, feedback: "Phase 2", displayOrder: 2 },
      { itemValue: "Implementation", correctOrder: 3, feedback: "Phase 3", displayOrder: 3 }
    ]);
    setWrittenSettings({
      enableHtmlEditor: true,
      enableHtmlEditorText: true,
      addFile: true,
      recordAudio: false,
      recordVideo: false,
      allowLearnerAttachments: true,
      initialLearnerText: "Type your response here...",
      customResponseBoxSize: "Large",
      evaluatorAnswerkey: "Expected points: Model responsibility, View rendering, Controller orchestration."
    });
    setShortAnswerText("Hypertext Transfer Protocol");
    setShortAnswerMethod("ExactMatch");
    setArithmeticForm({
      formula: "x * y",
      answerPrecision: 2,
      enforcePrecision: true,
      tolerance: 0.01,
      toleranceType: "Absolute",
      unitText: "sq cm",
      unitWorth: 1.0,
      variables: [
        { variableName: "x", minValue: 1.0, maxValue: 10.0, decimalPlaces: 1, stepValue: 0.5 },
        { variableName: "y", minValue: 2.0, maxValue: 20.0, decimalPlaces: 1, stepValue: 1.0 }
      ]
    });
    setSigFigsForm({
      formula: "m * a",
      significantFiguresCount: 3,
      deductPercentage: 10.0,
      toleranceValue: 0.05,
      unitText: "N",
      variables: [
        { variableName: "m", minValue: 1.0, minPower: 0, maxValue: 5.0, maxPower: 2, stepValue: 1.0, stepPower: 0 }
      ]
    });
    setMultiShortAnswers([
      { answerText: "Red", weightInPercentage: 33.33, displayOrder: 1 },
      { answerText: "Blue", weightInPercentage: 33.33, displayOrder: 2 },
      { answerText: "Yellow", weightInPercentage: 33.34, displayOrder: 3 }
    ]);
    setMultiShortInputBox({
      inputBoxCount: 3,
      rowsCount: 3,
      columnsCount: 1
    });
    setLikertScaleTypeId(5);
    setLikertIncludeNA(true);
    setLikertStatements([
      { optionText: "The course materials were clear and easy to follow.", displayOrder: 1 },
      { optionText: "The practical assignments helped reinforce the concepts.", displayOrder: 2 }
    ]);
    setActiveTab("editor");
    setErrorMessage("");
    setSuccessMessage("");
  }, []);

  // Edit Existing Question
  const handleEditQuestion = (q) => {
    const qId = q.questionId || q.questionsId || 0;
    setEditingQuestionId(qId);
    const qType = Number(q.degreeQuestionType || q.questionTypeId || 1);
    setQuestionType(qType);

    const rawQuestionText = q.finalQuestionName || q.FinalQuestionName || q.questionText || q.question || "";
    const cleanQuestionText = rawQuestionText.replace(/<[^>]*>?/gm, '').trim() || rawQuestionText;

    setCommonForm({
      title: q.title || "",
      questionText: cleanQuestionText,
      questionFeedback: q.questionFeedback || "",
      hint: q.hint || "",
      shortDescription: q.shortDescription || "",
      enumeration: String(q.enumeration || "1"),
      customWeights: q.customWeights || "",
      difficulty: Number(q.difficulty || 1),
      points: Number(q.points || 1),
      randomizeAnswers: Boolean(q.randomizeAnswers),
      howPointAssignedToBlanks: q.howPointAssignedToBlanks || "AllOrNothing"
    });

    if (Array.isArray(q.options) && q.options.length > 0) {
      setOptions(q.options.map((opt, idx) => ({
        text: opt.text || opt.Text || `Option ${idx + 1}`,
        isCorrect: Boolean(opt.isCorrect ?? opt.IsCorrect),
        answerFeedback: opt.answerFeedback || opt.AnswerFeedback || "",
        displayOrder: opt.displayOrder || opt.DisplayOrder || (idx + 1)
      })));
    }

    setActiveTab("editor");
    setErrorMessage("");
    setSuccessMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Toggle Active Status
  const handleToggleStatus = async (q) => {
    const qId = q.questionId || q.questionsId;
    const nextStatus = !Boolean(q.isActive);
    try {
      const res = await toggleDegreeQuizQuestionStatus(quizId, qId, nextStatus);
      if (res?.success !== false) {
        setQuestions(prev => prev.map(item => (item.questionId === qId || item.questionsId === qId) ? { ...item, isActive: nextStatus } : item));
        setSuccessMessage(`Question ${nextStatus ? "activated" : "deactivated"} successfully.`);
      } else {
        setErrorMessage(res?.message || "Failed to update question status.");
      }
    } catch (err) {
      setErrorMessage(err.message || "Error toggling question status.");
    }
  };

  // Delete Question
  const handleDeleteQuestion = async (qId) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    try {
      const res = await deleteDegreeQuizQuestion(quizId, qId);
      if (res?.success !== false) {
        setQuestions(prev => prev.filter(item => (item.questionId !== qId && item.questionsId !== qId)));
        setSuccessMessage("Question deleted successfully.");
        loadQuestions();
      } else {
        setErrorMessage(res?.message || "Failed to delete question.");
      }
    } catch (err) {
      setErrorMessage(err.message || "Error deleting question.");
    }
  };

  // Save Question Handler
  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    if (!commonForm.questionText.trim()) {
      setErrorMessage("Please enter Question Text.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSavingQuestion(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const payload = {
        quizId,
        questionId: editingQuestionId,
        degreeQuestionType: questionType,
        degreeQuestionList: [
          {
            TempQuestionKey: 0,
            DegreeQuestionType: questionType,
            Title: commonForm.title.trim(),
            QuestionText: commonForm.questionText.includes("<") ? commonForm.questionText : `<p>${commonForm.questionText}</p>`,
            QuestionFeedback: commonForm.questionFeedback,
            Hint: commonForm.hint,
            ShortDescription: commonForm.shortDescription,
            Enumeration: commonForm.enumeration,
            CustomWeights: commonForm.customWeights,
            Difficulty: Number(commonForm.difficulty) || 1,
            AlternativeText: "",
            Points: Number(commonForm.points) || 1,
            RandomizeAnswers: commonForm.randomizeAnswers,
            ImageUrl: "",
            HowPointAssignedToBlanks: commonForm.howPointAssignedToBlanks
          }
        ]
      };

      if (questionType === 1 || questionType === 4) {
        payload.degreeAnswerOptionList = options.map((opt, idx) => ({
          TempQuestionKey: 0,
          Text: opt.text,
          AnswerFeedback: opt.answerFeedback || "",
          IsCorrect: Boolean(opt.isCorrect),
          DisplayOrder: idx + 1
        }));
      } else if (questionType === 2) {
        payload.degreeAnswerOptionList = [
          {
            TempQuestionKey: 0,
            Text: "True",
            AnswerFeedback: tfFeedbackTrue,
            IsCorrect: tfCorrect === true,
            DisplayOrder: 1
          },
          {
            TempQuestionKey: 0,
            Text: "False",
            AnswerFeedback: tfFeedbackFalse,
            IsCorrect: tfCorrect === false,
            DisplayOrder: 2
          }
        ];
      } else if (questionType === 3) {
        payload.degreeQuestionTextComponentList = [
          {
            TempQuestionKey: 0,
            TempQuestionTextComponentKey: 1,
            ComponentType: "Text",
            Content: fibPrefix,
            BlankPoints: 0,
            DisplayOrder: 1
          },
          {
            TempQuestionKey: 0,
            TempQuestionTextComponentKey: 2,
            ComponentType: "Blank",
            Content: "",
            BlankPoints: Number(commonForm.points) || 2,
            DisplayOrder: 2
          }
        ];
        payload.degreeBlankAnswerList = [
          {
            TempQuestionTextComponentKey: 2,
            Answer: fibAnswer,
            Weight: 100,
            EvaluationTypeId: Number(fibEvaluationType) || 1,
            Feedback: fibFeedback,
            BlankNumber: 1
          }
        ];
      } else if (questionType === 5) {
        payload.degreeMatchingQuestionList = [
          {
            TempQuestionKey: 0,
            ShuffleMatches: shuffleMatches,
            ShuffleChoices: true,
            MatchRandomize: true,
            GradingMethodTypeId: 1
          }
        ];
        payload.degreeMatchingChoiceList = matchChoices.map((c, i) => ({
          TempQuestionKey: 0,
          TempChoiceKey: c.tempChoiceKey || (i + 1),
          ChoiceText: c.choiceText,
          DisplayOrder: i + 1
        }));
        payload.degreeMatchingPairList = matchPairs.map((p, i) => ({
          TempQuestionKey: 0,
          Prompt: p.prompt,
          CorrectChoice: Number(p.correctChoice) || 1,
          DisplayOrder: i + 1
        }));
      } else if (questionType === 6) {
        payload.degreeOrderingQuestionList = [
          {
            TempQuestionKey: 0,
            GradingMethodTypeId: 1
          }
        ];
        payload.degreeOrderingItemList = orderItems.map((it, i) => ({
          TempQuestionKey: 0,
          ItemValue: it.itemValue,
          CorrectOrder: it.correctOrder || (i + 1),
          Feedback: it.feedback || `Phase ${i + 1}`,
          DisplayOrder: i + 1
        }));
      } else if (questionType === 7) {
        payload.degreeWrittenResponseSettingList = [
          {
            TempQuestionKey: 0,
            EnableHtmlEditor: Boolean(writtenSettings.enableHtmlEditor),
            EnableHtmlEditorText: Boolean(writtenSettings.enableHtmlEditorText),
            AddFile: Boolean(writtenSettings.addFile),
            RecordAudio: Boolean(writtenSettings.recordAudio),
            RecordVideo: Boolean(writtenSettings.recordVideo),
            AllowLearnerAttachments: Boolean(writtenSettings.allowLearnerAttachments),
            InitialLearnerText: writtenSettings.initialLearnerText,
            CustomResponseBoxSize: writtenSettings.customResponseBoxSize || "Large",
            EvaluatorAnswerkey: writtenSettings.evaluatorAnswerkey ? `<p>${writtenSettings.evaluatorAnswerkey}</p>` : ""
          }
        ];
      } else if (questionType === 8) {
        payload.degreeShortAnswerBlankList = [
          {
            TempQuestionKey: 0,
            BlankNumber: 1,
            BlankType: "Text",
            AnswerText: shortAnswerText,
            HowPointAssignedToBlanks: shortAnswerMethod || "ExactMatch"
          }
        ];
      } else if (questionType === 9) {
        payload.degreeArithmeticQuestionList = [
          {
            TempQuestionKey: 0,
            AllowAttachmentToSupportAnswer: false,
            Formula: arithmeticForm.formula,
            AnswerPrecision: Number(arithmeticForm.answerPrecision) || 2,
            EnforcePrecision: Boolean(arithmeticForm.enforcePrecision),
            Tolerance: Number(arithmeticForm.tolerance) || 0.01,
            Tolerance_type: arithmeticForm.toleranceType || "Absolute",
            UnitText: arithmeticForm.unitText,
            UnitWorth: Number(arithmeticForm.unitWorth) || 1.0,
            UnitPointsType: "Add",
            EvaluationTypeId: 1,
            CorrectAns: ""
          }
        ];
        payload.degreeArithmeticVariableList = arithmeticForm.variables.map(v => ({
          TempQuestionKey: 0,
          VariableName: v.variableName,
          MinValue: Number(v.minValue) || 1.0,
          MaxValue: Number(v.maxValue) || 10.0,
          DecimalPlaces: Number(v.decimalPlaces) || 1,
          StepValue: Number(v.stepValue) || 1.0
        }));
      } else if (questionType === 10) {
        payload.degreeSignificantFiguresQuestionList = [
          {
            TempQuestionKey: 0,
            AllowAttachmentstosupportAnswers: false,
            Formula: sigFigsForm.formula,
            SignificantFiguresCount: Number(sigFigsForm.significantFiguresCount) || 3,
            DeductPercentage: Number(sigFigsForm.deductPercentage) || 10.0,
            ToleranceValue: Number(sigFigsForm.toleranceValue) || 0.05,
            ToleranceTypeId: 1,
            UnitToleranceOne: 0,
            UnitToleranceTwo: 0,
            PercentageOne: 100,
            UnitWorth: 1.0,
            EvaluationTypeId: 1,
            UnitText: sigFigsForm.unitText || "N",
            CorrectAns: ""
          }
        ];
        payload.degreeSignificantFiguresVariableList = sigFigsForm.variables.map(v => ({
          TempQuestionKey: 0,
          VariableName: v.variableName,
          MinValue: Number(v.minValue) || 1.0,
          MinPower: Number(v.minPower) || 0,
          MaxValue: Number(v.maxValue) || 5.0,
          MaxPower: Number(v.maxPower) || 2,
          StepValue: Number(v.stepValue) || 1.0,
          StepPower: Number(v.stepPower) || 0
        }));
      } else if (questionType === 11) {
        payload.degreeMultiShortAnswerList = multiShortAnswers.map((a, i) => ({
          TempQuestionKey: 0,
          AnswerText: a.answerText,
          WeightInPercentage: Number(a.weightInPercentage) || 33.33,
          EvaluationTypeId: 1,
          DisplayOrder: i + 1
        }));
        payload.degreeMultiShortAnswerInputBox = [
          {
            TempQuestionKey: 0,
            InputBoxCount: Number(multiShortInputBox.inputBoxCount) || 3,
            RowsCount: Number(multiShortInputBox.rowsCount) || 3,
            ColumnsCount: Number(multiShortInputBox.columnsCount) || 1
          }
        ];
      } else if (questionType === 12) {
        payload.degreeLikertQuestionList = [
          {
            TempQuestionKey: 0,
            ScaleTypeId: Number(likertScaleTypeId) || 5,
            IncludeNAOption: Boolean(likertIncludeNA)
          }
        ];
        payload.degreeLikertStatementList = likertStatements.map((st, i) => ({
          TempQuestionKey: 0,
          OptionText: st.optionText,
          DisplayOrder: i + 1
        }));
      }

      const res = await saveDegreeQuizQuestionMaster(payload);
      if (res?.success !== false) {
        setSuccessMessage(editingQuestionId ? "Question updated successfully!" : "Question created successfully!");
        loadQuestions();
        setActiveTab("list");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setErrorMessage(res?.message || res?.errorDescription || "Failed to save question.");
      }
    } catch (err) {
      console.error("Error saving question:", err);
      setErrorMessage(err.message || "An error occurred while saving question.");
    } finally {
      setSavingQuestion(false);
    }
  };

  return (
    <div className="w-full pb-16">
      <PageMeta
        title="Quiz Questions Manager | IgnitoVerse Admin"
        description="Add, edit, configure and manage quiz questions."
      />
      <PageBreadcrumb
        pageTitle="Quiz Questions Manager"
      />

      {/* Top Header & Context Card */}
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-base font-bold text-gray-900 dark:text-white">
                {quizInfo.quizTitle}
              </h1>
              <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-600 dark:bg-brand-950/50 dark:text-brand-400">
                Quiz #{quizId}
              </span>
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                {questions.length} Questions | {totalPoints} Pts
              </span>
            </div>
            {quizInfo.moduleName && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Module: {quizInfo.moduleName}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {activeTab === "editor" ? (
              <button
                type="button"
                onClick={() => setActiveTab("list")}
                className="rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 transition cursor-pointer"
              >
                &larr; View Questions List ({questions.length})
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleAddNewQuestion(1)}
                className="rounded-xl bg-brand-500 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-600 transition cursor-pointer"
              >
                + Add Question
              </button>
            )}

            <button
              type="button"
              onClick={handleFinalizeQuiz}
              disabled={finalizing}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-semibold text-white shadow-xs transition cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
            >
              {finalizing ? (
                <>
                  <svg className="size-3.5 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Finalizing Quiz...</span>
                </>
              ) : (
                <>
                  <CheckCircleIcon className="size-3.5" />
                  <span>Done & Return to Quizzes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="mb-4 flex items-center justify-between gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/40">
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="size-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage("")} className="cursor-pointer font-bold">
            &times;
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 flex items-center justify-between gap-2 rounded-xl bg-red-50 px-4 py-3 text-xs font-semibold text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-900/40">
          <div className="flex items-center gap-2">
            <AlertIcon className="size-4 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage("")} className="cursor-pointer font-bold">
            &times;
          </button>
        </div>
      )}

      {/* Main Content Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-white/[0.03]">
        {activeTab === "list" ? (
          /* QUESTIONS LIST VIEW */
          <div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4 dark:border-gray-800">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                Questions List ({questions.length})
              </h2>
              <button
                type="button"
                onClick={() => handleAddNewQuestion(1)}
                className="rounded-xl bg-brand-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-brand-600 transition cursor-pointer"
              >
                + Create New Question
              </button>
            </div>

            {loadingQuestions ? (
              <div className="py-16 text-center text-xs text-gray-500">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mb-2"></div>
                <p>Loading questions...</p>
              </div>
            ) : questions.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">No questions added yet</p>
                <p className="text-xs text-gray-500 mt-1 mb-4">Start building your quiz by creating your first question.</p>
                <button
                  type="button"
                  onClick={() => handleAddNewQuestion(1)}
                  className="rounded-xl bg-brand-500 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-600 cursor-pointer"
                >
                  + Add First Question
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {questions.map((q, index) => {
                  const qId = q.questionId || q.questionsId || (index + 1);
                  const qTypeObj = QUESTION_TYPES.find(t => t.id === Number(q.degreeQuestionType || q.questionTypeId || 1));
                  const cleanText = (
                    q.cleanQuestionText ||
                    q.finalQuestionName ||
                    q.FinalQuestionName ||
                    q.questionText ||
                    q.question ||
                    q.questionName ||
                    ""
                  ).replace(/<[^>]*>?/gm, '').trim();
                  const typeLabel = q.questionTypeName || q.QuestionTypeName || qTypeObj?.name || `Type ${q.degreeQuestionType || 1}`;

                  return (
                    <div
                      key={qId}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-gray-100 bg-gray-50/60 dark:border-gray-800 dark:bg-gray-800/40 hover:bg-white dark:hover:bg-gray-800 transition"
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-xs font-bold text-brand-600 dark:text-brand-400">
                          {index + 1}
                        </span>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="rounded-md bg-gray-200/80 dark:bg-gray-700 px-2 py-0.5 text-[10px] font-semibold text-gray-700 dark:text-gray-300">
                              {typeLabel}
                            </span>
                            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                              {q.points || 1} Pts
                            </span>
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              q.isActive
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                            }`}>
                              {q.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>

                          <p className="text-xs font-medium text-gray-900 dark:text-white line-clamp-2">
                            {cleanText || "Untitled Question"}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(q)}
                          className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition cursor-pointer ${
                            q.isActive
                              ? "bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300"
                              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300"
                          }`}
                        >
                          {q.isActive ? "Deactivate" : "Activate"}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleEditQuestion(q)}
                          className="rounded-lg border border-gray-200 p-1.5 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 cursor-pointer"
                          title="Edit Question"
                        >
                          <PencilIcon className="size-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteQuestion(qId)}
                          className="rounded-lg border border-red-200 p-1.5 text-red-600 hover:bg-red-50 dark:border-red-900/40 dark:text-red-400 dark:hover:bg-red-950/40 cursor-pointer"
                          title="Delete Question"
                        >
                          <TrashBinIcon className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* QUESTION FORM / EDITOR VIEW */
          <form onSubmit={handleSaveQuestion} className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                {editingQuestionId ? "Edit Question" : "Add New Question"}
              </h2>
              <button
                type="button"
                onClick={() => setActiveTab("list")}
                className="text-xs font-semibold text-brand-500 hover:text-brand-600 cursor-pointer"
              >
                &larr; Back to Questions List
              </button>
            </div>

            {/* Type Selection Grid (4 Question Types) */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Select Question Type (1 of 4 Types)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 p-1 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                {QUESTION_TYPES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setQuestionType(t.id)}
                    className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition cursor-pointer ${
                      questionType === t.id
                        ? "border-brand-500 bg-brand-50/80 text-brand-900 dark:bg-brand-950/50 dark:text-brand-200 shadow-xs ring-1 ring-brand-500"
                        : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                    }`}
                  >
                    <span className="text-xs font-bold">{t.id}. {t.name}</span>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{t.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Basic Details (Title, Points, Difficulty) */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-6">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Question Title / Short Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. CPU Architecture Basics"
                  value={commonForm.title}
                  onChange={(e) => setCommonForm(prev => ({ ...prev, title: e.target.value, shortDescription: e.target.value }))}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-xs text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Points <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={commonForm.points}
                  onChange={(e) => setCommonForm(prev => ({ ...prev, points: Number(e.target.value) }))}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-xs text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  required
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Difficulty Level
                </label>
                <select
                  value={commonForm.difficulty}
                  onChange={(e) => setCommonForm(prev => ({ ...prev, difficulty: Number(e.target.value) }))}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-xs text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value={1}>Easy (Level 1)</option>
                  <option value={2}>Medium (Level 2)</option>
                  <option value={3}>Hard (Level 3)</option>
                </select>
              </div>
            </div>

            {/* Question Text */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Question Text <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Enter complete question statement or instructions..."
                value={commonForm.questionText}
                onChange={(e) => setCommonForm(prev => ({ ...prev, questionText: e.target.value }))}
                className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white resize-none"
                required
              />
            </div>

            {/* Hint & Feedback */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Hint (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Provide a clue for the student..."
                  value={commonForm.hint}
                  onChange={(e) => setCommonForm(prev => ({ ...prev, hint: e.target.value }))}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Question Feedback / Explanation
                </label>
                <input
                  type="text"
                  placeholder="Explanation shown after answer submission..."
                  value={commonForm.questionFeedback}
                  onChange={(e) => setCommonForm(prev => ({ ...prev, questionFeedback: e.target.value }))}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>

            {/* ========================================================================= */}
            {/* 4 QUESTION TYPES ANSWER FORMS                                             */}
            {/* ========================================================================= */}

            {/* TYPE 1: MULTIPLE CHOICE & TYPE 4: MULTI-SELECT */}
            {(questionType === 1 || questionType === 4) && (
              <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                    {questionType === 1 ? "Answer Choices (Single Correct MCQ)" : "Answer Choices (Multi-Select Checkboxes)"}
                  </span>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                      <input
                        type="checkbox"
                        checked={commonForm.randomizeAnswers}
                        onChange={(e) => setCommonForm(prev => ({ ...prev, randomizeAnswers: e.target.checked }))}
                        className="rounded border-gray-300 text-brand-500"
                      />
                      <span>Shuffle Options</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => setOptions(prev => [...prev, { text: `Option ${prev.length + 1}`, isCorrect: false, answerFeedback: "", displayOrder: prev.length + 1 }])}
                      className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 cursor-pointer"
                    >
                      + Add Choice
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type={questionType === 1 ? "radio" : "checkbox"}
                        name="correctChoice"
                        checked={opt.isCorrect}
                        onChange={(e) => {
                          if (questionType === 1) {
                            setOptions(prev => prev.map((o, i) => ({ ...o, isCorrect: i === idx })));
                          } else {
                            setOptions(prev => prev.map((o, i) => i === idx ? { ...o, isCorrect: e.target.checked } : o));
                          }
                        }}
                        className="size-4 text-brand-500 focus:ring-brand-500 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) => {
                          const val = e.target.value;
                          setOptions(prev => prev.map((o, i) => i === idx ? { ...o, text: val } : o));
                        }}
                        placeholder={`Option ${idx + 1}`}
                        className="flex-1 rounded-xl border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-800 focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      />
                      <input
                        type="text"
                        value={opt.answerFeedback}
                        onChange={(e) => {
                          const val = e.target.value;
                          setOptions(prev => prev.map((o, i) => i === idx ? { ...o, answerFeedback: val } : o));
                        }}
                        placeholder="Feedback (optional)"
                        className="w-36 sm:w-48 rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-1.5 text-[11px] text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      />
                      {options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => setOptions(prev => prev.filter((_, i) => i !== idx))}
                          className="p-1.5 text-gray-400 hover:text-red-500 cursor-pointer"
                        >
                          <TrashBinIcon className="size-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TYPE 2: TRUE / FALSE */}
            {questionType === 2 && (
              <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                  Correct Evaluation
                </span>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-800 dark:text-gray-200 cursor-pointer">
                    <input
                      type="radio"
                      name="tfChoice"
                      checked={tfCorrect === true}
                      onChange={() => setTfCorrect(true)}
                      className="size-4 text-brand-500"
                    />
                    <span>True</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-800 dark:text-gray-200 cursor-pointer">
                    <input
                      type="radio"
                      name="tfChoice"
                      checked={tfCorrect === false}
                      onChange={() => setTfCorrect(false)}
                      className="size-4 text-brand-500"
                    />
                    <span>False</span>
                  </label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <input
                    type="text"
                    value={tfFeedbackTrue}
                    onChange={(e) => setTfFeedbackTrue(e.target.value)}
                    placeholder="Feedback for 'True' response..."
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                  <input
                    type="text"
                    value={tfFeedbackFalse}
                    onChange={(e) => setTfFeedbackFalse(e.target.value)}
                    placeholder="Feedback for 'False' response..."
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>
            )}

            {/* TYPE 3: FILL IN THE BLANK */}
            {questionType === 3 && (
              <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                  Sentence & Blank Settings
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Sentence Prefix Text
                    </label>
                    <input
                      type="text"
                      value={fibPrefix}
                      onChange={(e) => setFibPrefix(e.target.value)}
                      placeholder="e.g. The capital of France is "
                      className="w-full rounded-xl border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Expected Blank Answer
                    </label>
                    <input
                      type="text"
                      value={fibAnswer}
                      onChange={(e) => setFibAnswer(e.target.value)}
                      placeholder="e.g. Paris"
                      className="w-full rounded-xl border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Form Footer Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setActiveTab("list")}
                className="rounded-xl border border-gray-300 bg-white px-5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={savingQuestion}
                className="rounded-xl bg-brand-500 px-6 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-600 transition disabled:opacity-60 cursor-pointer"
              >
                {savingQuestion ? "Saving..." : (editingQuestionId ? "Update Question" : "Save Question")}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
