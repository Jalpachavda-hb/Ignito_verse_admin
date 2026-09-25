/**
 * INPUT DTO BUILDERS: Admin Quiz & Checkpoint Quiz Module
 * Builds strongly-typed payload objects and headers for .NET Web API endpoints.
 */

import { buildMainDegreeQuizListInput as buildMainDegreeQuizListInputInternal } from './mainDegreeQuizListInput.js';
import { buildFinalizeDegreeQuizAddUpdateInput as buildFinalizeDegreeQuizAddUpdateInputInternal } from './finalizeDegreeQuizAddUpdateInput.js';
import { buildDegreeQuizMasterAddUpdateInput as buildDegreeQuizMasterAddUpdateInputInternal } from './degreeQuizMasterAddUpdateInput.js';

/**
 * Normalizes an argument that can be either an options object or the first positional argument.
 */
function normalizeOptions(firstArg, ...args) {
    if (typeof firstArg === 'object' && firstArg !== null && !Array.isArray(firstArg)) {
        return firstArg;
    }
    return null;
}

// =============================================================================
// SECTION 1: MICROCREDENTIAL QUIZ LIST (MicrocredentialQuizList.js)
// =============================================================================

/**
 * 1.1 Fetch Paginated Microcredential Quiz List Input
 * Endpoint: POST /api/DegreeQuizAPI/MainDegreeQuizList
 */
export function buildMainDegreeQuizListInput(params = {}) {
    const opts = normalizeOptions(params) || { pageNo: params };
    return buildMainDegreeQuizListInputInternal(opts);
}

export const mainDegreeQuizListInput = buildMainDegreeQuizListInput;

/**
 * 1.2 Toggle Quiz Active / Inactive Status Input
 * Endpoint: POST /api/DegreeQuizAPI/ActiveInactiveDegreeQuiz
 */
export function buildActiveInactiveDegreeQuizInput(quizId = 0, isActive = false, adminId = 0) {
    const opts = normalizeOptions(quizId) || { quizId, isActive, adminId };
    const cleanQuizId = Number(opts.quizId ?? opts.QuizId ?? 0);
    const cleanIsActive = Boolean(opts.isActive ?? opts.IsActive);
    const cleanAdminId = Number(opts.adminId ?? opts.AdminId ?? 0);

    return {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            QuizId: cleanQuizId,
            IsActive: cleanIsActive,
            AdminId: cleanAdminId
        })
    };
}

/**
 * 1.3 Delete Quiz by Quiz ID Input
 * Endpoint: POST /api/DegreeQuizAPI/DeleteDegreeQuizByQuizId
 */
export function buildDeleteDegreeQuizByQuizIdInput(quizId = 0, adminId = 0) {
    const opts = normalizeOptions(quizId) || { quizId, adminId };
    const cleanQuizId = Number(opts.quizId ?? opts.QuizId ?? 0);
    const cleanAdminId = Number(opts.adminId ?? opts.AdminId ?? 0);

    return {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            QuizId: cleanQuizId,
            AdminId: cleanAdminId
        })
    };
}

// =============================================================================
// SECTION 2: ADD / EDIT MICROCREDENTIAL QUIZ (AddMicrocredentialQuiz.js)
// =============================================================================

/**
 * 2.1 Get Education Type List Input
 * Endpoint: POST /api/AdminCommonAPI/GetEducationType
 */
export function buildGetEducationTypeInput() {
    return {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({})
    };
}

/**
 * 2.3 Get Programmes by Stream Input
 * Endpoint: POST /api/ProgramAPI/GetStreamByProgramme
 */
export function buildGetStreamByProgrammeInput(streamId = 0) {
    const opts = normalizeOptions(streamId) || { streamId };
    const cleanStreamId = Number(opts.streamId ?? opts.StreamId ?? 0);

    return {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            StreamId: cleanStreamId,
            streamId: cleanStreamId
        })
    };
}

/**
 * 2.5 Add / Update Quiz Master (Step 1) Input
 * Endpoint: POST /api/DegreeQuizAPI/DegreeQuizMasterAddUpdate
 */
export function buildDegreeQuizMasterAddUpdateInput(params = {}) {
    const opts = normalizeOptions(params) || {};
    return buildDegreeQuizMasterAddUpdateInputInternal(opts);
}

export const degreeQuizMasterAddUpdateInput = buildDegreeQuizMasterAddUpdateInput;

/**
 * 2.5B Get Degree Quiz Details By Quiz ID Input
 * Endpoint: POST /api/DegreeQuizAPI/GetDegreeQuizDetailsByQuizId
 */
export function buildGetDegreeQuizDetailsByQuizIdInput(quizId = 0) {
    const opts = normalizeOptions(quizId) || { quizId };
    const cleanQuizId = Number(opts.quizId ?? opts.QuizId ?? 0);

    return {
        quizId: cleanQuizId,
        endpoint: `api/DegreeQuizAPI/GetDegreeQuizDetailsByQuizId?QuizId=${encodeURIComponent(cleanQuizId)}`,
        headers: {
            'Accept': '*/*'
        },
        body: ''
    };
}

/**
 * 2.6 Finalize Quiz & Save Settings Input
 * Endpoint: POST /api/DegreeQuizAPI/FinalizeDegreeQuizAddUpdate
 */
export function buildFinalizeDegreeQuizAddUpdateInput(params = {}) {
    const opts = normalizeOptions(params) || {};
    return buildFinalizeDegreeQuizAddUpdateInputInternal(opts);
}

export const finalizeDegreeQuizAddUpdateInput = buildFinalizeDegreeQuizAddUpdateInput;

/**
 * 2.7 Get Questions List for Quiz Input
 * Endpoint: POST /api/DegreeQuizAPI/DegreeQuizQuestionsList
 */
export function buildDegreeQuizQuestionsListInput(params = {}) {
    const opts = normalizeOptions(params) || { quizId: params };
    const cleanAdminId = Number(opts.adminId ?? opts.AdminId ?? 0);
    const cleanQuizId = Number(opts.quizId ?? opts.QuizId ?? 0);

    return {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            quizId: cleanQuizId,
            QuizId: cleanQuizId,
            adminId: cleanAdminId,
            AdminId: cleanAdminId,
            pageNo: Number(opts.pageNo ?? opts.PageNo ?? 1),
            pageSize: Number(opts.pageSize ?? opts.PageSize ?? 100),
            orderByColumn: opts.orderByColumn ?? opts.OrderByColumn ?? 'QuestionsId',
            orderByDirection: opts.orderByDirection ?? opts.OrderByDirection ?? 'DESC',
            totalRecords: Number(opts.totalRecords ?? opts.TotalRecords ?? 0),
            searchInput: opts.searchInput ?? opts.SearchInput ?? ''
        })
    };
}

/**
 * 2.8 Toggle Active/Inactive Status of Question Input
 * Endpoint: POST /api/DegreeQuizAPI/ActiveInactiveDegreeQuizQuestions
 */
export function buildActiveInactiveDegreeQuizQuestionsInput(quizId = 0, questionId = 0, isActive = false, adminId = 0) {
    const opts = normalizeOptions(quizId) || { quizId, questionId, isActive, adminId };
    const cleanQuizId = Number(opts.quizId ?? opts.QuizId ?? 0);
    const cleanQuestionId = Number(opts.questionId ?? opts.QuestionId ?? opts.questionsId ?? opts.QuestionsId ?? 0);
    const cleanIsActive = Boolean(opts.isActive ?? opts.IsActive);
    const cleanAdminId = Number(opts.adminId ?? opts.AdminId ?? 0);

    return {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            QuizId: cleanQuizId,
            quizId: cleanQuizId,
            QuestionId: cleanQuestionId,
            questionId: cleanQuestionId,
            QuestionsId: cleanQuestionId,
            questionsId: cleanQuestionId,
            IsActive: cleanIsActive,
            isActive: cleanIsActive,
            AdminId: cleanAdminId,
            adminId: cleanAdminId
        })
    };
}

/**
 * 2.9 Delete Question from Quiz Input
 * Endpoint: POST /api/DegreeQuizAPI/DeleteDegreeQuizQuestions
 */
export function buildDeleteDegreeQuizQuestionsInput(quizId = 0, questionId = 0, adminId = 0) {
    const opts = normalizeOptions(quizId) || { quizId, questionId, adminId };
    const cleanQuizId = Number(opts.quizId ?? opts.QuizId ?? 0);
    const cleanQuestionId = Number(opts.questionId ?? opts.QuestionId ?? opts.questionsId ?? opts.QuestionsId ?? 0);
    const cleanAdminId = Number(opts.adminId ?? opts.AdminId ?? 0);

    return {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            QuizId: cleanQuizId,
            quizId: cleanQuizId,
            QuestionId: cleanQuestionId,
            questionId: cleanQuestionId,
            QuestionsId: cleanQuestionId,
            questionsId: cleanQuestionId,
            AdminId: cleanAdminId,
            adminId: cleanAdminId
        })
    };
}

/**
 * 2.9B Add / Update Degree Quiz Question Master Input
 * Endpoint: POST /api/DegreeQuizAPI/DegreeQuizQuestionMasterAddUpdate
 * Supports all 12 Question Types
 */
export function buildDegreeQuizQuestionMasterAddUpdateInput(params = {}) {
    const opts = normalizeOptions(params) || {};
    const quizId = Number(opts.quizId ?? opts.QuizId ?? 0);
    const adminId = Number(opts.adminId ?? opts.AdminId ?? 1);
    const questionId = Number(opts.questionId ?? opts.QuestionId ?? opts.questionsId ?? opts.QuestionsId ?? 0);

    const degreeQuestionType = Number(opts.degreeQuestionType ?? opts.DegreeQuestionType ?? 1);

    // Master Question Record
    const rawQuestionList = Array.isArray(opts.degreeQuestionList ?? opts.DegreeQuestionList)
        ? (opts.degreeQuestionList ?? opts.DegreeQuestionList)
        : [
            {
                TempQuestionKey: 0,
                DegreeQuestionType: degreeQuestionType,
                Title: String(opts.title ?? opts.Title ?? ''),
                QuestionText: String(opts.questionText ?? opts.QuestionText ?? opts.finalQuestionName ?? opts.FinalQuestionName ?? ''),
                QuestionFeedback: String(opts.questionFeedback ?? opts.QuestionFeedback ?? ''),
                Hint: String(opts.hint ?? opts.Hint ?? ''),
                ShortDescription: String(opts.shortDescription ?? opts.ShortDescription ?? ''),
                Enumeration: String(opts.enumeration ?? opts.Enumeration ?? '1'),
                CustomWeights: String(opts.customWeights ?? opts.CustomWeights ?? ''),
                Difficulty: Number(opts.difficulty ?? opts.Difficulty ?? 1),
                AlternativeText: String(opts.alternativeText ?? opts.AlternativeText ?? ''),
                Points: Number(opts.points ?? opts.Points ?? 1),
                RandomizeAnswers: Boolean(opts.randomizeAnswers ?? opts.RandomizeAnswers ?? false),
                ImageUrl: String(opts.imageUrl ?? opts.ImageUrl ?? ''),
                HowPointAssignedToBlanks: String(opts.howPointAssignedToBlanks ?? opts.HowPointAssignedToBlanks ?? '')
            }
        ];

    const degreeQuestionList = rawQuestionList.map((item) => ({
        TempQuestionKey: Number(item.TempQuestionKey ?? item.tempQuestionKey ?? 0),
        DegreeQuestionType: Number(item.DegreeQuestionType ?? item.degreeQuestionType ?? degreeQuestionType),
        Title: String(item.Title ?? item.title ?? ''),
        QuestionText: String(item.QuestionText ?? item.questionText ?? item.FinalQuestionName ?? item.finalQuestionName ?? ''),
        QuestionFeedback: String(item.QuestionFeedback ?? item.questionFeedback ?? ''),
        Hint: String(item.Hint ?? item.hint ?? ''),
        ShortDescription: String(item.ShortDescription ?? item.shortDescription ?? ''),
        Enumeration: String(item.Enumeration ?? item.enumeration ?? '1'),
        CustomWeights: String(item.CustomWeights ?? item.customWeights ?? ''),
        Difficulty: Number(item.Difficulty ?? item.difficulty ?? 1),
        AlternativeText: String(item.AlternativeText ?? item.alternativeText ?? ''),
        Points: Number(item.Points ?? item.points ?? 1),
        RandomizeAnswers: Boolean(item.RandomizeAnswers ?? item.randomizeAnswers ?? false),
        ImageUrl: String(item.ImageUrl ?? item.imageUrl ?? ''),
        HowPointAssignedToBlanks: String(item.HowPointAssignedToBlanks ?? item.howPointAssignedToBlanks ?? '')
    }));

    const payload = {
        QuizId: quizId,
        AdminId: adminId,
        QuestionId: questionId,
        DegreeQuestionList: degreeQuestionList
    };

    // Type 1, 2, 4: DegreeAnswerOptionList
    if (degreeQuestionType === 1 || degreeQuestionType === 2 || degreeQuestionType === 4) {
        const answerOptionList = opts.degreeAnswerOptionList ?? opts.DegreeAnswerOptionList;
        if (Array.isArray(answerOptionList)) {
            payload.DegreeAnswerOptionList = answerOptionList.map((opt, idx) => ({
                TempQuestionKey: Number(opt.TempQuestionKey ?? opt.tempQuestionKey ?? 0),
                Text: String(opt.Text ?? opt.text ?? ''),
                AnswerFeedback: String(opt.AnswerFeedback ?? opt.answerFeedback ?? ''),
                IsCorrect: Boolean(opt.IsCorrect ?? opt.isCorrect ?? false),
                DisplayOrder: Number(opt.DisplayOrder ?? opt.displayOrder ?? (idx + 1))
            }));
        }
    }

    // Type 3: Fill-in-the-Blank
    if (degreeQuestionType === 3) {
        const textComponents = opts.degreeQuestionTextComponentList ?? opts.DegreeQuestionTextComponentList;
        if (Array.isArray(textComponents)) {
            payload.DegreeQuestionTextComponentList = textComponents.map((tc, idx) => ({
                TempQuestionKey: Number(tc.TempQuestionKey ?? tc.tempQuestionKey ?? 0),
                TempQuestionTextComponentKey: Number(tc.TempQuestionTextComponentKey ?? tc.tempQuestionTextComponentKey ?? (idx + 1)),
                ComponentType: String(tc.ComponentType ?? tc.componentType ?? (idx === 1 ? 'Blank' : 'Text')),
                Content: String(tc.Content ?? tc.content ?? tc.Text ?? tc.text ?? ''),
                BlankPoints: Number(tc.BlankPoints ?? tc.blankPoints ?? 0),
                DisplayOrder: Number(tc.DisplayOrder ?? tc.displayOrder ?? (idx + 1))
            }));
        }
        const blankAnswers = opts.degreeBlankAnswerList ?? opts.DegreeBlankAnswerList ?? opts.degreeQuestionBlankMasterList;
        if (Array.isArray(blankAnswers)) {
            payload.DegreeBlankAnswerList = blankAnswers.map((ba, idx) => ({
                TempQuestionTextComponentKey: Number(ba.TempQuestionTextComponentKey ?? ba.tempQuestionTextComponentKey ?? 2),
                Answer: String(ba.Answer ?? ba.answer ?? ba.CorrectAnswer ?? ba.correctAnswer ?? ''),
                Weight: Number(ba.Weight ?? ba.weight ?? 100),
                EvaluationTypeId: Number(ba.EvaluationTypeId ?? ba.evaluationTypeId ?? ba.EvaluationType ?? ba.evaluationType ?? 1),
                Feedback: String(ba.Feedback ?? ba.feedback ?? ''),
                BlankNumber: Number(ba.BlankNumber ?? ba.blankNumber ?? (idx + 1))
            }));
        }
    }

    // Type 5: Matching
    if (degreeQuestionType === 5) {
        const matchingQ = opts.degreeMatchingQuestionList ?? opts.DegreeMatchingQuestionList;
        if (Array.isArray(matchingQ)) {
            payload.DegreeMatchingQuestionList = matchingQ.map((mq) => ({
                TempQuestionKey: Number(mq.TempQuestionKey ?? mq.tempQuestionKey ?? 0),
                ShuffleMatches: Boolean(mq.ShuffleMatches ?? mq.shuffleMatches ?? true),
                ShuffleChoices: Boolean(mq.ShuffleChoices ?? mq.shuffleChoices ?? true),
                MatchRandomize: Boolean(mq.MatchRandomize ?? mq.matchRandomize ?? true),
                GradingMethodTypeId: Number(mq.GradingMethodTypeId ?? mq.gradingMethodTypeId ?? 1)
            }));
        }
        const matchingChoices = opts.degreeMatchingChoiceList ?? opts.DegreeMatchingChoiceList;
        if (Array.isArray(matchingChoices)) {
            payload.DegreeMatchingChoiceList = matchingChoices.map((mc, idx) => ({
                TempQuestionKey: Number(mc.TempQuestionKey ?? mc.tempQuestionKey ?? 0),
                TempChoiceKey: Number(mc.TempChoiceKey ?? mc.tempChoiceKey ?? (idx + 1)),
                ChoiceText: String(mc.ChoiceText ?? mc.choiceText ?? ''),
                DisplayOrder: Number(mc.DisplayOrder ?? mc.displayOrder ?? (idx + 1))
            }));
        }
        const matchingPairs = opts.degreeMatchingPairList ?? opts.DegreeMatchingPairList;
        if (Array.isArray(matchingPairs)) {
            payload.DegreeMatchingPairList = matchingPairs.map((mp, idx) => ({
                TempQuestionKey: Number(mp.TempQuestionKey ?? mp.tempQuestionKey ?? 0),
                Prompt: String(mp.Prompt ?? mp.prompt ?? ''),
                CorrectChoice: Number(mp.CorrectChoice ?? mp.correctChoice ?? 1),
                DisplayOrder: Number(mp.DisplayOrder ?? mp.displayOrder ?? (idx + 1))
            }));
        }
    }

    // Type 6: Ordering
    if (degreeQuestionType === 6) {
        const orderingQ = opts.degreeOrderingQuestionList ?? opts.DegreeOrderingQuestionList;
        if (Array.isArray(orderingQ)) {
            payload.DegreeOrderingQuestionList = orderingQ.map((oq) => ({
                TempQuestionKey: Number(oq.TempQuestionKey ?? oq.tempQuestionKey ?? 0),
                GradingMethodTypeId: Number(oq.GradingMethodTypeId ?? oq.gradingMethodTypeId ?? 1)
            }));
        }
        const orderingItems = opts.degreeOrderingItemList ?? opts.DegreeOrderingItemList;
        if (Array.isArray(orderingItems)) {
            payload.DegreeOrderingItemList = orderingItems.map((oi, idx) => ({
                TempQuestionKey: Number(oi.TempQuestionKey ?? oi.tempQuestionKey ?? 0),
                ItemValue: String(oi.ItemValue ?? oi.itemValue ?? ''),
                CorrectOrder: Number(oi.CorrectOrder ?? oi.correctOrder ?? (idx + 1)),
                Feedback: String(oi.Feedback ?? oi.feedback ?? ''),
                DisplayOrder: Number(oi.DisplayOrder ?? oi.displayOrder ?? (idx + 1))
            }));
        }
    }

    // Type 7: Written Response
    if (degreeQuestionType === 7) {
        const writtenSettings = opts.degreeWrittenResponseSettingList ?? opts.DegreeWrittenResponseSettingList;
        if (Array.isArray(writtenSettings)) {
            payload.DegreeWrittenResponseSettingList = writtenSettings.map((ws) => ({
                TempQuestionKey: Number(ws.TempQuestionKey ?? ws.tempQuestionKey ?? 0),
                EnableHtmlEditor: Boolean(ws.EnableHtmlEditor ?? ws.enableHtmlEditor ?? true),
                EnableHtmlEditorText: Boolean(ws.EnableHtmlEditorText ?? ws.enableHtmlEditorText ?? true),
                AddFile: Boolean(ws.AddFile ?? ws.addFile ?? false),
                RecordAudio: Boolean(ws.RecordAudio ?? ws.recordAudio ?? false),
                RecordVideo: Boolean(ws.RecordVideo ?? ws.recordVideo ?? false),
                AllowLearnerAttachments: Boolean(ws.AllowLearnerAttachments ?? ws.allowLearnerAttachments ?? false),
                InitialLearnerText: String(ws.InitialLearnerText ?? ws.initialLearnerText ?? ''),
                CustomResponseBoxSize: String(ws.CustomResponseBoxSize ?? ws.customResponseBoxSize ?? 'Large'),
                EvaluatorAnswerkey: String(ws.EvaluatorAnswerkey ?? ws.evaluatorAnswerkey ?? '')
            }));
        }
    }

    // Type 8: Short Answer
    if (degreeQuestionType === 8) {
        const shortBlanks = opts.degreeShortAnswerBlankList ?? opts.DegreeShortAnswerBlankList;
        if (Array.isArray(shortBlanks)) {
            payload.DegreeShortAnswerBlankList = shortBlanks.map((sb, idx) => ({
                TempQuestionKey: Number(sb.TempQuestionKey ?? sb.tempQuestionKey ?? 0),
                BlankNumber: Number(sb.BlankNumber ?? sb.blankNumber ?? (idx + 1)),
                BlankType: String(sb.BlankType ?? sb.blankType ?? 'Text'),
                AnswerText: String(sb.AnswerText ?? sb.answerText ?? ''),
                HowPointAssignedToBlanks: String(sb.HowPointAssignedToBlanks ?? sb.howPointAssignedToBlanks ?? 'ExactMatch')
            }));
        }
    }

    // Type 9: Arithmetic
    if (degreeQuestionType === 9) {
        const arithmeticQ = opts.degreeArithmeticQuestionList ?? opts.DegreeArithmeticQuestionList;
        if (Array.isArray(arithmeticQ)) {
            payload.DegreeArithmeticQuestionList = arithmeticQ.map((aq) => ({
                TempQuestionKey: Number(aq.TempQuestionKey ?? aq.tempQuestionKey ?? 0),
                AllowAttachmentToSupportAnswer: Boolean(aq.AllowAttachmentToSupportAnswer ?? aq.allowAttachmentToSupportAnswer ?? false),
                Formula: String(aq.Formula ?? aq.formula ?? ''),
                AnswerPrecision: Number(aq.AnswerPrecision ?? aq.answerPrecision ?? 2),
                EnforcePrecision: Boolean(aq.EnforcePrecision ?? aq.enforcePrecision ?? true),
                Tolerance: Number(aq.Tolerance ?? aq.tolerance ?? 0.01),
                Tolerance_type: String(aq.Tolerance_type ?? aq.tolerance_type ?? aq.ToleranceType ?? aq.toleranceType ?? 'Absolute'),
                UnitText: String(aq.UnitText ?? aq.unitText ?? ''),
                UnitWorth: Number(aq.UnitWorth ?? aq.unitWorth ?? 1.0),
                UnitPointsType: String(aq.UnitPointsType ?? aq.unitPointsType ?? 'Add'),
                EvaluationTypeId: Number(aq.EvaluationTypeId ?? aq.evaluationTypeId ?? 1),
                CorrectAns: String(aq.CorrectAns ?? aq.correctAns ?? '')
            }));
        }
        const arithmeticVars = opts.degreeArithmeticVariableList ?? opts.DegreeArithmeticVariableList;
        if (Array.isArray(arithmeticVars)) {
            payload.DegreeArithmeticVariableList = arithmeticVars.map((av) => ({
                TempQuestionKey: Number(av.TempQuestionKey ?? av.tempQuestionKey ?? 0),
                VariableName: String(av.VariableName ?? av.variableName ?? ''),
                MinValue: Number(av.MinValue ?? av.minValue ?? 1.0),
                MaxValue: Number(av.MaxValue ?? av.maxValue ?? 10.0),
                DecimalPlaces: Number(av.DecimalPlaces ?? av.decimalPlaces ?? 1),
                StepValue: Number(av.StepValue ?? av.stepValue ?? 0.5)
            }));
        }
    }

    // Type 10: Significant Figures
    if (degreeQuestionType === 10) {
        const sigFigQ = opts.degreeSignificantFiguresQuestionList ?? opts.DegreeSignificantFiguresQuestionList;
        if (Array.isArray(sigFigQ)) {
            payload.DegreeSignificantFiguresQuestionList = sigFigQ.map((sq) => ({
                TempQuestionKey: Number(sq.TempQuestionKey ?? sq.tempQuestionKey ?? 0),
                AllowAttachmentstosupportAnswers: Boolean(sq.AllowAttachmentstosupportAnswers ?? sq.allowAttachmentstosupportAnswers ?? false),
                Formula: String(sq.Formula ?? sq.formula ?? ''),
                SignificantFiguresCount: Number(sq.SignificantFiguresCount ?? sq.significantFiguresCount ?? 3),
                DeductPercentage: Number(sq.DeductPercentage ?? sq.deductPercentage ?? 10.0),
                ToleranceValue: Number(sq.ToleranceValue ?? sq.toleranceValue ?? 0.05),
                ToleranceTypeId: Number(sq.ToleranceTypeId ?? sq.toleranceTypeId ?? 1),
                UnitToleranceOne: Number(sq.UnitToleranceOne ?? sq.unitToleranceOne ?? 0),
                UnitToleranceTwo: Number(sq.UnitToleranceTwo ?? sq.unitToleranceTwo ?? 0),
                PercentageOne: Number(sq.PercentageOne ?? sq.percentageOne ?? 100),
                UnitWorth: Number(sq.UnitWorth ?? sq.unitWorth ?? 1.0),
                EvaluationTypeId: Number(sq.EvaluationTypeId ?? sq.evaluationTypeId ?? 1),
                UnitText: String(sq.UnitText ?? sq.unitText ?? 'N'),
                CorrectAns: String(sq.CorrectAns ?? sq.correctAns ?? '')
            }));
        }
        const sigFigVars = opts.degreeSignificantFiguresVariableList ?? opts.DegreeSignificantFiguresVariableList;
        if (Array.isArray(sigFigVars)) {
            payload.DegreeSignificantFiguresVariableList = sigFigVars.map((sv) => ({
                TempQuestionKey: Number(sv.TempQuestionKey ?? sv.tempQuestionKey ?? 0),
                VariableName: String(sv.VariableName ?? sv.variableName ?? ''),
                MinValue: Number(sv.MinValue ?? sv.minValue ?? 1.0),
                MinPower: Number(sv.MinPower ?? sv.minPower ?? 0),
                MaxValue: Number(sv.MaxValue ?? sv.maxValue ?? 5.0),
                MaxPower: Number(sv.MaxPower ?? sv.maxPower ?? 2),
                StepValue: Number(sv.StepValue ?? sv.stepValue ?? 1.0),
                StepPower: Number(sv.StepPower ?? sv.stepPower ?? 0)
            }));
        }
    }

    // Type 11: Multi Short Answer
    if (degreeQuestionType === 11) {
        const multiAnswers = opts.degreeMultiShortAnswerList ?? opts.DegreeMultiShortAnswerList;
        if (Array.isArray(multiAnswers)) {
            payload.DegreeMultiShortAnswerList = multiAnswers.map((ma, idx) => ({
                TempQuestionKey: Number(ma.TempQuestionKey ?? ma.tempQuestionKey ?? 0),
                AnswerText: String(ma.AnswerText ?? ma.answerText ?? ''),
                WeightInPercentage: Number(ma.WeightInPercentage ?? ma.weightInPercentage ?? 33.33),
                EvaluationTypeId: Number(ma.EvaluationTypeId ?? ma.evaluationTypeId ?? 1),
                DisplayOrder: Number(ma.DisplayOrder ?? ma.displayOrder ?? (idx + 1))
            }));
        }
        const inputBoxes = opts.degreeMultiShortAnswerInputBox ?? opts.DegreeMultiShortAnswerInputBox;
        if (Array.isArray(inputBoxes)) {
            payload.DegreeMultiShortAnswerInputBox = inputBoxes.map((ib) => ({
                TempQuestionKey: Number(ib.TempQuestionKey ?? ib.tempQuestionKey ?? 0),
                InputBoxCount: Number(ib.InputBoxCount ?? ib.inputBoxCount ?? 3),
                RowsCount: Number(ib.RowsCount ?? ib.rowsCount ?? 3),
                ColumnsCount: Number(ib.ColumnsCount ?? ib.columnsCount ?? 1)
            }));
        }
    }

    // Type 12: Likert Scale
    if (degreeQuestionType === 12) {
        const likertQ = opts.degreeLikertQuestionList ?? opts.DegreeLikertQuestionList;
        if (Array.isArray(likertQ)) {
            payload.DegreeLikertQuestionList = likertQ.map((lq) => ({
                TempQuestionKey: Number(lq.TempQuestionKey ?? lq.tempQuestionKey ?? 0),
                ScaleTypeId: Number(lq.ScaleTypeId ?? lq.scaleTypeId ?? 5),
                IncludeNAOption: Boolean(lq.IncludeNAOption ?? lq.includeNAOption ?? true)
            }));
        }
        const statements = opts.degreeLikertStatementList ?? opts.DegreeLikertStatementList;
        if (Array.isArray(statements)) {
            payload.DegreeLikertStatementList = statements.map((ls, idx) => ({
                TempQuestionKey: Number(ls.TempQuestionKey ?? ls.tempQuestionKey ?? 0),
                OptionText: String(ls.OptionText ?? ls.optionText ?? ''),
                DisplayOrder: Number(ls.DisplayOrder ?? ls.displayOrder ?? (idx + 1))
            }));
        }
    }

    return {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
    };
}

/**
 * 2.10 Get Students for Special Quiz Access Input
 * Endpoint: POST /api/DegreeQuizAPI/GetDegreeStudentsForSpecialQuizAccess
 */
export function buildGetDegreeStudentsForSpecialQuizAccessInput(params = {}) {
    const opts = normalizeOptions(params) || { quizId: params };
    const cleanQuizId = Number(opts.quizId ?? opts.QuizId ?? 0);

    return {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            pageNo: Number(opts.pageNo ?? opts.PageNo ?? 1),
            pageSize: Number(opts.pageSize ?? opts.PageSize ?? 10),
            orderByColumn: opts.orderByColumn ?? opts.OrderByColumn ?? 'StudentId',
            orderByDirection: opts.orderByDirection ?? opts.OrderByDirection ?? 'asc',
            quizId: cleanQuizId,
            QuizId: cleanQuizId,
            searchInput: opts.searchInput ?? opts.SearchInput ?? ''
        })
    };
}

/**
 * 2.11 Get Microcredential Quiz Categories Input
 * Endpoint: POST /api/DegreeQuizAPI/MicrocredentialQuizCategoryList
 */
export function buildMicrocredentialQuizCategoryListInput() {
    return {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({})
    };
}

// =============================================================================
// SECTION 3: CHECKPOINT QUIZ LIST (MicrocredentialCheckpointQuizList.js)
// =============================================================================

/**
 * 3.2 Get Checkpoint Quiz Topics & Detail Modal Input
 * Endpoint: POST /Api/IgnitoMicroCredencialAPI/GetMicroCourseCheckpointQuizTopicDetail
 */
export function buildGetMicroCourseCheckpointQuizTopicDetailInput(microcredentialCourseId = 0) {
    const opts = normalizeOptions(microcredentialCourseId) || { microcredentialCourseId };
    const cleanCourseId = Number(opts.microcredentialCourseId ?? opts.MicrocredentialCourseId ?? 0);

    return {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            MicrocredentialCourseId: cleanCourseId,
            microcredentialCourseId: cleanCourseId
        })
    };
}

/**
 * 3.3 View AI Checkpoint Quiz Questions & Explanations Input
 * Endpoint: POST /api/IgnitoMicroCredencialAPI/GetMicrocredentialCheckpointQuizData
 */
export function buildGetMicrocredentialCheckpointQuizDataInput(microcreditYoutubeDataMasterId = 0) {
    const opts = normalizeOptions(microcreditYoutubeDataMasterId) || { microcreditYoutubeDataMasterId };
    const cleanVideoId = Number(opts.microcreditYoutubeDataMasterId ?? opts.MicrocreditYoutubeDataMasterId ?? 0);

    return {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            MicrocreditYoutubeDataMasterId: cleanVideoId,
            microcreditYoutubeDataMasterId: cleanVideoId
        })
    };
}

/**
 * 3.4 Delete Checkpoint Quiz by Video Youtube ID Input
 * Endpoint: POST /Api/IgnitoMicroCredencialAPI/DeleteMicrocredentialCheckpointQuizByYoutubeDataMasterId
 */
export function buildDeleteMicrocredentialCheckpointQuizByYoutubeDataMasterIdInput(microcreditYoutubeDataMasterId = 0) {
    const opts = normalizeOptions(microcreditYoutubeDataMasterId) || { microcreditYoutubeDataMasterId };
    const cleanVideoId = Number(opts.microcreditYoutubeDataMasterId ?? opts.MicrocreditYoutubeDataMasterId ?? 0);

    return {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            MicrocreditYoutubeDataMasterId: cleanVideoId,
            microcreditYoutubeDataMasterId: cleanVideoId
        })
    };
}

/**
 * 3.5 Delete All Checkpoint Quizzes by Course ID Input
 * Endpoint: POST /api/IgnitoMicroCredencialAPI/DeleteMicrocredentialCheckpointQuizByCourseId
 */
export function buildDeleteMicrocredentialCheckpointQuizByCourseIdInput(microcredentialCourseId = 0) {
    const opts = normalizeOptions(microcredentialCourseId) || { microcredentialCourseId };
    const cleanCourseId = Number(opts.microcredentialCourseId ?? opts.MicrocredentialCourseId ?? 0);

    return {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            MicrocredentialCourseId: cleanCourseId,
            microcredentialCourseId: cleanCourseId
        })
    };
}

// =============================================================================
// SECTION 4: ADD CHECKPOINT QUIZ (AddMicrocredentialCheckpointQuiz.js)
// =============================================================================

/**
 * 4.3 Get Video Lectures by Course ID Input
 * Endpoint: POST /api/IgnitoMicroCredencialAPI/GetMicrocredentialVideoDetailsByCourseId
 */
export function buildGetMicrocredentialVideoDetailsByCourseIdInput(microcredentialCourseId = 0) {
    const opts = normalizeOptions(microcredentialCourseId) || { microcredentialCourseId };
    const cleanCourseId = Number(opts.microcredentialCourseId ?? opts.MicrocredentialCourseId ?? 0);

    return {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            MicrocredentialCourseId: cleanCourseId,
            microcredentialCourseId: cleanCourseId
        })
    };
}

/**
 * 4.4 Generate AI Microcredential Checkpoint Quiz Input
 * Endpoint: POST /api/IgnitoMicroCredencialAPI/GenerateMicrocredentialCheckpointQuiz
 */
export function buildGenerateMicrocredentialCheckpointQuizInput(microcreditYoutubeDataMasterId = 0, adminId = 0) {
    const opts = normalizeOptions(microcreditYoutubeDataMasterId) || { microcreditYoutubeDataMasterId, adminId };
    const cleanVideoId = Number(opts.microcreditYoutubeDataMasterId ?? opts.MicrocreditYoutubeDataMasterId ?? 0);
    const cleanAdminId = Number(opts.adminId ?? opts.AdminId ?? 0);

    return {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            MicrocreditYoutubeDataMasterId: cleanVideoId,
            microcreditYoutubeDataMasterId: cleanVideoId,
            AdminId: cleanAdminId,
            adminId: cleanAdminId
        })
    };
}

// =============================================================================
// SECTION 5: CHECKPOINT QUIZ REPORT (MicrocredentialCheckpointQuizReport.js)
// =============================================================================

/**
 * 5.1 Fetch Student Checkpoint Quiz Report Table Input
 * Endpoint: POST /api/IgnitoMicroCredencialAPI/GetMicrocredentialCheckpointQuizReport
 */
export function buildGetMicrocredentialCheckpointQuizReportInput(params = {}) {
    const opts = normalizeOptions(params) || { pageNo: params };
    const cleanAdminId = Number(opts.adminId ?? opts.AdminId ?? 0);

    return {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            pageNo: Number(opts.pageNo ?? opts.PageNo ?? 1),
            pageSize: Number(opts.pageSize ?? opts.PageSize ?? 10),
            orderByColumn: opts.orderByColumn ?? opts.OrderByColumn ?? 'StudentName',
            orderByDirection: opts.orderByDirection ?? opts.OrderByDirection ?? 'asc',
            totalRecords: Number(opts.totalRecords ?? opts.TotalRecords ?? 0),
            searchInput: opts.searchInput ?? opts.SearchInput ?? '',
            adminId: cleanAdminId,
            AdminId: cleanAdminId
        })
    };
}

/**
 * 5.2 Fetch Detailed Student Quiz Responses & Summary Input
 * Endpoint: POST /api/IgnitoMicroCredencialAPI/GetStudentMicrocredentialQuizResponse
 */
export function buildGetStudentMicrocredentialQuizResponseInput(studentId = 0, microcredentialCourseId = 0, videoId = 0) {
    const opts = normalizeOptions(studentId) || { studentId, microcredentialCourseId, videoId };
    const cleanStudentId = Number(opts.studentId ?? opts.StudentId ?? 0);
    const cleanCourseId = Number(opts.microcredentialCourseId ?? opts.MicrocredentialCourseId ?? 0);
    const cleanVideoId = Number(opts.videoId ?? opts.VideoId ?? opts.microcreditYoutubeDataMasterId ?? opts.MicrocreditYoutubeDataMasterId ?? 0);

    return {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            StudentId: cleanStudentId,
            studentId: cleanStudentId,
            MicrocredentialCourseId: cleanCourseId,
            microcredentialCourseId: cleanCourseId,
            VideoId: cleanVideoId,
            videoId: cleanVideoId
        })
    };
}

/**
 * 2.12 Fetch Degree Quiz Preview By Quiz ID Input
 * Endpoint: POST /api/DegreeQuizAPI/DegreeQuizPerviewGetByQuizId
 */
export function buildDegreeQuizPreviewGetByQuizIdInput(quizId = 0) {
    const opts = normalizeOptions(quizId) || { quizId };
    const cleanQuizId = Number(opts.quizId ?? opts.QuizId ?? 0);

    return {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            QuizId: cleanQuizId,
            quizId: cleanQuizId
        })
    };
}


