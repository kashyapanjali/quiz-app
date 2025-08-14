import React, { useState, useEffect } from "react";
import "./QuizSystem.css";
import {
	ChevronRight,
	Clock,
	Trophy,
	RotateCcw,
	CheckCircle,
	XCircle,
	Star,
} from "lucide-react";

function QuizSystem() {
	const [questions, setQuestions] = useState([]);
	const [currentQuestion, setCurrentQuestion] = useState(0);
	const [selectedAnswer, setSelectedAnswer] = useState("");
	const [score, setScore] = useState(0);
	const [showResult, setShowResult] = useState(false);
	const [timeLeft, setTimeLeft] = useState(30);
	const [isActive, setIsActive] = useState(false);
	const [selectedAnswers, setSelectedAnswers] = useState({}); // index -> answer
	const [quizStarted, setQuizStarted] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		let interval = null;
		if (isActive && timeLeft > 0) {
			interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
		} else if (timeLeft === 0 && isActive) {
			// Move to next question on timer end
			handleNextQuestion();
		}
		return () => clearInterval(interval);
	}, [isActive, timeLeft]); // eslint-disable-line

	const loadQuestions = async () => {
		setLoading(true);
		setError("");
		try {
			const res = await fetch("https://opentdb.com/api.php?amount=15");
			const data = await res.json();
			if (data.response_code === 0 && data.results) {
				const processed = data.results.map((q) => ({
					...q,
					question: decodeHTMLEntities(q.question),
					correct_answer: decodeHTMLEntities(q.correct_answer),
					incorrect_answers: q.incorrect_answers.map((a) =>
						decodeHTMLEntities(a)
					),
					all_answers: shuffleArray([
						decodeHTMLEntities(q.correct_answer),
						...q.incorrect_answers.map((a) => decodeHTMLEntities(a)),
					]),
				}));
				setQuestions(processed);
				setCurrentQuestion(0);
				setSelectedAnswer("");
				setSelectedAnswers({});
				setTimeLeft(30);
				setIsActive(true);
			} else {
				setError("Failed to load questions. Please try again.");
			}
		} catch (err) {
			console.error(err);
			setError("Network error. Please check your connection and try again.");
		}
		setLoading(false);
	};

	const decodeHTMLEntities = (text) => {
		const ta = document.createElement("textarea");
		ta.innerHTML = text;
		return ta.value;
	};

	const shuffleArray = (arr) => {
		const a = [...arr];
		for (let i = a.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[a[i], a[j]] = [a[j], a[i]];
		}
		return a;
	};

	const startQuiz = () => {
		setQuizStarted(true);
		setTimeLeft(30);
		loadQuestions();
	};

	const handleAnswerSelect = (answer) => {
		setSelectedAnswer(answer);
		setSelectedAnswers((prev) => ({
			...prev,
			[currentQuestion]: answer,
		}));
	};

	const handleNextQuestion = () => {
		if (!questions.length) return;

		// Save current selection (if any) - already saved on select, but ensure it's recorded
		if (selectedAnswer) {
			setSelectedAnswers((prev) => ({
				...prev,
				[currentQuestion]: selectedAnswer,
			}));
		}

		const nextIndex = currentQuestion + 1;
		if (nextIndex < questions.length) {
			setCurrentQuestion(nextIndex);
			// restore any previously selected answer for the new current question
			setSelectedAnswer(selectedAnswers[nextIndex] || "");
			setTimeLeft(30);
			setIsActive(true);
		} else {
			// compute final score from selectedAnswers
			let computedScore = 0;
			for (let i = 0; i < questions.length; i++) {
				const ans =
					selectedAnswers[i] ??
					(i === currentQuestion ? selectedAnswer : undefined);
				if (ans === questions[i].correct_answer) computedScore++;
			}
			setScore(computedScore);
			setShowResult(true);
			setIsActive(false);
		}
	};

	const jumpToQuestion = (index) => {
		if (!questions.length) return;
		setCurrentQuestion(index);
		// restore any previously selected answer for that question
		setSelectedAnswer(selectedAnswers[index] || "");
		// reset timer for the jumped question
		setTimeLeft(30);
		setIsActive(true);
	};

	const resetQuiz = () => {
		setCurrentQuestion(0);
		setSelectedAnswer("");
		setScore(0);
		setShowResult(false);
		setTimeLeft(30);
		setIsActive(false);
		setSelectedAnswers({});
		setQuizStarted(false);
		setQuestions([]);
		setError("");
	};

	const getDifficultyClass = (d) => {
		switch (d) {
			case "easy":
				return "badge easy";
			case "medium":
				return "badge medium";
			case "hard":
				return "badge hard";
			default:
				return "badge default";
		}
	};

	const getScoreMessage = () => {
		const percentage = questions.length ? (score / questions.length) * 100 : 0;
		if (percentage >= 80)
			return { message: "Excellent! 🎉", color: "color-green" };
		if (percentage >= 60)
			return { message: "Good job! 👍", color: "color-blue" };
		if (percentage >= 40)
			return { message: "Not bad! 👌", color: "color-yellow" };
		return { message: "Keep practicing! 💪", color: "color-red" };
	};

	if (!quizStarted) {
		return (
			<div className='app-root'>
				<div className='card card-center'>
					<div style={{ marginBottom: "1.25rem" }}>
						<div
							className='logo-circle'
							style={{ marginBottom: "1rem" }}>
							<Trophy style={{ width: 40, height: 40 }} />
						</div>
						<h1 className='title'>Quiz Challenge</h1>
						<p className='subtitle'>
							Test your knowledge across various topics!
						</p>
					</div>

					<div
						style={{
							display: "flex",
							flexDirection: "column",
							gap: 8,
							marginBottom: 16,
						}}>
						<div className='info-row'>
							<Star style={{ width: 18, height: 18 }} />
							<span>Multiple choice questions</span>
						</div>
						<div className='info-row'>
							<Clock style={{ width: 18, height: 18 }} />
							<span>30 seconds per question</span>
						</div>
						<div className='info-row'>
							<Trophy style={{ width: 18, height: 18 }} />
							<span>Track your progress</span>
						</div>
					</div>

					<button
						onClick={startQuiz}
						disabled={loading}
						className={`btn btn-primary ${loading ? "btn-disabled" : ""}`}>
						{loading ? "Loading Questions..." : "Start Quiz"}
					</button>

					{error && <div className='alert-error'>{error}</div>}
				</div>
			</div>
		);
	}

	if (showResult) {
		const { message } = getScoreMessage();
		return (
			<div className='app-root'>
				<div className='card'>
					<div className='result-title'>
						<div
							className='logo-circle'
							style={{ width: 96, height: 96 }}>
							<Trophy style={{ width: 48, height: 48, color: "#fff" }} />
						</div>
						<h2
							style={{
								fontSize: "2rem",
								fontWeight: 700,
								marginTop: "0.5rem",
							}}>
							Quiz Complete!
						</h2>
						<p style={{ fontSize: "1.25rem", fontWeight: 600 }}>{message}</p>
					</div>

					<div className='result-stats'>
						<div style={{ display: "flex", justifyContent: "space-around" }}>
							<div className='stat-column'>
								<div
									className='stat-value'
									style={{ color: "var(--purple-500)" }}>
									{score}
								</div>
								<div className='stat-label'>Correct</div>
							</div>
							<div className='stat-column'>
								<div
									className='stat-value'
									style={{ color: "#6b7280" }}>
									{questions.length - score}
								</div>
								<div className='stat-label'>Wrong</div>
							</div>
							<div className='stat-column'>
								<div
									className='stat-value'
									style={{ color: "var(--blue-600)" }}>
									{Math.round((score / questions.length) * 100)}%
								</div>
								<div className='stat-label'>Score</div>
							</div>
						</div>
					</div>

					<div
						className='review-list'
						style={{ marginBottom: 16 }}>
						<h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
							Review Answers:
						</h3>
						<div>
							{questions.map((q, idx) => {
								const userAns = selectedAnswers[idx];
								const isCorrect = userAns === q.correct_answer;
								return (
									<div
										key={idx}
										className='review-item'>
										{isCorrect ?
											<CheckCircle
												style={{
													width: 18,
													height: 18,
													color: "#16a34a",
													marginTop: 2,
												}}
											/>
										:	<XCircle
												style={{
													width: 18,
													height: 18,
													color: "#ef4444",
													marginTop: 2,
												}}
											/>
										}
										<div style={{ flex: 1 }}>
											<p className='question'>{q.question}</p>
											<p
												className='answer-line'
												style={{ marginBottom: 4 }}>
												Your answer:{" "}
												<span
													style={{ color: isCorrect ? "#16a34a" : "#ef4444" }}>
													{userAns || "No answer"}
												</span>
											</p>
											{!isCorrect && (
												<p style={{ color: "#16a34a" }}>
													Correct answer: {q.correct_answer}
												</p>
											)}
										</div>
									</div>
								);
							})}
						</div>
					</div>

					<button
						onClick={resetQuiz}
						className='btn btn-primary'
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							gap: 8,
						}}>
						<RotateCcw style={{ width: 16, height: 16 }} />
						<span>Take Quiz Again</span>
					</button>
				</div>
			</div>
		);
	}

	if (!questions.length && !error) {
		return (
			<div className='app-root'>
				<div className='card card-center'>
					<div
						style={{ fontSize: "1.125rem", color: "#111827", marginBottom: 6 }}>
						Loading questions...
					</div>
					<div style={{ color: "#6b7280" }}>Fetching trivia from OpenTDB</div>
				</div>
			</div>
		);
	}

	const currentQ = questions[currentQuestion];
	const progressWidth =
		questions.length ? (currentQuestion / questions.length) * 100 : 0;

	return (
		<div className='app-root'>
			<div style={{ maxWidth: 1024, width: "100%" }}>
				<div
					className='card'
					style={{ marginBottom: 16 }}>
					<div className='quiz-header'>
						<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
							<span style={{ fontSize: 14, color: "#4b5563" }}>
								Question {currentQuestion + 1} of {questions.length}
							</span>
							<span
								className={getDifficultyClass(currentQ.difficulty)}
								style={{ textTransform: "uppercase", fontSize: 12 }}>
								{currentQ.difficulty}
							</span>
						</div>
						<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
							<Clock style={{ width: 18, height: 18, color: "#6b7280" }} />
							<span
								style={{
									fontSize: "1.125rem",
									fontWeight: 700,
									color: timeLeft <= 10 ? "#ef4444" : "#374151",
								}}>
								{timeLeft}s
							</span>
						</div>
					</div>

					<div
						className='progress-track'
						style={{ marginBottom: 12 }}>
						<div
							className='progress-fill'
							style={{ width: `${progressWidth}%` }}
						/>
					</div>

					<div className='q-meta'>{currentQ.category}</div>
					<h2 className='q-title'>{currentQ.question}</h2>

					{/* QUESTION NAVIGATION */}
					<div
						className='question-nav'
						style={{ margin: "12px 0 8px" }}>
						{questions.map((_, idx) => (
							<button
								key={idx}
								className={`nav-btn ${idx === currentQuestion ? "active" : ""} ${
									selectedAnswers[idx] ? "answered" : ""
								}`}
								onClick={() => jumpToQuestion(idx)}
								type='button'
								title={`Go to question ${idx + 1}`}>
								{idx + 1}
							</button>
						))}
					</div>
				</div>

				<div
					className='answers-grid'
					style={{ marginBottom: 16 }}>
					{currentQ.all_answers.map((answer, i) => {
						const isSelected = selectedAnswer === answer;
						return (
							<button
								key={i}
								onClick={() => handleAnswerSelect(answer)}
								className={`answer ${isSelected ? "answer-selected" : ""}`}
								type='button'>
								<div className='letter'>{String.fromCharCode(65 + i)}</div>
								<div style={{ flex: 1, fontSize: 16 }}>{answer}</div>
							</button>
						);
					})}
				</div>

				<div
					className='next-row'
					style={{ marginBottom: 20 }}>
					<button
						onClick={handleNextQuestion}
						disabled={!selectedAnswer && !selectedAnswers[currentQuestion]}
						className={`btn btn-primary ${
							!selectedAnswer && !selectedAnswers[currentQuestion] ?
								"btn-disabled"
							:	""
						}`}
						style={{
							padding: "0.75rem 1.25rem",
							borderRadius: 12,
							fontSize: 16,
						}}>
						<span>
							{currentQuestion + 1 === questions.length ?
								"Finish Quiz"
							:	"Next Question"}
						</span>
						<ChevronRight style={{ width: 18, height: 18 }} />
					</button>
				</div>

				<div className='fixed-score'>
					<Trophy
						style={{ width: 18, height: 18, color: "var(--purple-500)" }}
					/>
					<span style={{ fontWeight: 600 }}>
						{Object.values(selectedAnswers).filter(Boolean).length}/
						{questions.length}
					</span>
				</div>
			</div>
		</div>
	);
}

export default QuizSystem;
