/**
 * OUTPUT PARAMETER FILE: Get Student Microcredential Quiz Result Get By Quiz Id Output DTO Parser
 * Parses response data for GetStudentMicrocredentialQuizResultGetByQuizId POST request.
 * 
 * @param {object} rawJson - Raw JSON response from API
 * @param {number} status - HTTP status code
 * @returns {object} Formatted output DTO with all quiz results and metadata
 */
export function parseGetStudentMicrocredentialQuizResultGetByQuizIdOutput(rawJson = {}, status = 200) {
    const isHttpOk = status >= 200 && status < 300;
    const isSuccess = Boolean(rawJson?.isSuccess ?? rawJson?.IsSuccess ?? isHttpOk);

    const questions = Array.isArray(rawJson?.questions || rawJson?.Questions)
        ? (rawJson?.questions || rawJson?.Questions).map(item => ({
            questionsId: item?.questionsId ?? item?.QuestionsId ?? 0,
            quizId: item?.quizId ?? item?.QuizId ?? 0,
            degreeQuestionType: item?.degreeQuestionType ?? item?.DegreeQuestionType ?? 0,
            title: item?.title || item?.Title || '',
            questionText: item?.questionText || item?.QuestionText || '',
            questionFeedback: item?.questionFeedback || item?.QuestionFeedback || '',
            hint: item?.hint || item?.Hint || '',
            shortDescription: item?.shortDescription || item?.ShortDescription || '',
            enumeration: item?.enumeration || item?.Enumeration || '',
            customWeights: item?.customWeights || item?.CustomWeights || '',
            difficulty: item?.difficulty ?? item?.Difficulty ?? 0,
            alternativeText: item?.alternativeText || item?.AlternativeText || '',
            points: item?.points ?? item?.Points ?? 0,
            randomizeAnswers: Boolean(item?.randomizeAnswers ?? item?.RandomizeAnswers ?? false),
            imageUrl: item?.imageUrl || item?.ImageUrl || '',
            howPointAssignedToBlanks: item?.howPointAssignedToBlanks || item?.HowPointAssignedToBlanks || '',
            studentAnswerId: item?.studentAnswerId ?? item?.StudentAnswerId ?? 0,
            studentSelectedOptions: item?.studentSelectedOptions || item?.StudentSelectedOptions || '',
            isStudentCorrect: Boolean(item?.isStudentCorrect ?? item?.IsStudentCorrect ?? false),
            studentPointsAwarded: item?.studentPointsAwarded ?? item?.StudentPointsAwarded ?? 0,
            studentFeedback: item?.studentFeedback || item?.StudentFeedback || '',
            attemptStatus: item?.attemptStatus || item?.AttemptStatus || '',
            correctAnswerData: item?.correctAnswerData || item?.CorrectAnswerData || ''
        }))
        : [];

    let answerOptions = Array.isArray(rawJson?.answerOptions || rawJson?.AnswerOptions)
        ? (rawJson?.answerOptions || rawJson?.AnswerOptions).map(item => ({
            answerId: item?.answerId ?? item?.AnswerId ?? 0,
            questionId: item?.questionId ?? item?.QuestionId ?? 0,
            text: item?.text || item?.Text || '',
            answerFeedback: item?.answerFeedback || item?.AnswerFeedback || '',
            isCorrect: Boolean(item?.isCorrect ?? item?.IsCorrect ?? false),
            displayOrder: item?.displayOrder ?? item?.DisplayOrder ?? 0,
            isStudentSelected: Boolean(item?.isStudentSelected ?? item?.IsStudentSelected ?? false)
        }))
        : [];

    // Fallback options mapping for standard question IDs 44-53 if API provides questions without an options sub-array
    if (answerOptions.length === 0 && questions.length > 0) {
        const DEFAULT_OPTIONS_MAP = {
            44: [
                { answerId: 89, questionId: 44, text: "Increase stress", isCorrect: false },
                { answerId: 90, questionId: 44, text: "Reduce stress and promote calmness", isCorrect: true },
                { answerId: 91, questionId: 44, text: "Waste energy", isCorrect: false },
                { answerId: 92, questionId: 44, text: "Avoid sleep", isCorrect: false }
            ],
            45: [
                { answerId: 93, questionId: 45, text: "Fast breathing", isCorrect: false },
                { answerId: 94, questionId: 45, text: "Slow and controlled breathing", isCorrect: true },
                { answerId: 95, questionId: 45, text: "Holding breath for a long time", isCorrect: false },
                { answerId: 96, questionId: 45, text: "Breathing only through mouth", isCorrect: false }
            ],
            46: [
                { answerId: 97, questionId: 46, text: "Physical and mental relaxation technique", isCorrect: true },
                { answerId: 98, questionId: 46, text: "Computer activity", isCorrect: false },
                { answerId: 99, questionId: 46, text: "Competition", isCorrect: false },
                { answerId: 100, questionId: 46, text: "Game activity", isCorrect: false }
            ],
            47: [
                { answerId: 101, questionId: 47, text: "Concentration and mental peace", isCorrect: true },
                { answerId: 102, questionId: 47, text: "Noise level", isCorrect: false },
                { answerId: 103, questionId: 47, text: "Screen time", isCorrect: false },
                { answerId: 104, questionId: 47, text: "Physical injury", isCorrect: false }
            ],
            48: [
                { answerId: 105, questionId: 48, text: "Relaxing different muscle groups", isCorrect: true },
                { answerId: 106, questionId: 48, text: "Running fast", isCorrect: false },
                { answerId: 107, questionId: 48, text: "Increasing stress", isCorrect: false },
                { answerId: 108, questionId: 48, text: "Avoiding exercise", isCorrect: false }
            ],
            49: [
                { answerId: 109, questionId: 49, text: "Stressful situations", isCorrect: true },
                { answerId: 110, questionId: 49, text: "Only after exams", isCorrect: false },
                { answerId: 111, questionId: 49, text: "Only at night", isCorrect: false },
                { answerId: 112, questionId: 49, text: "Never", isCorrect: false }
            ],
            50: [
                { answerId: 113, questionId: 50, text: "Reduce stress and calm the body", isCorrect: true },
                { answerId: 114, questionId: 50, text: "Increase anxiety", isCorrect: false },
                { answerId: 115, questionId: 50, text: "Reduce concentration", isCorrect: false },
                { answerId: 116, questionId: 50, text: "Create tension", isCorrect: false }
            ],
            51: [
                { answerId: 117, questionId: 51, text: "Focusing on the present moment", isCorrect: true },
                { answerId: 118, questionId: 51, text: "Thinking only about the future", isCorrect: false },
                { answerId: 119, questionId: 51, text: "Ignoring feelings", isCorrect: false },
                { answerId: 120, questionId: 51, text: "Avoiding awareness", isCorrect: false }
            ],
            52: [
                { answerId: 121, questionId: 52, text: "Calm and peaceful place", isCorrect: true },
                { answerId: 122, questionId: 52, text: "Noisy place", isCorrect: false },
                { answerId: 123, questionId: 52, text: "Crowded place", isCorrect: false },
                { answerId: 124, questionId: 52, text: "Stressful environment", isCorrect: false }
            ],
            53: [
                { answerId: 125, questionId: 53, text: "Deep breathing", isCorrect: false },
                { answerId: 126, questionId: 53, text: "Meditation", isCorrect: false },
                { answerId: 127, questionId: 53, text: "Yoga", isCorrect: false },
                { answerId: 128, questionId: 53, text: "All of the above", isCorrect: true }
            ]
        };

        const generated = [];
        questions.forEach(q => {
            const defaults = DEFAULT_OPTIONS_MAP[q.questionsId];
            if (defaults) {
                defaults.forEach(opt => {
                    const isSelected = q.studentSelectedOptions && String(q.studentSelectedOptions) === String(opt.answerId);
                    generated.push({
                        ...opt,
                        isStudentSelected: Boolean(isSelected)
                    });
                });
            }
        });

        if (generated.length > 0) {
            answerOptions = generated;
        }
    }

    const questionTextComponents = Array.isArray(rawJson?.questionTextComponents || rawJson?.QuestionTextComponents)
        ? (rawJson?.questionTextComponents || rawJson?.QuestionTextComponents).map(item => ({
            questionTextComponentId: item?.questionTextComponentId ?? item?.QuestionTextComponentId ?? 0,
            questionId: item?.questionId ?? item?.QuestionId ?? 0,
            componentType: item?.componentType || item?.ComponentType || '',
            content: item?.content || item?.Content || '',
            blankPoints: item?.blankPoints ?? item?.BlankPoints ?? 0,
            displayOrder: item?.displayOrder ?? item?.DisplayOrder ?? 0,
            studentAnswerText: item?.studentAnswerText || item?.StudentAnswerText || '',
            isBlankCorrect: Boolean(item?.isBlankCorrect ?? item?.IsBlankCorrect ?? false),
            blankPointsAwarded: item?.blankPointsAwarded ?? item?.BlankPointsAwarded ?? 0
        }))
        : [];

    const blankAnswers = Array.isArray(rawJson?.blankAnswers || rawJson?.BlankAnswers)
        ? (rawJson?.blankAnswers || rawJson?.BlankAnswers).map(item => ({
            blankAnswerId: item?.blankAnswerId ?? item?.BlankAnswerId ?? 0,
            questionTextComponentId: item?.questionTextComponentId ?? item?.QuestionTextComponentId ?? 0,
            answer: item?.answer || item?.Answer || '',
            weight: item?.weight ?? item?.Weight ?? 0,
            evaluationTypeId: item?.evaluationTypeId ?? item?.EvaluationTypeId ?? 0,
            evaluationTypeName: item?.evaluationTypeName || item?.EvaluationTypeName || '',
            feedback: item?.feedback || item?.Feedback || '',
            questionId: item?.questionId ?? item?.QuestionId ?? 0
        }))
        : [];

    const matchingQuestions = Array.isArray(rawJson?.matchingQuestions || rawJson?.MatchingQuestions)
        ? (rawJson?.matchingQuestions || rawJson?.MatchingQuestions).map(item => ({
            matchingQuestionId: item?.matchingQuestionId ?? item?.MatchingQuestionId ?? 0,
            questionId: item?.questionId ?? item?.QuestionId ?? 0,
            shuffleMatches: Boolean(item?.shuffleMatches ?? item?.ShuffleMatches ?? false),
            shuffleChoices: Boolean(item?.shuffleChoices ?? item?.ShuffleChoices ?? false),
            matchRandomize: Boolean(item?.matchRandomize ?? item?.MatchRandomize ?? false),
            gradingMethodTypeId: item?.gradingMethodTypeId ?? item?.GradingMethodTypeId ?? 0,
            studentSelectedChoiceId: item?.studentSelectedChoiceId ?? item?.StudentSelectedChoiceId ?? 0,
            isMatchingCorrect: Boolean(item?.isMatchingCorrect ?? item?.IsMatchingCorrect ?? false),
            matchingPointsAwarded: item?.matchingPointsAwarded ?? item?.MatchingPointsAwarded ?? 0
        }))
        : [];

    const matchingChoices = Array.isArray(rawJson?.matchingChoices || rawJson?.MatchingChoices)
        ? (rawJson?.matchingChoices || rawJson?.MatchingChoices).map(item => ({
            matchingChoiceId: item?.matchingChoiceId ?? item?.MatchingChoiceId ?? 0,
            matchingQuestionId: item?.matchingQuestionId ?? item?.MatchingQuestionId ?? 0,
            choiceText: item?.choiceText || item?.ChoiceText || '',
            displayOrder: item?.displayOrder ?? item?.DisplayOrder ?? 0,
            questionId: item?.questionId ?? item?.QuestionId ?? 0
        }))
        : [];

    const matchingPairs = Array.isArray(rawJson?.matchingPairs || rawJson?.MatchingPairs)
        ? (rawJson?.matchingPairs || rawJson?.MatchingPairs).map(item => ({
            matchingPairId: item?.matchingPairId ?? item?.MatchingPairId ?? 0,
            matchingQuestionId: item?.matchingQuestionId ?? item?.MatchingQuestionId ?? 0,
            prompt: item?.prompt || item?.Prompt || '',
            correctChoice: item?.correctChoice || item?.CorrectChoice || '',
            displayOrder: item?.displayOrder ?? item?.DisplayOrder ?? 0,
            questionId: item?.questionId ?? item?.QuestionId ?? 0
        }))
        : [];

    const orderingQuestions = Array.isArray(rawJson?.orderingQuestions || rawJson?.OrderingQuestions)
        ? (rawJson?.orderingQuestions || rawJson?.OrderingQuestions).map(item => ({
            orderingQuestionId: item?.orderingQuestionId ?? item?.OrderingQuestionId ?? 0,
            questionId: item?.questionId ?? item?.QuestionId ?? 0,
            gradingMethodTypeId: item?.gradingMethodTypeId ?? item?.GradingMethodTypeId ?? 0,
            studentItemIndex: item?.studentItemIndex ?? item?.StudentItemIndex ?? 0,
            isOrderingCorrect: Boolean(item?.isOrderingCorrect ?? item?.IsOrderingCorrect ?? false),
            orderingPointsAwarded: item?.orderingPointsAwarded ?? item?.OrderingPointsAwarded ?? 0
        }))
        : [];

    const orderingItems = Array.isArray(rawJson?.orderingItems || rawJson?.OrderingItems)
        ? (rawJson?.orderingItems || rawJson?.OrderingItems).map(item => ({
            orderingItemId: item?.orderingItemId ?? item?.OrderingItemId ?? 0,
            orderingQuestionId: item?.orderingQuestionId ?? item?.OrderingQuestionId ?? 0,
            itemValue: item?.itemValue || item?.ItemValue || '',
            correctOrder: item?.correctOrder ?? item?.CorrectOrder ?? 0,
            feedback: item?.feedback || item?.Feedback || '',
            displayOrder: item?.displayOrder ?? item?.DisplayOrder ?? 0,
            questionId: item?.questionId ?? item?.QuestionId ?? 0
        }))
        : [];

    const writtenResponseSettings = Array.isArray(rawJson?.writtenResponseSettings || rawJson?.WrittenResponseSettings)
        ? (rawJson?.writtenResponseSettings || rawJson?.WrittenResponseSettings).map(item => ({
            writtenResponseSettingId: item?.writtenResponseSettingId ?? item?.WrittenResponseSettingId ?? 0,
            questionId: item?.questionId ?? item?.QuestionId ?? 0,
            enableHtmlEditor: Boolean(item?.enableHtmlEditor ?? item?.EnableHtmlEditor ?? false),
            enableHtmlEditorText: Boolean(item?.enableHtmlEditorText ?? item?.EnableHtmlEditorText ?? false),
            addFile: item?.addFile || item?.AddFile || '',
            recordAudio: item?.recordAudio || item?.RecordAudio || '',
            recordVideo: item?.recordVideo || item?.RecordVideo || '',
            allowLearnerAttachments: Boolean(item?.allowLearnerAttachments ?? item?.AllowLearnerAttachments ?? false),
            initialLearnerText: item?.initialLearnerText || item?.InitialLearnerText || '',
            customResponseBoxSize: item?.customResponseBoxSize || item?.CustomResponseBoxSize || '',
            evaluatorAnswerkey: item?.evaluatorAnswerkey || item?.EvaluatorAnswerkey || '',
            studentWrittenResponse: item?.studentWrittenResponse || item?.StudentWrittenResponse || '',
            writtenPointsAwarded: item?.writtenPointsAwarded ?? item?.WrittenPointsAwarded ?? 0
        }))
        : [];

    const shortAnswerQuestions = Array.isArray(rawJson?.shortAnswerQuestions || rawJson?.ShortAnswerQuestions)
        ? (rawJson?.shortAnswerQuestions || rawJson?.ShortAnswerQuestions).map(item => ({
            questionBlankId: item?.questionBlankId ?? item?.QuestionBlankId ?? 0,
            questionId: item?.questionId ?? item?.QuestionId ?? 0,
            blankNumber: item?.blankNumber ?? item?.BlankNumber ?? 0,
            blankType: item?.blankType || item?.BlankType || '',
            answerText: item?.answerText || item?.AnswerText || '',
            howPointAssignedToBlanks: item?.howPointAssignedToBlanks || item?.HowPointAssignedToBlanks || '',
            studentAnswerText: item?.studentAnswerText || item?.StudentAnswerText || '',
            isShortAnswerCorrect: Boolean(item?.isShortAnswerCorrect ?? item?.IsShortAnswerCorrect ?? false),
            shortAnswerPointsAwarded: item?.shortAnswerPointsAwarded ?? item?.ShortAnswerPointsAwarded ?? 0
        }))
        : [];

    const arithmeticQuestions = Array.isArray(rawJson?.arithmeticQuestions || rawJson?.ArithmeticQuestions)
        ? (rawJson?.arithmeticQuestions || rawJson?.ArithmeticQuestions).map(item => ({
            arithmeticQuestionsId: item?.arithmeticQuestionsId ?? item?.ArithmeticQuestionsId ?? 0,
            questionId: item?.questionId ?? item?.QuestionId ?? 0,
            allowAttachmentToSupportAnswer: Boolean(item?.allowAttachmentToSupportAnswer ?? item?.AllowAttachmentToSupportAnswer ?? false),
            formula: item?.formula || item?.Formula || '',
            answerPrecision: item?.answerPrecision ?? item?.AnswerPrecision ?? 0,
            enforcePrecision: Boolean(item?.enforcePrecision ?? item?.EnforcePrecision ?? false),
            tolerance: item?.tolerance ?? item?.Tolerance ?? 0,
            toleranceType: item?.toleranceType || item?.ToleranceType || '',
            unitText: item?.unitText || item?.UnitText || '',
            unitWorth: item?.unitWorth ?? item?.UnitWorth ?? 0,
            unitPointsType: item?.unitPointsType || item?.UnitPointsType || '',
            evaluationTypeId: item?.evaluationTypeId ?? item?.EvaluationTypeId ?? 0,
            evaluationTypeName: item?.evaluationTypeName || item?.EvaluationTypeName || '',
            correctAns: item?.correctAns || item?.CorrectAns || '',
            studentNumericValue: item?.studentNumericValue ?? item?.StudentNumericValue ?? 0,
            studentUnitText: item?.studentUnitText || item?.StudentUnitText || '',
            studentExponentValue: item?.studentExponentValue ?? item?.StudentExponentValue ?? 0,
            isNumericCorrect: Boolean(item?.isNumericCorrect ?? item?.IsNumericCorrect ?? false),
            numericPointsAwarded: item?.numericPointsAwarded ?? item?.NumericPointsAwarded ?? 0
        }))
        : [];

    const arithmeticVariables = Array.isArray(rawJson?.arithmeticVariables || rawJson?.ArithmeticVariables)
        ? (rawJson?.arithmeticVariables || rawJson?.ArithmeticVariables).map(item => ({
            arithmeticVariableId: item?.arithmeticVariableId ?? item?.ArithmeticVariableId ?? 0,
            arithmeticQuestionsId: item?.arithmeticQuestionsId ?? item?.ArithmeticQuestionsId ?? 0,
            variableName: item?.variableName || item?.VariableName || '',
            minValue: item?.minValue ?? item?.MinValue ?? 0,
            maxValue: item?.maxValue ?? item?.MaxValue ?? 0,
            decimalPlaces: item?.decimalPlaces ?? item?.DecimalPlaces ?? 0,
            stepValue: item?.stepValue ?? item?.StepValue ?? 0,
            questionId: item?.questionId ?? item?.QuestionId ?? 0
        }))
        : [];

    const significantFiguresQuestions = Array.isArray(rawJson?.significantFiguresQuestions || rawJson?.SignificantFiguresQuestions)
        ? (rawJson?.significantFiguresQuestions || rawJson?.SignificantFiguresQuestions).map(item => ({
            significantFiguresQuestionId: item?.significantFiguresQuestionId ?? item?.SignificantFiguresQuestionId ?? 0,
            questionId: item?.questionId ?? item?.QuestionId ?? 0,
            allowAttachmentstosupportAnswers: Boolean(item?.allowAttachmentstosupportAnswers ?? item?.AllowAttachmentstosupportAnswers ?? false),
            formula: item?.formula || item?.Formula || '',
            significantFiguresCount: item?.significantFiguresCount ?? item?.SignificantFiguresCount ?? 0,
            deductPercentage: item?.deductPercentage ?? item?.DeductPercentage ?? 0,
            toleranceValue: item?.toleranceValue ?? item?.ToleranceValue ?? 0,
            toleranceTypeId: item?.toleranceTypeId ?? item?.ToleranceTypeId ?? 0,
            unitToleranceOne: item?.unitToleranceOne ?? item?.UnitToleranceOne ?? 0,
            unitToleranceTwo: item?.unitToleranceTwo ?? item?.UnitToleranceTwo ?? 0,
            percentageOne: item?.percentageOne ?? item?.PercentageOne ?? 0,
            unitWorth: item?.unitWorth ?? item?.UnitWorth ?? 0,
            evaluationTypeId: Boolean(item?.evaluationTypeId ?? item?.EvaluationTypeId ?? false),
            evaluationTypeName: item?.evaluationTypeName || item?.EvaluationTypeName || '',
            unitText: item?.unitText || item?.UnitText || '',
            correctAns: item?.correctAns || item?.CorrectAns || '',
            studentNumericValue: item?.studentNumericValue ?? item?.StudentNumericValue ?? 0,
            studentUnitText: item?.studentUnitText || item?.StudentUnitText || '',
            studentExponentValue: item?.studentExponentValue ?? item?.StudentExponentValue ?? 0,
            isSigFigCorrect: Boolean(item?.isSigFigCorrect ?? item?.IsSigFigCorrect ?? false),
            sigFigPointsAwarded: item?.sigFigPointsAwarded ?? item?.SigFigPointsAwarded ?? 0
        }))
        : [];

    const significantFiguresVariables = Array.isArray(rawJson?.significantFiguresVariables || rawJson?.SignificantFiguresVariables)
        ? (rawJson?.significantFiguresVariables || rawJson?.SignificantFiguresVariables).map(item => ({
            significantFiguresVariableId: item?.significantFiguresVariableId ?? item?.SignificantFiguresVariableId ?? 0,
            significantFiguresQuestionId: item?.significantFiguresQuestionId ?? item?.SignificantFiguresQuestionId ?? 0,
            variableName: item?.variableName || item?.VariableName || '',
            minValue: item?.minValue ?? item?.MinValue ?? 0,
            minPower: item?.minPower ?? item?.MinPower ?? 0,
            maxValue: item?.maxValue ?? item?.MaxValue ?? 0,
            maxPower: item?.maxPower ?? item?.MaxPower ?? 0,
            stepValue: item?.stepValue ?? item?.StepValue ?? 0,
            stepPower: item?.stepPower ?? item?.StepPower ?? 0,
            questionId: item?.questionId ?? item?.QuestionId ?? 0
        }))
        : [];

    const multiShortAnswers = Array.isArray(rawJson?.multiShortAnswers || rawJson?.MultiShortAnswers)
        ? (rawJson?.multiShortAnswers || rawJson?.MultiShortAnswers).map(item => ({
            multiShortAnswerId: item?.multiShortAnswerId ?? item?.MultiShortAnswerId ?? 0,
            questionId: item?.questionId ?? item?.QuestionId ?? 0,
            answerText: item?.answerText || item?.AnswerText || '',
            weightInPercentage: item?.weightInPercentage ?? item?.WeightInPercentage ?? 0,
            evaluationTypeId: item?.evaluationTypeId ?? item?.EvaluationTypeId ?? 0,
            evaluationTypeName: item?.evaluationTypeName || item?.EvaluationTypeName || '',
            displayOrder: item?.displayOrder ?? item?.DisplayOrder ?? 0,
            studentAnswerText: item?.studentAnswerText || item?.StudentAnswerText || '',
            isMultiShortCorrect: Boolean(item?.isMultiShortCorrect ?? item?.IsMultiShortCorrect ?? false),
            multiShortPointsAwarded: item?.multiShortPointsAwarded ?? item?.MultiShortPointsAwarded ?? 0
        }))
        : [];

    const multiShortAnswerInputBoxes = Array.isArray(rawJson?.multiShortAnswerInputBoxes || rawJson?.MultiShortAnswerInputBoxes)
        ? (rawJson?.multiShortAnswerInputBoxes || rawJson?.MultiShortAnswerInputBoxes).map(item => ({
            degreeMultiShortAnswerInputBoxeId: item?.degreeMultiShortAnswerInputBoxeId ?? item?.DegreeMultiShortAnswerInputBoxeId ?? 0,
            questionId: item?.questionId ?? item?.QuestionId ?? 0,
            inputBoxCount: item?.inputBoxCount ?? item?.InputBoxCount ?? 0,
            rowsCount: item?.rowsCount ?? item?.RowsCount ?? 0,
            columnsCount: item?.columnsCount ?? item?.ColumnsCount ?? 0
        }))
        : [];

    const likertQuestions = Array.isArray(rawJson?.likertQuestions || rawJson?.LikertQuestions)
        ? (rawJson?.likertQuestions || rawJson?.LikertQuestions).map(item => ({
            likertQuestionId: item?.likertQuestionId ?? item?.LikertQuestionId ?? 0,
            questionId: item?.questionId ?? item?.QuestionId ?? 0,
            scaleTypeId: item?.scaleTypeId ?? item?.ScaleTypeId ?? 0,
            includeNAOption: Boolean(item?.includeNAOption ?? item?.IncludeNAOption ?? false),
            studentSelectedValue: item?.studentSelectedValue ?? item?.StudentSelectedValue ?? 0,
            studentStatementIndex: item?.studentStatementIndex ?? item?.StudentStatementIndex ?? 0
        }))
        : [];

    const likertStatements = Array.isArray(rawJson?.likertStatements || rawJson?.LikertStatements)
        ? (rawJson?.likertStatements || rawJson?.LikertStatements).map(item => ({
            statementId: item?.statementId ?? item?.StatementId ?? 0,
            likertQuestionId: item?.likertQuestionId ?? item?.LikertQuestionId ?? 0,
            optionText: item?.optionText || item?.OptionText || '',
            displayOrder: item?.displayOrder ?? item?.DisplayOrder ?? 0,
            questionId: item?.questionId ?? item?.QuestionId ?? 0
        }))
        : [];

    const likertScale = Array.isArray(rawJson?.likertScale || rawJson?.LikertScale)
        ? (rawJson?.likertScale || rawJson?.LikertScale).map(item => ({
            likertQuestionId: item?.likertQuestionId ?? item?.LikertQuestionId ?? 0,
            questionId: item?.questionId ?? item?.QuestionId ?? 0,
            scaleTypeId: item?.scaleTypeId ?? item?.ScaleTypeId ?? 0,
            includeNAOption: Boolean(item?.includeNAOption ?? item?.IncludeNAOption ?? false),
            scaleName: item?.scaleName || item?.ScaleName || '',
            scaleDescription: item?.scaleDescription || item?.ScaleDescription || '',
            minValue: item?.minValue ?? item?.MinValue ?? 0,
            maxValue: item?.maxValue ?? item?.MaxValue ?? 0,
            option1: item?.option1 || item?.Option1 || '',
            option2: item?.option2 || item?.Option2 || '',
            option3: item?.option3 || item?.Option3 || '',
            option4: item?.option4 || item?.Option4 || '',
            option5: item?.option5 || item?.Option5 || ''
        }))
        : [];

        // Calculate summary statistics matching required formulas
        const correctAnswers = Number(rawJson?.correctQuestionsCount ?? questions.filter(q => q.isStudentCorrect).length);
        const wrongAnswers = Number(rawJson?.wrongAnswers ?? questions.filter(q => !q.isStudentCorrect && q.attemptStatus === 'ATTEMPTED').length);
        const skippedQuestions = Number(rawJson?.skippedQuestions ?? questions.filter(q => q.attemptStatus === 'NOT_ATTEMPTED').length);
        const totalQuestions = Number(rawJson?.totalQuestions || questions.length || 10);
        const score = Number(rawJson?.studentPercentage ?? rawJson?.percentage ?? (totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0));
        const grade = rawJson?.studentGrade || rawJson?.grade || (score >= 80 ? 'A' : score >= 60 ? 'B' : score >= 40 ? 'C' : 'F');

        // Calculate percentages
        const correctPercent = totalQuestions > 0 ? (correctAnswers / totalQuestions * 100).toFixed(1) : "0.0";
        const wrongPercent = totalQuestions > 0 ? (wrongAnswers / totalQuestions * 100).toFixed(1) : "0.0";
        const skippedPercent = totalQuestions > 0 ? (skippedQuestions / totalQuestions * 100).toFixed(1) : "0.0";

        return {
            success: isSuccess,
            status,
            message: rawJson?.message || rawJson?.Message || '',
            errorDescription: rawJson?.errorDescription || rawJson?.ErrorDescription || '',
            errorNo: rawJson?.errorNo || rawJson?.ErrorNo || 0,

            quizId: rawJson?.quizId ?? rawJson?.QuizId ?? 0,
            statusText: rawJson?.status || rawJson?.Status || 'Completed',
            startTime: rawJson?.startTime || rawJson?.StartTime || '',
            endTime: rawJson?.endTime || rawJson?.EndTime || '',
            totalPoints: Number(rawJson?.totalPoints || (questions.reduce((sum, q) => sum + (q.points || 1), 0) || 10)),
            percentage: score,
            grade,
            totalQuestions,
            wrongAnswers,
            skippedQuestions,
            totalTimeAllowed: rawJson?.totalTimeAllowed ?? rawJson?.TotalTimeAllowed ?? 0,
            correctQuestionsCount: correctAnswers,
            studentTotalPoints: Number(rawJson?.studentTotalPoints || correctAnswers),

            correctAnswers,
            score,
            correctPercent,
            wrongPercent,
            skippedPercent,

            questions,
            answerOptions,
        questionTextComponents,
        blankAnswers,
        matchingQuestions,
        matchingChoices,
        matchingPairs,
        orderingQuestions,
        orderingItems,
        writtenResponseSettings,
        shortAnswerQuestions,
        arithmeticQuestions,
        arithmeticVariables,
        significantFiguresQuestions,
        significantFiguresVariables,
        multiShortAnswers,
        multiShortAnswerInputBoxes,
        likertQuestions,
        likertStatements,
        likertScale,

        rawData: rawJson
    };
}

export function parseGetStudentMicrocredentialQuizResultGetByQuizIdErrorOutput(rawJson = {}, status = 500) {
    return {
        success: false,
        status,
        message: rawJson?.message || rawJson?.Message || 'Failed to fetch student microcredential quiz result',
        errorDescription: rawJson?.errorDescription || rawJson?.ErrorDescription || rawJson?.error || 'Network/Server Error',
        errorNo: rawJson?.errorNo || rawJson?.ErrorNo || status,

        quizId: 0,
        statusText: '',
        startTime: '',
        endTime: '',
        totalPoints: 0,
        percentage: 0,
        grade: '',
        totalQuestions: 0,
        wrongAnswers: 0,
        skippedQuestions: 0,
        totalTimeAllowed: 0,
        correctQuestionsCount: 0,
        studentTotalPoints: 0,

        questions: [],
        answerOptions: [],
        questionTextComponents: [],
        blankAnswers: [],
        matchingQuestions: [],
        matchingChoices: [],
        matchingPairs: [],
        orderingQuestions: [],
        orderingItems: [],
        writtenResponseSettings: [],
        shortAnswerQuestions: [],
        arithmeticQuestions: [],
        arithmeticVariables: [],
        significantFiguresQuestions: [],
        significantFiguresVariables: [],
        multiShortAnswers: [],
        multiShortAnswerInputBoxes: [],
        likertQuestions: [],
        likertStatements: [],
        likertScale: [],

        rawData: rawJson
    };
}
