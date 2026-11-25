import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import {
  HelpCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  ArrowRight,
  ArrowLeft,
  X,
  PlusCircle,
  Award,
} from 'lucide-react'

export default function Quizzes() {
  const { role } = useAuth()
  const [batches, setBatches] = useState([])
  const [selectedBatchId, setSelectedBatchId] = useState(1)
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)

  // Active Quiz State
  const [activeQuizSession, setActiveQuizSession] = useState(null)
  const [currentQIndex, setCurrentQIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState({}) // { question_id: option_id }
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(0)
  const [quizResult, setQuizResult] = useState(null)
  const [submittingAttempt, setSubmittingAttempt] = useState(false)

  // Create Quiz Modal
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [title, setTitle] = useState('')
  const [durationMins, setDurationMins] = useState(20)
  const [totalMarks, setTotalMarks] = useState(20)
  const [passingMarks, setPassingMarks] = useState(12)

  const fetchBatches = () => {
    api.get('/batches').then((res) => {
      setBatches(res.data)
      if (res.data.length > 0 && !selectedBatchId) {
        setSelectedBatchId(res.data[0].id)
      }
    })
  }

  const fetchQuizzes = () => {
    if (!selectedBatchId) return
    api
      .get(`/quizzes?batch_id=${selectedBatchId}`)
      .then((res) => setQuizzes(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchBatches()
  }, [])

  useEffect(() => {
    if (selectedBatchId) {
      fetchQuizzes()
    }
  }, [selectedBatchId])

  // Countdown timer effect
  useEffect(() => {
    if (!activeQuizSession || timeLeftSeconds <= 0) return

    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleAutoSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [activeQuizSession, timeLeftSeconds])

  const startQuiz = async (quizId) => {
    try {
      const res = await api.post(`/quizzes/${quizId}/start`)
      setActiveQuizSession(res.data)
      setCurrentQIndex(0)
      setSelectedAnswers({})
      setQuizResult(null)
      setTimeLeftSeconds(res.data.duration_mins * 60)
    } catch (err) {
      alert(err.response?.data?.detail || 'Could not start quiz.')
    }
  }

  const handleSelectOption = (questionId, optionId) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }))
  }

  const handleAutoSubmit = () => {
    submitAttempt()
  }

  const submitAttempt = async () => {
    if (!activeQuizSession || submittingAttempt) return
    setSubmittingAttempt(true)

    const payloadAnswers = activeQuizSession.questions.map((q) => ({
      question_id: q.id,
      selected_option_id: selectedAnswers[q.id] || null,
    }))

    try {
      const res = await api.post(`/quizzes/${activeQuizSession.quiz_id}/submit`, {
        attempt_id: activeQuizSession.attempt_id,
        answers: payloadAnswers,
      })
      setQuizResult(res.data)
      setActiveQuizSession(null)
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to submit quiz.')
    } finally {
      setSubmittingAttempt(false)
    }
  }

  // Timer format: MM:SS
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // Active Examination View
  if (activeQuizSession) {
    const questions = activeQuizSession.questions
    const currentQ = questions[currentQIndex]

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Sticky Header with Timer */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center justify-between sticky top-4 z-40">
          <div>
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
              Examination Session Active
            </span>
            <h2 className="text-base font-bold text-slate-900">{activeQuizSession.title}</h2>
          </div>

          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-mono text-sm font-bold border ${
              timeLeftSeconds < 180
                ? 'bg-red-50 text-red-600 border-red-200 animate-pulse'
                : 'bg-indigo-50 text-indigo-700 border-indigo-200'
            }`}
          >
            <Clock size={16} />
            <span>{formatTime(timeLeftSeconds)}</span>
          </div>
        </div>

        {/* Question Panel */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <span className="text-xs font-semibold text-slate-400">
              Question {currentQIndex + 1} of {questions.length}
            </span>
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg">
              {currentQ.marks} Marks
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-semibold text-slate-900 leading-snug">
            {currentQ.question_text}
          </h3>

          {/* Options */}
          <div className="space-y-3 pt-2">
            {currentQ.options?.map((opt) => {
              const isSelected = selectedAnswers[currentQ.id] === opt.id
              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption(currentQ.id, opt.id)}
                  className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm font-medium transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/60 text-indigo-900 font-semibold shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                  }`}
                >
                  <span>{opt.option_text}</span>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : 'border-slate-300'
                    }`}
                  >
                    {isSelected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-6">
            <button
              onClick={() => setCurrentQIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentQIndex === 0}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-40"
            >
              <ArrowLeft size={15} /> Previous
            </button>

            {currentQIndex < questions.length - 1 ? (
              <button
                onClick={() => setCurrentQIndex((prev) => prev + 1)}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
              >
                Next <ArrowRight size={15} />
              </button>
            ) : (
              <button
                onClick={submitAttempt}
                disabled={submittingAttempt}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2"
              >
                <CheckCircle2 size={16} />
                {submittingAttempt ? 'Submitting...' : 'Submit Final Attempt'}
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Timed MCQ Assessments</h1>
          <p className="text-sm text-slate-500">Structured comprehension evaluations with server-side validation.</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedBatchId}
            onChange={(e) => setSelectedBatchId(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium"
          >
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.batch_code}: {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Result Card if just submitted */}
      {quizResult && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm max-w-xl mx-auto text-center space-y-4 animate-in fade-in zoom-in-95">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto text-white ${
              quizResult.is_passed ? 'bg-emerald-500' : 'bg-red-500'
            }`}
          >
            {quizResult.is_passed ? <Award size={32} /> : <AlertTriangle size={32} />}
          </div>

          <h2 className="text-2xl font-bold text-slate-900">
            {quizResult.is_passed ? 'Assessment Passed!' : 'Assessment Not Cleared'}
          </h2>

          <div className="text-4xl font-extrabold text-slate-900 font-mono">
            {parseFloat(quizResult.score)} / {quizResult.total_marks}
          </div>

          <p className="text-xs text-slate-500">
            Passing threshold: {quizResult.passing_marks} marks · Evaluated by server
          </p>

          <button
            onClick={() => setQuizResult(null)}
            className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700"
          >
            Done
          </button>
        </div>
      )}

      {/* Quizzes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-2 flex items-center justify-center min-h-[300px]">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="col-span-2 bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
            No quizzes available for this cohort batch.
          </div>
        ) : (
          quizzes.map((q) => (
            <div
              key={q.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-6 hover:border-indigo-300 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                    {q.questions_count || 2} Multiple Choice Questions
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock size={13} />
                    <span>{q.duration_mins} Minutes</span>
                  </div>
                </div>

                <h3 className="font-bold text-slate-900 text-base">{q.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2">
                  {q.description || 'Timed multiple-choice evaluation testing module mastery.'}
                </p>

                <div className="flex items-center gap-4 text-xs text-slate-600 pt-1">
                  <span>Passing Score: <b>{q.passing_marks}</b> / {q.total_marks}</span>
                </div>
              </div>

              {role === 'student' && (
                <button
                  onClick={() => startQuiz(q.id)}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <Play size={14} />
                  <span>Start Timed Attempt</span>
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
