import React, { useState, useEffect, useCallback } from "react";
import {
  CloseIcon,
  CheckCircleIcon,
  AlertIcon,
  TrashBinIcon,
  PencilIcon
} from "../../icons";
import {
  getDegreeQuizQuestionsList,
  saveDegreeQuizQuestionMaster,
  toggleDegreeQuizQuestionStatus,
  deleteDegreeQuizQuestion
} from "../../services/AdminQuizPageService";

export const QUESTION_TYPES = [
  { id: 1, name: "Multiple Choice", desc: "Single correct option out of multiple choices" },
  { id: 2, name: "True / False", desc: "Binary true or false evaluation" },
  { id: 3, name: "Fill-in-the-Blank", desc: "Passage with blank inputs" },
  { id: 4, name: "Multi-Select", desc: "Multiple checkboxes with multiple correct answers" },
  { id: 5, name: "Matching", desc: "Match items in Column A with choices in Column B" },
  { id: 6, name: "Ordering", desc: "Arrange items into sequential order" },
  { id: 7, name: "Written Response", desc: "Long answer essay with optional attachments" },
  { id: 8, name: "Short Answer", desc: "Direct short text evaluation" },
  { id: 9, name: "Arithmetic", desc: "Mathematical formulas with variable ranges and tolerance" },
  { id: 10, name: "Significant Figures", desc: "Scientific calculations with significant figures scale" },
  { id: 11, name: "Multi Short Answer", desc: "Multiple short answer boxes with percentage weights" },
  { id: 12, name: "Likert Scale", desc: "Rating survey statements on agreement scale" },
];

export default function QuestionMasterModal({ isOpen, onClose, quiz, onQuestionsUpdated }) {
  const quizId = Number(quiz?.quizId || quiz?.QuizId || 0);
  const quizTitle = quiz?.quizTitle || quiz?.QuizTitle || "Quiz Questions";

  // Tab: "list" | "editor"
  const [activeTab, setActiveTab] = useState("list");

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

  // Type 1, 2, 4: Options
  const [options, setOptions] = useState([
    { text: "Option 1", isCorrect: true, answerFeedback: "", displayOrder: 1 },
    { text: "Option 2", isCorrect: false, answerFeedback: "", displayOrder: 2 },
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
    evaluatorAnswerkey: "Expected points: ..."
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
    if (isOpen && quizId) {
      loadQuestions();
      setActiveTab("list");
      setErrorMessage("");
      setSuccessMessage("");
    }
  }, [isOpen, quizId, loadQuestions]);

  // Reset Editor for New Question
  const handleAddNewQuestion = (typeId = 1) => {
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
    setActiveTab("editor");
    setErrorMessage("");
    setSuccessMessage("");
  };

  // Edit Existing Question
  const handleEditQuestion = (q) => {
    const qId = q.questionId || q.questionsId || 0;
    setEditingQuestionId(qId);
    const qType = Number(q.degreeQuestionType || q.questionTypeId || 1);
    setQuestionType(qType);

    setCommonForm({
      title: q.title || "",
      questionText: q.questionText || q.question || "",
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
      setErrorMessage(err.message || "Failed to toggle question status.");
    }
  };

  // Delete Question
  const handleDeleteQuestion = async (qId) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    try {
      const res = await deleteDegreeQuizQuestion(quizId, qId);
      if (res?.success !== false) {
        setQuestions(prev => prev.filter(item => (item.questionId || item.questionsId) !== qId));
        setSuccessMessage("Question deleted successfully.");
        if (onQuestionsUpdated) onQuestionsUpdated();
      } else {
        setErrorMessage(res?.message || "Failed to delete question.");
      }
    } catch (err) {
      setErrorMessage(err.message || "Failed to delete question.");
    }
  };

  // Submit Question Master Payload
  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    if (!commonForm.questionText.trim()) {
      setErrorMessage("Please enter Question Text.");
      return;
    }

    setSavingQuestion(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      // Build base payload
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

      // Type-specific list builders
      if (questionType === 1 || questionType === 4) {
        // Multiple Choice / Multi-Select
        payload.degreeAnswerOptionList = options.map((opt, idx) => ({
          TempQuestionKey: 0,
          Text: opt.text,
          AnswerFeedback: opt.answerFeedback || "",
          IsCorrect: Boolean(opt.isCorrect),
          DisplayOrder: idx + 1
        }));
      } else if (questionType === 2) {
        // True / False
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
        // Fill-in-the-Blank
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
        // Matching
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
        // Ordering
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
          Feedback: it.feedback || `Step ${i + 1}`,
          DisplayOrder: i + 1
        }));
      } else if (questionType === 7) {
        // Written Response
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
        // Short Answer
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
        // Arithmetic
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
        // Significant Figures
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
        // Multi Short Answer
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
        // Likert Scale
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
        if (onQuestionsUpdated) onQuestionsUpdated();
        setActiveTab("list");
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-xs">
      <div className="relative flex max-h-[92vh] w-full max-w-5xl flex-col rounded-3xl bg-white shadow-2xl dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>Quiz Questions Manager</span>
              <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-600 dark:bg-brand-950/50 dark:text-brand-400">
                {questions.length} Questions | {totalPoints} Pts
              </span>
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {quizTitle} (Quiz #{quizId})
            </p>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === "editor" ? (
              <button
                type="button"
                onClick={() => setActiveTab("list")}
                className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                &larr; Back to Questions List
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleAddNewQuestion(1)}
                className="rounded-xl bg-brand-500 px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-brand-600 transition"
              >
                + Add Question
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <CloseIcon className="size-5" />
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="px-6 pt-3">
          {successMessage && (
            <div className="mb-2 flex items-center justify-between gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/40">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="size-4 shrink-0 text-emerald-600" />
                <span>{successMessage}</span>
              </div>
              <button onClick={() => setSuccessMessage("")}>
                <CloseIcon className="size-3.5" />
              </button>
            </div>
          )}

          {errorMessage && (
            <div className="mb-2 flex items-center justify-between gap-2 rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-900/40">
              <div className="flex items-center gap-2">
                <AlertIcon className="size-4 shrink-0 text-red-600" />
                <span>{errorMessage}</span>
              </div>
              <button onClick={() => setErrorMessage("")}>
                <CloseIcon className="size-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {activeTab === "list" ? (
            /* QUESTIONS LIST VIEW */
            <div>
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
                    className="rounded-xl bg-brand-500 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-600"
                  >
                    + Add First Question
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {questions.map((q, index) => {
                    const qId = q.questionId || q.questionsId || (index + 1);
                    const qTypeObj = QUESTION_TYPES.find(t => t.id === Number(q.degreeQuestionType || 1));
                    const cleanText = (q.questionText || q.question || "").replace(/<[^>]*>?/gm, '');

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
                                {qTypeObj?.name || `Type ${q.degreeQuestionType || 1}`}
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
                            className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
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
                            className="rounded-lg border border-gray-200 p-1.5 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                            title="Edit Question"
                          >
                            <PencilIcon className="size-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteQuestion(qId)}
                            className="rounded-lg border border-red-200 p-1.5 text-red-600 hover:bg-red-50 dark:border-red-900/40 dark:text-red-400 dark:hover:bg-red-950/40"
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
              {/* Type Selection Pills */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Select Question Type (1 of 12 Types)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-h-40 overflow-y-auto p-1 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                  {QUESTION_TYPES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setQuestionType(t.id)}
                      className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition ${
                        questionType === t.id
                          ? "border-brand-500 bg-brand-50/80 text-brand-900 dark:bg-brand-950/50 dark:text-brand-200 shadow-xs"
                          : "border-transparent bg-white dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      <span className="text-[11px] font-bold">{t.id}. {t.name}</span>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-1">{t.desc}</span>
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

              {/* ======================================================= */}
              {/* DYNAMIC FORM PER QUESTION TYPE                         */}
              {/* ======================================================= */}

              {/* TYPE 1: Multiple Choice & TYPE 4: Multi-Select */}
              {(questionType === 1 || questionType === 4) && (
                <div className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-800/30">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold text-gray-900 dark:text-white">
                      Answer Choices ({questionType === 1 ? "Single Correct" : "Multiple Correct Checkboxes"})
                    </h3>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 cursor-pointer">
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
                        className="rounded-lg bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-600 hover:bg-brand-100 dark:bg-brand-950/40 dark:text-brand-300"
                      >
                        + Add Choice
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {options.map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 bg-white dark:bg-gray-800 p-2.5 rounded-xl border border-gray-200 dark:border-gray-700">
                        {questionType === 1 ? (
                          <input
                            type="radio"
                            name="mc_correct"
                            checked={opt.isCorrect}
                            onChange={() => setOptions(prev => prev.map((o, i) => ({ ...o, isCorrect: i === idx })))}
                            className="size-4 text-brand-500"
                          />
                        ) : (
                          <input
                            type="checkbox"
                            checked={opt.isCorrect}
                            onChange={(e) => setOptions(prev => prev.map((o, i) => i === idx ? { ...o, isCorrect: e.target.checked } : o))}
                            className="size-4 rounded text-brand-500"
                          />
                        )}

                        <input
                          type="text"
                          placeholder={`Choice ${idx + 1} text`}
                          value={opt.text}
                          onChange={(e) => setOptions(prev => prev.map((o, i) => i === idx ? { ...o, text: e.target.value } : o))}
                          className="flex-1 rounded-lg border border-gray-300 bg-transparent px-3 py-1.5 text-xs text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:text-white"
                          required
                        />

                        <input
                          type="text"
                          placeholder="Feedback (optional)"
                          value={opt.answerFeedback}
                          onChange={(e) => setOptions(prev => prev.map((o, i) => i === idx ? { ...o, answerFeedback: e.target.value } : o))}
                          className="w-44 rounded-lg border border-gray-300 bg-transparent px-3 py-1.5 text-xs text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:text-white"
                        />

                        {options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => setOptions(prev => prev.filter((_, i) => i !== idx))}
                            className="p-1 text-red-500 hover:text-red-700"
                          >
                            <TrashBinIcon className="size-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TYPE 2: True / False */}
              {questionType === 2 && (
                <div className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-800/30">
                  <h3 className="text-xs font-bold text-gray-900 dark:text-white mb-3">
                    Correct Answer & Feedback
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className={`flex flex-col p-4 rounded-xl border cursor-pointer transition ${
                      tfCorrect === true
                        ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30"
                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="radio"
                          name="tf_val"
                          checked={tfCorrect === true}
                          onChange={() => setTfCorrect(true)}
                          className="size-4 text-emerald-600"
                        />
                        <span className="text-sm font-bold text-gray-900 dark:text-white">True</span>
                      </div>
                      <input
                        type="text"
                        placeholder="Feedback for True..."
                        value={tfFeedbackTrue}
                        onChange={(e) => setTfFeedbackTrue(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1 text-xs text-gray-800 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                      />
                    </label>

                    <label className={`flex flex-col p-4 rounded-xl border cursor-pointer transition ${
                      tfCorrect === false
                        ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30"
                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="radio"
                          name="tf_val"
                          checked={tfCorrect === false}
                          onChange={() => setTfCorrect(false)}
                          className="size-4 text-emerald-600"
                        />
                        <span className="text-sm font-bold text-gray-900 dark:text-white">False</span>
                      </div>
                      <input
                        type="text"
                        placeholder="Feedback for False..."
                        value={tfFeedbackFalse}
                        onChange={(e) => setTfFeedbackFalse(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1 text-xs text-gray-800 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* TYPE 3: Fill-in-the-Blank */}
              {questionType === 3 && (
                <div className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-800/30 space-y-4">
                  <h3 className="text-xs font-bold text-gray-900 dark:text-white">
                    Passage & Blank Answer Configuration
                  </h3>

                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Leading Sentence / Text Component
                    </label>
                    <input
                      type="text"
                      value={fibPrefix}
                      onChange={(e) => setFibPrefix(e.target.value)}
                      placeholder="e.g. The capital of France is "
                      className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Correct Answer (Blank 1)
                      </label>
                      <input
                        type="text"
                        value={fibAnswer}
                        onChange={(e) => setFibAnswer(e.target.value)}
                        placeholder="e.g. Paris"
                        className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Evaluation Rule
                      </label>
                      <select
                        value={fibEvaluationType}
                        onChange={(e) => setFibEvaluationType(Number(e.target.value))}
                        className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      >
                        <option value={1}>Exact Match (Case Insensitive)</option>
                        <option value={2}>Contains Match</option>
                        <option value={3}>Regular Expression</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* TYPE 5: Matching */}
              {questionType === 5 && (
                <div className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-800/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-gray-900 dark:text-white">
                      Column A (Prompts) & Column B (Choices)
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        const newKey = matchChoices.length + 1;
                        setMatchChoices(prev => [...prev, { tempChoiceKey: newKey, choiceText: `Choice ${newKey}`, displayOrder: newKey }]);
                        setMatchPairs(prev => [...prev, { prompt: `Prompt ${newKey}`, correctChoice: newKey, displayOrder: newKey }]);
                      }}
                      className="rounded-lg bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-600 hover:bg-brand-100 dark:bg-brand-950/40 dark:text-brand-300"
                    >
                      + Add Pair
                    </button>
                  </div>

                  <div className="space-y-3">
                    {matchPairs.map((pair, idx) => (
                      <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                        <div className="sm:col-span-5">
                          <label className="block text-[10px] text-gray-500 mb-0.5">Prompt (Column A #{idx + 1})</label>
                          <input
                            type="text"
                            value={pair.prompt}
                            onChange={(e) => setMatchPairs(prev => prev.map((p, i) => i === idx ? { ...p, prompt: e.target.value } : p))}
                            className="w-full rounded-lg border border-gray-300 bg-transparent px-2.5 py-1 text-xs text-gray-800 focus:outline-none dark:border-gray-700 dark:text-white"
                          />
                        </div>

                        <div className="sm:col-span-5">
                          <label className="block text-[10px] text-gray-500 mb-0.5">Matching Choice (Column B #{idx + 1})</label>
                          <input
                            type="text"
                            value={matchChoices[idx]?.choiceText || ""}
                            onChange={(e) => setMatchChoices(prev => prev.map((c, i) => i === idx ? { ...c, choiceText: e.target.value } : c))}
                            className="w-full rounded-lg border border-gray-300 bg-transparent px-2.5 py-1 text-xs text-gray-800 focus:outline-none dark:border-gray-700 dark:text-white"
                          />
                        </div>

                        <div className="sm:col-span-2 text-right">
                          {matchPairs.length > 2 && (
                            <button
                              type="button"
                              onClick={() => {
                                setMatchPairs(prev => prev.filter((_, i) => i !== idx));
                                setMatchChoices(prev => prev.filter((_, i) => i !== idx));
                              }}
                              className="p-1 text-red-500 hover:text-red-700"
                            >
                              <TrashBinIcon className="size-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TYPE 6: Ordering */}
              {questionType === 6 && (
                <div className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-800/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-gray-900 dark:text-white">
                      Sequential Items (In Correct Order)
                    </h3>
                    <button
                      type="button"
                      onClick={() => setOrderItems(prev => [...prev, { itemValue: `Step ${prev.length + 1}`, correctOrder: prev.length + 1, feedback: `Phase ${prev.length + 1}`, displayOrder: prev.length + 1 }])}
                      className="rounded-lg bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-600 hover:bg-brand-100 dark:bg-brand-950/40 dark:text-brand-300"
                    >
                      + Add Item
                    </button>
                  </div>

                  <div className="space-y-2">
                    {orderItems.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-white dark:bg-gray-800 p-2.5 rounded-xl border border-gray-200 dark:border-gray-700">
                        <span className="flex size-6 items-center justify-center rounded-lg bg-brand-50 text-[11px] font-bold text-brand-600 dark:bg-brand-950/50">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={item.itemValue}
                          onChange={(e) => setOrderItems(prev => prev.map((it, i) => i === idx ? { ...it, itemValue: e.target.value } : it))}
                          placeholder={`Item #${idx + 1}`}
                          className="flex-1 rounded-lg border border-gray-300 bg-transparent px-2.5 py-1.5 text-xs text-gray-800 focus:outline-none dark:border-gray-700 dark:text-white"
                        />
                        {orderItems.length > 2 && (
                          <button
                            type="button"
                            onClick={() => setOrderItems(prev => prev.filter((_, i) => i !== idx))}
                            className="p-1 text-red-500 hover:text-red-700"
                          >
                            <TrashBinIcon className="size-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TYPE 7: Written Response */}
              {questionType === 7 && (
                <div className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-800/30 space-y-4">
                  <h3 className="text-xs font-bold text-gray-900 dark:text-white">
                    Written Response / Essay Settings
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700 dark:text-gray-300">
                      <input
                        type="checkbox"
                        checked={writtenSettings.enableHtmlEditor}
                        onChange={(e) => setWrittenSettings(prev => ({ ...prev, enableHtmlEditor: e.target.checked }))}
                        className="rounded border-gray-300 text-brand-500"
                      />
                      <span>HTML Rich Editor</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700 dark:text-gray-300">
                      <input
                        type="checkbox"
                        checked={writtenSettings.addFile}
                        onChange={(e) => setWrittenSettings(prev => ({ ...prev, addFile: e.target.checked, allowLearnerAttachments: e.target.checked }))}
                        className="rounded border-gray-300 text-brand-500"
                      />
                      <span>Allow File Upload</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700 dark:text-gray-300">
                      <input
                        type="checkbox"
                        checked={writtenSettings.recordAudio}
                        onChange={(e) => setWrittenSettings(prev => ({ ...prev, recordAudio: e.target.checked }))}
                        className="rounded border-gray-300 text-brand-500"
                      />
                      <span>Record Audio</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700 dark:text-gray-300">
                      <input
                        type="checkbox"
                        checked={writtenSettings.recordVideo}
                        onChange={(e) => setWrittenSettings(prev => ({ ...prev, recordVideo: e.target.checked }))}
                        className="rounded border-gray-300 text-brand-500"
                      />
                      <span>Record Video</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Evaluator Answer Key / Rubric (For Instructor Review)
                    </label>
                    <textarea
                      rows={2}
                      value={writtenSettings.evaluatorAnswerkey}
                      onChange={(e) => setWrittenSettings(prev => ({ ...prev, evaluatorAnswerkey: e.target.value }))}
                      placeholder="List expected grading points, key concepts, or rubrics..."
                      className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs text-gray-800 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white resize-none"
                    />
                  </div>
                </div>
              )}

              {/* TYPE 8: Short Answer */}
              {questionType === 8 && (
                <div className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-800/30 space-y-3">
                  <h3 className="text-xs font-bold text-gray-900 dark:text-white">
                    Direct Short Answer Entry
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Expected Answer Text
                      </label>
                      <input
                        type="text"
                        value={shortAnswerText}
                        onChange={(e) => setShortAnswerText(e.target.value)}
                        placeholder="e.g. Hypertext Transfer Protocol"
                        className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Matching Evaluation Rule
                      </label>
                      <select
                        value={shortAnswerMethod}
                        onChange={(e) => setShortAnswerMethod(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      >
                        <option value="ExactMatch">Exact Match</option>
                        <option value="CaseInsensitive">Case Insensitive Match</option>
                        <option value="Contains">Contains Key Phrase</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* TYPE 9: Arithmetic */}
              {questionType === 9 && (
                <div className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-800/30 space-y-4">
                  <h3 className="text-xs font-bold text-gray-900 dark:text-white">
                    Formula & Variable Ranges
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1">Formula</label>
                      <input
                        type="text"
                        value={arithmeticForm.formula}
                        onChange={(e) => setArithmeticForm(prev => ({ ...prev, formula: e.target.value }))}
                        placeholder="e.g. x * y"
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1">Tolerance (+/-)</label>
                      <input
                        type="number"
                        step="0.001"
                        value={arithmeticForm.tolerance}
                        onChange={(e) => setArithmeticForm(prev => ({ ...prev, tolerance: Number(e.target.value) }))}
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1">Unit Text</label>
                      <input
                        type="text"
                        value={arithmeticForm.unitText}
                        onChange={(e) => setArithmeticForm(prev => ({ ...prev, unitText: e.target.value }))}
                        placeholder="e.g. sq cm"
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">Variables Configuration:</span>
                    {arithmeticForm.variables.map((v, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-white dark:bg-gray-800 p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs">
                        <span className="font-bold text-brand-600">{v.variableName}:</span>
                        <span>Min:</span>
                        <input
                          type="number"
                          value={v.minValue}
                          onChange={(e) => setArithmeticForm(prev => ({ ...prev, variables: prev.variables.map((va, i) => i === idx ? { ...va, minValue: Number(e.target.value) } : va) }))}
                          className="w-16 rounded border px-2 py-0.5 text-xs dark:bg-gray-900"
                        />
                        <span>Max:</span>
                        <input
                          type="number"
                          value={v.maxValue}
                          onChange={(e) => setArithmeticForm(prev => ({ ...prev, variables: prev.variables.map((va, i) => i === idx ? { ...va, maxValue: Number(e.target.value) } : va) }))}
                          className="w-16 rounded border px-2 py-0.5 text-xs dark:bg-gray-900"
                        />
                        <span>Step:</span>
                        <input
                          type="number"
                          value={v.stepValue}
                          onChange={(e) => setArithmeticForm(prev => ({ ...prev, variables: prev.variables.map((va, i) => i === idx ? { ...va, stepValue: Number(e.target.value) } : va) }))}
                          className="w-16 rounded border px-2 py-0.5 text-xs dark:bg-gray-900"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TYPE 10: Significant Figures */}
              {questionType === 10 && (
                <div className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-800/30 space-y-3">
                  <h3 className="text-xs font-bold text-gray-900 dark:text-white">
                    Significant Figures Configuration
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1">Formula</label>
                      <input
                        type="text"
                        value={sigFigsForm.formula}
                        onChange={(e) => setSigFigsForm(prev => ({ ...prev, formula: e.target.value }))}
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1">Significant Figures Count</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={sigFigsForm.significantFiguresCount}
                        onChange={(e) => setSigFigsForm(prev => ({ ...prev, significantFiguresCount: Number(e.target.value) }))}
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1">Unit Text</label>
                      <input
                        type="text"
                        value={sigFigsForm.unitText}
                        onChange={(e) => setSigFigsForm(prev => ({ ...prev, unitText: e.target.value }))}
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TYPE 11: Multi Short Answer */}
              {questionType === 11 && (
                <div className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-800/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-gray-900 dark:text-white">
                      Multiple Short Answers with Percentage Weights
                    </h3>
                    <button
                      type="button"
                      onClick={() => setMultiShortAnswers(prev => [...prev, { answerText: `Answer ${prev.length + 1}`, weightInPercentage: Math.round(100 / (prev.length + 1)), displayOrder: prev.length + 1 }])}
                      className="rounded-lg bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-600 hover:bg-brand-100 dark:bg-brand-950/40 dark:text-brand-300"
                    >
                      + Add Input Box
                    </button>
                  </div>

                  <div className="space-y-2">
                    {multiShortAnswers.map((ans, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-white dark:bg-gray-800 p-2.5 rounded-xl border border-gray-200 dark:border-gray-700">
                        <span className="text-xs font-bold text-gray-600">Box #{idx + 1}:</span>
                        <input
                          type="text"
                          value={ans.answerText}
                          onChange={(e) => setMultiShortAnswers(prev => prev.map((a, i) => i === idx ? { ...a, answerText: e.target.value } : a))}
                          placeholder="Expected word/answer"
                          className="flex-1 rounded-lg border border-gray-300 bg-transparent px-2.5 py-1.5 text-xs text-gray-800 focus:outline-none dark:border-gray-700 dark:text-white"
                        />
                        <span className="text-[11px] text-gray-500">Weight %:</span>
                        <input
                          type="number"
                          value={ans.weightInPercentage}
                          onChange={(e) => setMultiShortAnswers(prev => prev.map((a, i) => i === idx ? { ...a, weightInPercentage: Number(e.target.value) } : a))}
                          className="w-20 rounded-lg border border-gray-300 bg-transparent px-2 py-1.5 text-xs text-gray-800 focus:outline-none dark:border-gray-700 dark:text-white"
                        />
                        {multiShortAnswers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setMultiShortAnswers(prev => prev.filter((_, i) => i !== idx))}
                            className="p-1 text-red-500 hover:text-red-700"
                          >
                            <TrashBinIcon className="size-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TYPE 12: Likert Scale */}
              {questionType === 12 && (
                <div className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-800/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-gray-900 dark:text-white">
                      Likert Scale Survey Statements
                    </h3>
                    <button
                      type="button"
                      onClick={() => setLikertStatements(prev => [...prev, { optionText: `Statement ${prev.length + 1}`, displayOrder: prev.length + 1 }])}
                      className="rounded-lg bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-600 hover:bg-brand-100 dark:bg-brand-950/40 dark:text-brand-300"
                    >
                      + Add Statement
                    </button>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <label className="flex items-center gap-2">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">Scale Points:</span>
                      <select
                        value={likertScaleTypeId}
                        onChange={(e) => setLikertScaleTypeId(Number(e.target.value))}
                        className="rounded-lg border px-2 py-1 text-xs dark:bg-gray-800"
                      >
                        <option value={3}>3-point scale</option>
                        <option value={5}>5-point scale (Strongly Disagree to Strongly Agree)</option>
                        <option value={7}>7-point scale</option>
                      </select>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={likertIncludeNA}
                        onChange={(e) => setLikertIncludeNA(e.target.checked)}
                        className="rounded border-gray-300 text-brand-500"
                      />
                      <span>Include N/A option</span>
                    </label>
                  </div>

                  <div className="space-y-2">
                    {likertStatements.map((st, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-white dark:bg-gray-800 p-2.5 rounded-xl border border-gray-200 dark:border-gray-700">
                        <span className="text-xs font-bold text-gray-600">Statement {idx + 1}:</span>
                        <input
                          type="text"
                          value={st.optionText}
                          onChange={(e) => setLikertStatements(prev => prev.map((s, i) => i === idx ? { ...s, optionText: e.target.value } : s))}
                          placeholder="e.g. The course material was comprehensive and helpful."
                          className="flex-1 rounded-lg border border-gray-300 bg-transparent px-2.5 py-1.5 text-xs text-gray-800 focus:outline-none dark:border-gray-700 dark:text-white"
                        />
                        {likertStatements.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setLikertStatements(prev => prev.filter((_, i) => i !== idx))}
                            className="p-1 text-red-500 hover:text-red-700"
                          >
                            <TrashBinIcon className="size-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setActiveTab("list")}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={savingQuestion}
                  className="rounded-xl bg-brand-500 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-600 disabled:opacity-60 transition flex items-center gap-2"
                >
                  {savingQuestion ? (
                    <>
                      <div className="size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Saving Question...</span>
                    </>
                  ) : (
                    <span>{editingQuestionId ? "Update Question" : "Save Question"}</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
