import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  KeyRound,
  Link2,
  MailWarning,
  RotateCcw,
  ShieldCheck,
  XCircle,
} from 'lucide-react'
import './App.css'

type Screen =
  | 'welcome'
  | 'home'
  | 'lessons'
  | 'lesson'
  | 'scenario'
  | 'assessment'
  | 'quiz'
  | 'recommendations'
  | 'resources'
  | 'resourceDetail'

type ResourceKind = 'guides' | 'media' | 'glossary' | 'faq' | 'support'
type QuizOption = { text: string; feedback: string; correct?: boolean }
type QuizQuestion = { question: string; options: QuizOption[] }
type LessonPhase = 'intro' | 'content'
type StoredProgress = {
  version: 1
  screen: Screen
  lessonIndex: number
  lessonPhase: LessonPhase
  completedLessons: boolean[]
  scenarioAnswer: number | null
  quizStep: number
  quizAnswers: (number | null)[]
  resourceKind: ResourceKind
}

const STORAGE_KEY = 'digital-security-progress-v1'
const screens: Screen[] = ['welcome', 'home', 'lessons', 'lesson', 'scenario', 'assessment', 'quiz', 'recommendations', 'resources', 'resourceDetail']
const resourceKinds: ResourceKind[] = ['guides', 'media', 'glossary', 'faq', 'support']

function loadProgress(): StoredProgress | null {
  try {
    const saved: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || 'null')
    if (!saved || typeof saved !== 'object') return null
    const progress = saved as Partial<StoredProgress>
    if (
      progress.version !== 1 ||
      !progress.screen || !screens.includes(progress.screen) ||
      typeof progress.lessonIndex !== 'number' || !Number.isInteger(progress.lessonIndex) || progress.lessonIndex < 0 || progress.lessonIndex > 3 ||
      (progress.lessonPhase !== 'intro' && progress.lessonPhase !== 'content') ||
      !Array.isArray(progress.completedLessons) || progress.completedLessons.length !== 4 || progress.completedLessons.some(value => typeof value !== 'boolean') ||
      (progress.scenarioAnswer !== null && (typeof progress.scenarioAnswer !== 'number' || !Number.isInteger(progress.scenarioAnswer) || progress.scenarioAnswer < 0 || progress.scenarioAnswer > 2)) ||
      typeof progress.quizStep !== 'number' || !Number.isInteger(progress.quizStep) || progress.quizStep < 0 || progress.quizStep > 4 ||
      !Array.isArray(progress.quizAnswers) || progress.quizAnswers.length !== 4 ||
      progress.quizAnswers.some((answer, index) => answer !== null && (typeof answer !== 'number' || !Number.isInteger(answer) || answer < 0 || answer >= quizQuestions[index].options.length)) ||
      !progress.resourceKind || !resourceKinds.includes(progress.resourceKind)
    ) return null
    return progress as StoredProgress
  } catch {
    return null
  }
}

const lessons = [
  {
    code: '01 D1',
    title: 'Digital-security foundations',
    heading: 'Lesson 01',
    intro: 'Learn to create stronger passwords and protect your accounts.',
  },
  {
    code: '01 D2',
    title: 'Privacy and data protection',
    heading: 'Lesson 02',
    intro: 'Learn to protect personal information and configure privacy safely.',
  },
  {
    code: '01 D3',
    title: 'Threats and how to identify them',
    heading: 'Lesson 03',
    intro: 'Learn to recognize phishing and suspicious messages before you act.',
  },
  {
    code: '01 D4',
    title: 'Everyday good practices',
    heading: 'Lesson 04',
    intro: 'Apply simple habits to protect your accounts every day.',
  },
]

const quizQuestions: QuizQuestion[] = [
  {
    question: 'Which option is the best foundation for a safer password?',
    options: [
      { text: 'Maria2008!', feedback: 'This uses a name and a year, so it is predictable. Choose a long, unique passphrase without obvious personal details.' },
      { text: 'MyCowIsHappyToday', correct: true, feedback: 'Correct. This longer passphrase avoids obvious personal details and is easier to remember than a short, complex string.' },
      { text: 'Campus123', feedback: 'This short, predictable pattern is easy to guess. Length and uniqueness provide better protection.' },
    ],
  },
  {
    question: 'A message requests your MFA code. What should you do?',
    options: [
      { text: 'Send only the code, not the password.', feedback: 'An MFA code is also a credential. Never share it through a message, even if you withhold your password.' },
      { text: 'Verify through the official app and report the message.', correct: true, feedback: 'Correct. An official app or a known web address gives you an independent, safer way to check the request.' },
      { text: 'Click the link if the university logo looks real.', feedback: 'Logos can be copied. Check the sender and destination, and verify through an official channel instead.' },
    ],
  },
  {
    question: 'Which habit best protects your personal information?',
    options: [
      { text: 'Reuse one password so you have fewer details to manage.', feedback: 'Reusing a password can expose several accounts after one breach. Use a unique password for every account.' },
      { text: 'Share only what is needed and review privacy settings.', correct: true, feedback: 'Correct. Limiting what you share and reviewing settings reduces unnecessary exposure of your personal information.' },
      { text: 'Post your student ID to prove that you belong to the university.', feedback: 'Your student ID can be misused. Do not publish identity documents or account details in public spaces.' },
    ],
  },
  {
    question: 'You suspect your account was compromised. What is the best first response?',
    options: [
      { text: 'Wait several days to see whether anything else happens.', feedback: 'Waiting can give an attacker more time. Act promptly to secure the account and limit further access.' },
      { text: 'Post your login details publicly and ask others to test them.', feedback: 'Sharing credentials creates more risk. Keep them private and use the service’s official recovery process.' },
      { text: 'Change the password and follow the service’s recovery instructions.', correct: true, feedback: 'Correct. Change the password, review account activity, and follow the official recovery instructions promptly.' },
    ],
  },
]

const scenarioOptions: QuizOption[] = [
  { text: 'Use the link and sign in quickly before the account is suspended.', feedback: 'That could expose your credentials. The sender and web address are not official, and the deadline is a pressure tactic.' },
  { text: 'Reply with your password, but do not include the MFA code.', feedback: 'Never send your password by message. Legitimate support staff will not ask you to disclose your credentials this way.' },
  { text: 'Avoid the link. Open the official university app or type its known address, then report the message.', correct: true, feedback: 'Correct. You avoided the suspicious link and chose an independent way to verify the request before taking action.' },
]

const clueContent = {
  sender: { title: 'Sender address', text: 'The display name says “UNAD Campus Support,” but the address ends in campus-account-verify.com, not an official university domain.' },
  tone: { title: 'Urgent tone', text: 'The 30-minute threat is designed to make you act before you stop and verify.' },
  link: { title: 'Link destination', text: 'The address imitates a university service. Use a known official address instead.' },
}
type ClueId = keyof typeof clueContent

function BrandLogo({ small = false }: { small?: boolean }) {
  return (
    <svg className={small ? 'brand-logo brand-logo--small' : 'brand-logo'} viewBox="0 0 48 48" role="img" aria-label="Digital Security">
      <rect x="1" y="1" width="46" height="46" fill="#09649c" />
      <circle cx="24" cy="24" r="17" fill="#65ad45" />
      <path d="m15 24 6 6 12-14" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg className="user-icon" viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="24" cy="24" r="21" fill="#fff" stroke="#1e2f46" strokeWidth="2" />
      <circle cx="24" cy="18" r="7" fill="#1e2f46" />
      <path d="M10 40c1.8-9 7-13 14-13s12.2 4 14 13" fill="#1e2f46" />
    </svg>
  )
}

function StatIcon({ type }: { type: 'time' | 'sections' | 'questions' }) {
  return (
    <svg className="stat-icon" viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="27" fill="none" stroke="#1e2f46" strokeWidth="1.4" />
      {type === 'time' && <><path d="M32 17v16l10 6M32 5v5M32 54v5M5 32h5M54 32h5M13 13l4 4M47 47l4 4M51 13l-4 4M17 47l-4 4" fill="none" stroke="#1e2f46" strokeWidth="1.4" /></>}
      {type === 'sections' && <><path d="M32 5v54M5 32h54M13 13l38 38M51 13 13 51" fill="none" stroke="#1e2f46" strokeWidth="1.4" /></>}
      {type === 'questions' && <><path d="M22 22h20v20H22z" fill="none" stroke="#1e2f46" strokeWidth="1.2" strokeDasharray="2 2" /><path d="m18 34 9 9 20-25" fill="none" stroke="#1e2f46" strokeWidth="3" /></>}
    </svg>
  )
}

function ScreenHeader({ lesson = false }: { lesson?: boolean }) {
  return (
    <header className="screen-header">
      <span>{lesson && <BrandLogo small />}</span>
      <UserIcon />
    </header>
  )
}

function LessonControls({
  step,
  onBack,
  onNext,
  nextLabel = 'Next',
  nextDisabled = false,
}: {
  step: number
  onBack: () => void
  onNext: () => void
  nextLabel?: string
  nextDisabled?: boolean
}) {
  return (
    <div className="lesson-controls">
      <div className="step-label">step {step} <span>/ 5</span></div>
      <div className="lesson-progress" aria-label={`Step ${step} of 5`}><span style={{ width: `${step * 20}%` }} /></div>
      <div className="lesson-dots" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, index) => <i key={index} className={index + 1 === step ? 'is-current' : ''} />)}
      </div>
      <div className="lesson-buttons">
        <button className="button-back" type="button" onClick={onBack}>Back</button>
        <button className="button-next" type="button" onClick={onNext} disabled={nextDisabled}>{nextLabel}</button>
      </div>
    </div>
  )
}

function PasswordMedia() {
  return (
    <figure className="lesson-media">
      <div className="media-row media-row--warning" aria-hidden="true">
        <div><span>Predictable password</span><strong>Mary1989!</strong></div><AlertTriangle />
      </div>
      <div className="media-row media-row--safe" aria-hidden="true">
        <div><span>Stronger passphrase</span><strong>MyCowIsHappyToday</strong></div><ShieldCheck />
      </div>
      <figcaption><strong>Visual explainer:</strong> Longer, unique passphrases are harder to guess than short passwords with predictable personal details.</figcaption>
    </figure>
  )
}

function PhishingMedia() {
  return (
    <figure className="lesson-media phishing-media">
      <div className="phishing-message" aria-hidden="true">
        <span>Account alert · URGENT</span>
        <strong>Your account will be locked. Verify your password now.</strong>
        <div><i>Pressure</i><i>Unknown sender</i><i>Unexpected link</i></div>
      </div>
      <figcaption><strong>Visual explainer:</strong> Urgent language, an unfamiliar sender, and an unexpected credential request are warning signs.</figcaption>
    </figure>
  )
}

function App() {
  const initialProgress = useMemo(loadProgress, [])
  const [screen, setScreen] = useState<Screen>(initialProgress?.screen ?? 'welcome')
  const [lessonIndex, setLessonIndex] = useState(initialProgress?.lessonIndex ?? 0)
  const [lessonPhase, setLessonPhase] = useState<LessonPhase>(initialProgress?.lessonPhase ?? 'intro')
  const [completedLessons, setCompletedLessons] = useState<boolean[]>(initialProgress?.completedLessons ?? [false, false, false, false])
  const [activeClue, setActiveClue] = useState<ClueId | null>(null)
  const [scenarioAnswer, setScenarioAnswer] = useState<number | null>(initialProgress?.scenarioAnswer ?? null)
  const [quizStep, setQuizStep] = useState(initialProgress?.quizStep ?? 0)
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(initialProgress?.quizAnswers ?? [null, null, null, null])
  const [resourceKind, setResourceKind] = useState<ResourceKind>(initialProgress?.resourceKind ?? 'guides')
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const mainRef = useRef<HTMLElement>(null)

  const quizScore = useMemo(() => quizAnswers.reduce<number>((score, answer, index) => (
    answer !== null && quizQuestions[index].options[answer].correct ? score + 1 : score
  ), 0), [quizAnswers])
  const overallProgress = completedLessons.filter(Boolean).length * 20 + (scenarioAnswer !== null ? 10 : 0) + (quizStep === 4 ? 10 : 0)

  const go = (next: Screen) => setScreen(next)

  useEffect(() => {
    const progress: StoredProgress = {
      version: 1,
      screen,
      lessonIndex,
      lessonPhase,
      completedLessons,
      scenarioAnswer,
      quizStep,
      quizAnswers,
      resourceKind,
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
    } catch {
      // The module remains usable if browser storage is unavailable.
    }
  }, [screen, lessonIndex, lessonPhase, completedLessons, scenarioAnswer, quizStep, quizAnswers, resourceKind])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    mainRef.current?.focus({ preventScroll: true })
  }, [screen, lessonPhase, lessonIndex, resourceKind])

  const openLesson = (index: number, phase: 'intro' | 'content' = 'intro') => {
    setLessonIndex(index)
    setLessonPhase(phase)
    go('lesson')
  }

  const nextLesson = () => {
    if (lessonPhase === 'intro') return setLessonPhase('content')
    setCompletedLessons(previous => previous.map((completed, index) => index === lessonIndex ? true : completed))
    if (lessonIndex < 2) return openLesson(lessonIndex + 1)
    if (lessonIndex === 2) return go('scenario')
    go('assessment')
  }

  const startQuiz = (index = 0) => {
    setQuizStep(index)
    go('quiz')
  }

  const resetQuiz = () => {
    setQuizAnswers([null, null, null, null])
    setQuizStep(0)
    go('quiz')
  }

  const openResource = (kind: ResourceKind) => {
    setResourceKind(kind)
    setOpenFaq(null)
    go('resourceDetail')
  }

  const feedback = (option: QuizOption) => (
    <div className={option.correct ? 'feedback feedback--correct' : 'feedback feedback--incorrect'} role="status" aria-live="polite">
      {option.correct ? <CheckCircle2 /> : <XCircle />}
      <div><strong>{option.correct ? 'Good decision' : 'Not the safest choice'}</strong><p>{option.feedback}</p></div>
    </div>
  )

  const renderWelcome = () => (
    <section className="welcome" aria-labelledby="screen-title">
      <div className="welcome-brand"><BrandLogo /><div><strong>Digital Security</strong><span>Educational Multimedia Module</span></div></div>
      <h1 id="screen-title" tabIndex={-1}>Welcome!</h1>
      <p className="welcome-intro">In less than eight minutes you will learn practical habits to stay safe online at university and in your daily digital life.</p>
      <div className="objective">
        <h2>Learning objective</h2>
        <p>By the end of this module, you will be able to identify and apply at least three practical digital-security recommendations to protect your passwords, recognize phishing and suspicious messages, and safeguard your personal information.</p>
      </div>
      <div className="stats">
        <div><StatIcon type="time" /><strong>7:45</strong><span>Estimated<br />duration</span></div>
        <div><StatIcon type="sections" /><strong>8</strong><span>Sections</span></div>
        <div><StatIcon type="questions" /><strong>4</strong><span>Knowledge-<br />check<br />questions</span></div>
      </div>
      <button className="primary-green welcome-continue" type="button" onClick={() => go('home')}>Continue</button>
    </section>
  )

  const renderHome = () => (
    <section className="home-screen" aria-labelledby="screen-title">
      <div className="home-brand"><BrandLogo /><div><span>Educational module</span><h1 id="screen-title" tabIndex={-1}>Digital<br />Security</h1></div></div>
      <button className="home-card home-lessons" type="button" onClick={() => go('lessons')}>
        <span className="card-kicker">Lessons</span><strong>01</strong><span className="card-title">Digital-security<br />foundations</span><ChevronRight />
      </button>
      <div className="home-card progress-card">
        <h2>Your progress</h2><strong>{overallProgress}%</strong>
        <div className="green-progress" role="progressbar" aria-label="Module progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={overallProgress}><span style={{ width: `${overallProgress}%` }} /></div>
      </div>
      <div className="home-card continue-card">
        <h2>Continue</h2>
        <button className="resume-button" type="button" onClick={() => openLesson(lessonIndex, lessonPhase)}>Resume lesson</button>
        <button className="resources-button" type="button" onClick={() => go('resources')}>View<br />resources</button>
      </div>
      <p className="local-save-note">Your progress is saved automatically on this device.</p>
    </section>
  )

  const renderLessons = () => (
    <section className="list-screen" aria-labelledby="screen-title">
      <h1 id="screen-title" tabIndex={-1}>Lessons</h1>
      <div className="lesson-list">
        {lessons.map((lesson, index) => (
          <button type="button" key={lesson.code} onClick={() => openLesson(index)}>
            <span>{lesson.code}</span><strong>{lesson.title}</strong><ChevronRight />
          </button>
        ))}
      </div>
    </section>
  )

  const lessonContent = () => {
    if (lessonIndex === 0) return (
      <div className="content-block">
        <h2>Create strong passwords</h2>
        <p>A strong password helps protect your accounts from unauthorized access.</p>
        <PasswordMedia />
        <ul className="simple-list">
          <li>Use long passwords or passphrases.</li><li>Create a unique password for each account.</li><li>Avoid names, birthdays, and predictable patterns.</li><li>Never reuse your main password across multiple services.</li>
        </ul>
        <div className="text-note"><strong>Enable multi-factor authentication</strong><p>MFA adds another layer of protection. Use an authenticator app, a security key, or another method supported by the service.</p></div>
      </div>
    )
    if (lessonIndex === 1) return (
      <div className="content-block">
        <h2>Protect your credentials</h2><p>Keep your passwords private and be careful with unexpected requests.</p>
        <ul className="simple-list">
          <li>Never share your passwords with other people.</li><li>Do not enter credentials through suspicious links.</li><li>Use a reputable password manager if appropriate.</li><li>Review account security settings regularly.</li><li>If you suspect a compromised account, change the password and follow the service’s recovery instructions.</li>
        </ul>
        <div className="text-note"><strong>Stop and verify</strong><p>Share only the personal information a service genuinely needs, especially when a request is unexpected.</p></div>
      </div>
    )
    if (lessonIndex === 2) return (
      <div className="content-block">
        <h2>Stop. Check. Then act.</h2><p>Phishing messages imitate trusted people or services to steal credentials and personal information.</p>
        <PhishingMedia />
        <ul className="simple-list"><li>Check the real sender, not only the display name.</li><li>Question urgency and threats.</li><li>Inspect unexpected links before trusting them.</li><li>Verify through the official app or a known web address.</li></ul>
      </div>
    )
    return (
      <div className="content-block">
        <h2>Small security habits make a difference</h2><p>Review these practices regularly:</p>
        <ul className="simple-list"><li>Use a unique password for every account.</li><li>Consider a reputable password manager.</li><li>Enable multi-factor authentication.</li><li>Never trust unexpected login requests without verifying them.</li></ul>
        <div className="text-note"><strong>Your next step</strong><p>Choose one important account and review its security settings today.</p></div>
      </div>
    )
  }

  const renderLesson = () => {
    const lesson = lessons[lessonIndex]
    return (
      <section className={`lesson-screen ${lessonPhase === 'intro' ? 'lesson-screen--intro' : ''}`} aria-labelledby="screen-title">
        <div className="lesson-heading">
          <span>{lesson.heading}</span>
          <h1 id="screen-title" tabIndex={-1}>{lesson.title}</h1>
          <p>{lesson.intro}</p>
        </div>
        {lessonPhase === 'content' && lessonContent()}
        <LessonControls
          step={lessonIndex + 1}
          onBack={() => lessonPhase === 'content' ? setLessonPhase('intro') : go('lessons')}
          onNext={nextLesson}
          nextLabel={lessonPhase === 'intro' ? 'Next' : lessonIndex < 2 ? 'Next lesson' : lessonIndex === 2 ? 'Try a scenario' : 'Assessment'}
        />
      </section>
    )
  }

  const renderScenario = () => (
    <section className="scenario-screen" aria-labelledby="screen-title">
      <div className="lesson-heading"><span>Practice scenario</span><h1 id="screen-title" tabIndex={-1}>University message challenge</h1><p>Inspect the simulated message, tap each clue, and choose the safest next step.</p></div>
      <article className="email-card" aria-label="Simulated university email">
        <div className="email-label"><MailWarning /> Simulated inbox <span>Practice only</span></div>
        <strong>UNAD Campus Support</strong><small>&lt;no-reply@campus-account-verify.com&gt;</small>
        <h2>[Urgent] Your university account will be suspended</h2>
        <p>Confirm your password and MFA code within <strong>30 minutes</strong> or your account will be suspended.</p>
        <div className="fake-link">campus-unad.verify-account.info</div><small className="fake-note">Simulated link · Do not use</small>
      </article>
      <div className="clues">
        <h2>Tap to inspect the warning signs</h2>
        {(Object.keys(clueContent) as ClueId[]).map(clue => (
          <button key={clue} type="button" className={activeClue === clue ? 'is-active' : ''} aria-pressed={activeClue === clue} onClick={() => setActiveClue(clue)}>
            {clue === 'link' ? <Link2 /> : clue === 'tone' ? <AlertTriangle /> : <KeyRound />}{clueContent[clue].title}<ChevronRight />
          </button>
        ))}
        {activeClue && <div className="clue-detail" role="status"><strong>{clueContent[activeClue].title}</strong><p>{clueContent[activeClue].text}</p></div>}
      </div>
      <fieldset className="answers"><legend>What is the safest next step?</legend>
        {scenarioOptions.map((option, index) => <button key={option.text} type="button" disabled={scenarioAnswer !== null} className={`${scenarioAnswer === index ? 'is-selected' : ''} ${scenarioAnswer !== null && option.correct ? 'is-correct' : ''}`} onClick={() => setScenarioAnswer(index)}>{option.text}</button>)}
      </fieldset>
      {scenarioAnswer !== null && feedback(scenarioOptions[scenarioAnswer])}
      <LessonControls step={3} onBack={() => openLesson(2, 'content')} onNext={() => openLesson(3)} nextDisabled={scenarioAnswer === null} />
    </section>
  )

  const renderAssessment = () => {
    const names = ['Foundations quiz', 'Privacy quiz', 'Threats quiz', 'Good practices quiz']
    return (
      <section className="assessment-screen" aria-labelledby="screen-title">
        <h1 id="screen-title" tabIndex={-1}>Assessment</h1>
        <div className="assessment-progress"><span>Your<br />progress</span><strong>{overallProgress}%</strong><div className="green-progress" role="progressbar" aria-label="Module progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={overallProgress}><span style={{ width: `${overallProgress}%` }} /></div></div>
        <div className="assessment-list">
          {names.map((name, index) => {
            const status = quizAnswers[index] !== null ? 'Completed' : quizStep === index ? 'In progress' : 'Not started'
            return <button type="button" key={name} onClick={() => startQuiz(index)}><strong>{name}</strong><span>{status}</span><ChevronRight /></button>
          })}
        </div>
      </section>
    )
  }

  const renderQuiz = () => {
    const complete = quizStep === quizQuestions.length
    return (
      <section className="quiz-screen" aria-labelledby="screen-title">
        <div className="lesson-heading"><span>Knowledge check</span><h1 id="screen-title" tabIndex={-1}>{complete ? 'Your result' : 'Assessment'}</h1><p>{complete ? 'Review your score and continue to the final recommendations.' : 'Choose one answer to see immediate, answer-specific feedback.'}</p></div>
        {!complete ? <>
          <div className="quiz-status"><span>Question {quizStep + 1} of 4</span><strong>{quizScore} correct so far</strong></div>
          <div className="lesson-progress"><span style={{ width: `${(quizStep + 1) * 25}%` }} /></div>
          <fieldset className="answers quiz-answers"><legend>{quizQuestions[quizStep].question}</legend>
            {quizQuestions[quizStep].options.map((option, index) => {
              const answered = quizAnswers[quizStep] !== null
              return <button key={option.text} type="button" disabled={answered} className={`${quizAnswers[quizStep] === index ? 'is-selected' : ''} ${answered && option.correct ? 'is-correct' : ''}`} onClick={() => {
                if (answered) return
                setQuizAnswers(previous => { const next = [...previous]; next[quizStep] = index; return next })
              }}>{option.text}</button>
            })}
          </fieldset>
          {quizAnswers[quizStep] !== null && <>
            {feedback(quizQuestions[quizStep].options[quizAnswers[quizStep] as number])}
            <button className="primary-green quiz-next" type="button" onClick={() => setQuizStep(step => step + 1)}>{quizStep === 3 ? 'See my result' : 'Next question'}<ArrowRight /></button>
          </>}
          <button className="text-link" type="button" onClick={() => go('assessment')}><ArrowLeft />Back to assessment</button>
        </> : <div className="result-card">
          <div className="result-score"><strong>{quizScore}</strong><span>out of 4</span></div>
          <h2>{quizScore === 4 ? 'Excellent security judgment' : quizScore >= 2 ? 'You are building safer habits' : 'A quick review can help'}</h2>
          <p>{quizScore === 4 ? 'You identified the safest action in every situation.' : 'Review the recommendations or retake the check to reinforce what you learned.'}</p>
          <button className="primary-green" type="button" onClick={() => go('recommendations')}>View final recommendations</button>
          <button className="text-link" type="button" onClick={resetQuiz}><RotateCcw />Retake knowledge check</button>
        </div>}
      </section>
    )
  }

  const renderRecommendations = () => (
    <section className="recommendations" aria-labelledby="screen-title">
      <div className="lesson-heading"><span>Final recommendations</span><h1 id="screen-title" tabIndex={-1}>Quick security check</h1><p>Before you finish, ask yourself:</p></div>
      <ol className="review-list"><li>Do I use long, unique passwords?</li><li>Have I enabled MFA on important accounts?</li><li>Do I avoid sharing credentials or trusting suspicious links?</li><li>Do I share only the personal information that is necessary?</li></ol>
      <div className="next-step"><strong>Your next step:</strong> Choose one important account and review its security settings today.</div>
      <div className="review-checks" aria-label="Security recommendations"><span><Check />Unique passwords</span><span><Check />MFA enabled</span><span><Check />Suspicious requests verified</span></div>
      <LessonControls step={5} onBack={() => go('quiz')} onNext={() => go('resources')} nextLabel="Finish" />
    </section>
  )

  const resourceRows: { kind: ResourceKind; label: string }[] = [
    { kind: 'guides', label: 'Guides and articles' }, { kind: 'media', label: 'Educational videos' }, { kind: 'glossary', label: 'Glossary' }, { kind: 'faq', label: 'Frequently asked questions' }, { kind: 'support', label: 'Support links' },
  ]

  const renderResources = () => (
    <section className="list-screen resources-screen" aria-labelledby="screen-title"><h1 id="screen-title" tabIndex={-1}>Resources</h1><div className="resource-list">
      {resourceRows.map(row => <button type="button" key={row.kind} onClick={() => openResource(row.kind)}><span>{row.label}</span><ChevronRight /></button>)}
    </div></section>
  )

  const renderResourceDetail = () => {
    const title = resourceRows.find(row => row.kind === resourceKind)?.label
    return (
      <section className="resource-detail" aria-labelledby="screen-title">
        <button className="text-link" type="button" onClick={() => go('resources')}><ArrowLeft />Resources</button>
        <h1 id="screen-title" tabIndex={-1}>{title}</h1>
        {resourceKind === 'guides' && <div className="detail-content"><p>Keep learning with trusted security guidance.</p>
          <a className="detail-link" href="https://www.cisa.gov/secure-our-world/use-strong-passwords" target="_blank" rel="noreferrer"><span><strong>CISA · Use strong passwords</strong><small>Password and password-manager guidance</small></span><ExternalLink /></a>
          <a className="detail-link" href="https://www.cisa.gov/secure-our-world/recognize-and-report-phishing" target="_blank" rel="noreferrer"><span><strong>CISA · Recognize and report phishing</strong><small>Warning signs and safer next steps</small></span><ExternalLink /></a>
        </div>}
        {resourceKind === 'media' && <div className="detail-content"><p>Open the captioned visual versions of the lesson media. Visible text equivalents are included, so no audio is required.</p>
          <button className="detail-link" type="button" onClick={() => openLesson(0, 'content')}><span><strong>Password safety</strong><small>Captioned visual explainer</small></span><ChevronRight /></button>
          <button className="detail-link" type="button" onClick={() => openLesson(2, 'content')}><span><strong>Suspicious messages</strong><small>Captioned visual explainer</small></span><ChevronRight /></button>
        </div>}
        {resourceKind === 'glossary' && <dl className="glossary"><div><dt>Passphrase</dt><dd>A longer sequence of words used as a password.</dd></div><div><dt>Phishing</dt><dd>A deceptive message designed to steal credentials or personal information.</dd></div><div><dt>MFA</dt><dd>Multi-factor authentication: an additional verification step beyond a password.</dd></div><div><dt>Credentials</dt><dd>Information used to verify identity, such as a password or MFA code.</dd></div></dl>}
        {resourceKind === 'faq' && <div className="faq-list">{[
          ['Should I reuse a strong password?', 'No. Use a unique password for every account so one breach does not expose several services.'],
          ['Can support staff ask for my MFA code?', 'No. Keep passwords and verification codes private. Verify support requests through official channels.'],
          ['What should I do after a suspicious message?', 'Do not use its links. Open the official app or website, check your account, and report the message.'],
        ].map(([question, answer], index) => <div key={question}><button type="button" aria-expanded={openFaq === index} onClick={() => setOpenFaq(openFaq === index ? null : index)}>{question}<ChevronRight /></button>{openFaq === index && <p>{answer}</p>}</div>)}</div>}
        {resourceKind === 'support' && <div className="detail-content"><h2>University account support</h2><p>Use the contact details published on the university’s official website. Do not reply to suspicious messages or share your password or MFA code.</p><h2>If your account may be compromised</h2><ul className="simple-list"><li>Change the password using a clean device.</li><li>Review recent activity and sign out unknown sessions.</li><li>Follow the service’s official recovery instructions.</li></ul></div>}
      </section>
    )
  }

  const content = () => {
    switch (screen) {
      case 'welcome': return renderWelcome()
      case 'home': return renderHome()
      case 'lessons': return renderLessons()
      case 'lesson': return renderLesson()
      case 'scenario': return renderScenario()
      case 'assessment': return renderAssessment()
      case 'quiz': return renderQuiz()
      case 'recommendations': return renderRecommendations()
      case 'resources': return renderResources()
      case 'resourceDetail': return renderResourceDetail()
    }
  }

  const nav = [
    { label: 'Home', target: 'home' as Screen, active: screen === 'home' },
    { label: 'Lessons', target: 'lessons' as Screen, active: ['lessons', 'lesson', 'scenario', 'recommendations'].includes(screen) },
    { label: 'Assessment', target: 'assessment' as Screen, active: ['assessment', 'quiz'].includes(screen) },
    { label: 'Resources', target: 'resources' as Screen, active: ['resources', 'resourceDetail'].includes(screen) },
  ]

  return (
    <div className="app-shell">
      {screen !== 'welcome' && <ScreenHeader lesson={screen === 'lesson' || screen === 'scenario'} />}
      <main ref={mainRef} tabIndex={-1} className="app-main" key={`${screen}-${lessonIndex}-${lessonPhase}-${resourceKind}`}>{content()}</main>
      {screen !== 'welcome' && <nav className="bottom-nav" aria-label="Main navigation">{nav.map(item => <button key={item.label} type="button" className={item.active ? 'is-active' : ''} aria-current={item.active ? 'page' : undefined} onClick={() => go(item.target)}>{item.label}</button>)}</nav>}
    </div>
  )
}

export default App
