// pages/quiz.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Head from 'next/head';
import { Container, Form, Button, Spinner, Card, Badge, ProgressBar } from 'react-bootstrap';

export default function Quiz() {
  const router = useRouter();
  const { topic } = router.query;
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [correctAnswers, setCorrectAnswers] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showAllQuestions, setShowAllQuestions] = useState(false);

  useEffect(() => {
    if (!topic) return;

    // Enhanced particle animation background
    const container = document.querySelector('.particles');
    if (container) {
      container.innerHTML = '';
      for (let i = 0; i < 80; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.animationDuration = `${2 + Math.random() * 4}s`;
        particle.style.animationDelay = `${Math.random() * 2}s`;
        container.appendChild(particle);
      }
    }

    const fetchQuestions = async () => {
      try {
        const prompt = `Generate 5 multiple choice questions for children on the topic of "${topic}". Each question must follow this exact format:

1. What is 2 + 2?
A. 2
B. 3
C. 4
D. 5
Answer: C

Repeat for all 5 questions.`;

        const response = await axios.post('/api/gemini', { prompt });
        const rawText = response.data.candidates[0].content.parts[0].text;
        
        // Split by question numbers (1., 2., 3., etc.) to get individual question blocks
        const questionBlocks = rawText.split(/\d+\.\s/).filter(block => block.trim().length > 0);
        
        const parsedQuestions = [];
        const parsedCorrectAnswers = [];

        questionBlocks.forEach((block, index) => {
          const lines = block.trim().split('\n').filter(line => line.trim().length > 0);
          
          // Find the answer line
          const answerLineIndex = lines.findIndex(line => 
            line.trim().toLowerCase().startsWith('answer:')
          );
          
          if (answerLineIndex !== -1) {
            const answerLine = lines[answerLineIndex];
            const answer = answerLine.split(':')[1]?.trim().toUpperCase();
            
            // Get question text and options (everything before the answer line)
            const questionLines = lines.slice(0, answerLineIndex);
            const questionText = `${index + 1}. ${questionLines.join('\n')}`;
            
            if (answer && ['A', 'B', 'C', 'D'].includes(answer)) {
              parsedQuestions.push(questionText);
              parsedCorrectAnswers.push(answer);
            }
          }
        });

        // Fallback parsing if the first method doesn't work
        if (parsedQuestions.length === 0) {
          const blocks = rawText.split(/\n{2,}/).filter(Boolean);
          
          blocks.forEach(block => {
            const lines = block.trim().split('\n');
            const answerLine = lines.find(line => line.trim().toLowerCase().startsWith('answer:'));
            
            if (answerLine) {
              const answer = answerLine.split(':')[1]?.trim().toUpperCase();
              if (answer && ['A', 'B', 'C', 'D'].includes(answer)) {
                const questionText = lines
                  .filter(line => !line.toLowerCase().startsWith('answer:'))
                  .join('\n');
                parsedQuestions.push(questionText);
                parsedCorrectAnswers.push(answer);
              }
            }
          });
        }

        if (parsedQuestions.length === 0) {
          throw new Error("No valid questions parsed");
        }

        console.log('Parsed Questions:', parsedQuestions);
        console.log('Correct Answers:', parsedCorrectAnswers);

        setQuestions(parsedQuestions);
        setAnswers(Array(parsedQuestions.length).fill(''));
        setCorrectAnswers(parsedCorrectAnswers);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load or parse questions:', err);
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [topic]);

  const handleAnswerChange = (questionIndex, value) => {
    const upperValue = value.toUpperCase();
    if (upperValue === '' || ['A', 'B', 'C', 'D'].includes(upperValue)) {
      const newAnswers = [...answers];
      newAnswers[questionIndex] = upperValue;
      setAnswers(newAnswers);
    }
  };

  // New function to handle option clicks
  const handleOptionClick = (questionIndex, optionLetter) => {
    handleAnswerChange(questionIndex, optionLetter);
  };

  const handleSubmit = () => {
    const unansweredQuestions = answers.some(answer => !answer.trim());
    
    if (unansweredQuestions) {
      alert('Please answer all questions before submitting.');
      return;
    }

    const invalidAnswers = answers.some(answer => 
      !['A', 'B', 'C', 'D'].includes(answer.trim().toUpperCase())
    );
    
    if (invalidAnswers) {
      alert('Please make sure all answers are A, B, C, or D.');
      return;
    }

    const summaryData = {
      topic,
      questions,
      answers: answers.map(answer => answer.trim().toUpperCase()),
      correctAnswers
    };

    router.push({
      pathname: '/summary',
      query: { data: encodeURIComponent(JSON.stringify(summaryData)) }
    });
  };

  const parseQuestionContent = (question) => {
    const lines = question.split('\n');
    const questionText = lines[0];
    const options = lines.slice(1).filter(line => line.match(/^[A-D]\./));
    return { questionText, options };
  };

  const progressPercentage = (answers.filter(a => a.trim()).length / questions.length) * 100;

  return (
    <>
      <Head>
        <title>{topic} Quiz - EduMath</title>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css" rel="stylesheet" />
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Inter', sans-serif;
          background: linear-gradient(135deg, #0c0f1a 0%, #1a1d29 25%, #2d1b69 75%, #6366f1 100%);
          color: #e2e8f0;
          overflow-x: hidden;
          min-height: 100vh;
        }

        .particles {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }

        .particle {
          position: absolute;
          width: 3px;
          height: 3px;
          background: radial-gradient(circle, #60a5fa, #3b82f6);
          border-radius: 50%;
          opacity: 0.7;
          animation: float 6s ease-in-out infinite;
          box-shadow: 0 0 10px rgba(96, 165, 250, 0.5);
        }

        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) translateX(0px) rotate(0deg) scale(1); 
            opacity: 0.7;
          }
          25% { 
            transform: translateY(-15px) translateX(10px) rotate(90deg) scale(1.2); 
            opacity: 1;
          }
          50% { 
            transform: translateY(-30px) translateX(-5px) rotate(180deg) scale(0.8); 
            opacity: 0.5;
          }
          75% { 
            transform: translateY(-15px) translateX(-10px) rotate(270deg) scale(1.1); 
            opacity: 0.9;
          }
        }

        .navbar {
          background: rgba(15, 20, 31, 0.85) !important;
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(99, 102, 241, 0.2);
          padding: 1rem 0;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          position: relative;
          z-index: 1000;
        }

        .navbar-brand {
          font-weight: 800;
          font-size: 1.75rem;
          background: linear-gradient(135deg, #60a5fa, #a855f7, #ec4899);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: 0 0 30px rgba(96, 165, 250, 0.3);
        }

        .quiz-container {
          background: rgba(30, 41, 59, 0.4);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          border: 1px solid rgba(99, 102, 241, 0.2);
          box-shadow: 
            0 25px 50px rgba(0, 0, 0, 0.25),
            0 0 100px rgba(99, 102, 241, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          position: relative;
          z-index: 10;
          overflow: hidden;
        }

        .quiz-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.5), transparent);
        }

        .quiz-header {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1));
          padding: 2rem;
          border-radius: 24px 24px 0 0;
          border-bottom: 1px solid rgba(99, 102, 241, 0.2);
          text-align: center;
        }

        .quiz-title {
          font-size: 2.5rem;
          font-weight: 800;
          background: linear-gradient(135deg, #f8fafc, #e2e8f0);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 0.5rem;
          text-shadow: 0 0 30px rgba(248, 250, 252, 0.3);
        }

        .quiz-subtitle {
          color: #94a3b8;
          font-size: 1.1rem;
          font-weight: 500;
        }

        .progress-section {
          padding: 1.5rem 2rem;
          background: rgba(15, 23, 42, 0.3);
        }

        .progress-bar {
          height: 8px;
          border-radius: 4px;
          background: rgba(15, 23, 42, 0.5);
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #60a5fa, #a855f7);
          border-radius: 4px;
          transition: width 0.3s ease;
          box-shadow: 0 0 10px rgba(96, 165, 250, 0.5);
        }

        .question-card {
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(99, 102, 241, 0.15);
          border-radius: 16px;
          margin: 1.5rem 2rem;
          padding: 0;
          overflow: hidden;
          transition: all 0.3s ease;
          position: relative;
        }

        .question-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
          border-color: rgba(99, 102, 241, 0.3);
        }

        .question-header {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.05));
          padding: 1.5rem;
          border-bottom: 1px solid rgba(99, 102, 241, 0.1);
        }

        .question-number {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #60a5fa, #a855f7);
          color: white;
          border-radius: 50%;
          font-weight: 700;
          font-size: 0.9rem;
          margin-right: 1rem;
          box-shadow: 0 4px 12px rgba(96, 165, 250, 0.4);
        }

        .question-text {
          color: #f1f5f9;
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0;
          line-height: 1.6;
        }

        .options-container {
          padding: 1.5rem;
        }

        .option-row {
          display: flex;
          align-items: center;
          padding: 0.75rem 1rem;
          margin-bottom: 0.5rem;
          background: rgba(30, 41, 59, 0.3);
          border: 1px solid rgba(71, 85, 105, 0.3);
          border-radius: 12px;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .option-row:hover {
          background: rgba(99, 102, 241, 0.1);
          border-color: rgba(99, 102, 241, 0.3);
          transform: translateX(4px);
        }

        .option-row.selected {
          background: rgba(99, 102, 241, 0.2);
          border-color: rgba(99, 102, 241, 0.5);
          box-shadow: 0 0 15px rgba(99, 102, 241, 0.3);
        }

        .option-letter {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          background: rgba(71, 85, 105, 0.5);
          color: #cbd5e0;
          border-radius: 50%;
          font-weight: 600;
          font-size: 0.85rem;
          margin-right: 1rem;
          transition: all 0.2s ease;
        }

        .option-row:hover .option-letter,
        .option-row.selected .option-letter {
          background: linear-gradient(135deg, #60a5fa, #a855f7);
          color: white;
        }

        .option-text {
          color: #e2e8f0;
          font-weight: 500;
          margin: 0;
          flex: 1;
        }

        .answer-input {
          background: rgba(15, 23, 42, 0.6) !important;
          border: 2px solid rgba(71, 85, 105, 0.4) !important;
          border-radius: 12px !important;
          color: #f1f5f9 !important;
          font-size: 1.1rem !important;
          font-weight: 600 !important;
          padding: 0.75rem 1rem !important;
          text-align: center !important;
          transition: all 0.3s ease !important;
          width: 80px !important;
          margin: 1rem auto 0 auto !important;
          display: block !important;
        }

        .answer-input:focus {
          border-color: #60a5fa !important;
          box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1) !important;
          background: rgba(15, 23, 42, 0.8) !important;
        }

        .answer-input.filled {
          border-color: #10b981 !important;
          background: rgba(16, 185, 129, 0.1) !important;
        }

        .submit-section {
          padding: 2rem;
          background: rgba(15, 23, 42, 0.2);
          border-top: 1px solid rgba(99, 102, 241, 0.1);
        }

        .btn-submit {
          background: linear-gradient(135deg, #60a5fa, #a855f7) !important;
          border: none !important;
          border-radius: 12px !important;
          padding: 1rem 2rem !important;
          font-weight: 700 !important;
          font-size: 1.1rem !important;
          transition: all 0.3s ease !important;
          box-shadow: 0 10px 30px rgba(96, 165, 250, 0.3) !important;
          width: 100% !important;
          margin-bottom: 1rem !important;
        }

        .btn-submit:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 15px 40px rgba(96, 165, 250, 0.4) !important;
        }

        .btn-secondary {
          background: rgba(71, 85, 105, 0.5) !important;
          border: 1px solid rgba(71, 85, 105, 0.7) !important;
          border-radius: 12px !important;
          padding: 0.75rem 1.5rem !important;
          font-weight: 600 !important;
          transition: all 0.3s ease !important;
          width: 100% !important;
        }

        .btn-secondary:hover {
          background: rgba(71, 85, 105, 0.7) !important;
          border-color: rgba(99, 102, 241, 0.5) !important;
          transform: translateY(-1px) !important;
        }

        .loading-container {
          text-align: center;
          padding: 4rem 2rem;
        }

        .spinner-border {
          width: 3rem !important;
          height: 3rem !important;
          border-width: 0.3rem !important;
        }

        @media (max-width: 768px) {
          .quiz-title {
            font-size: 2rem;
          }
          
          .question-card {
            margin: 1rem;
          }
          
          .quiz-container {
            margin: 1rem;
          }
        }
      `}</style>

      <div className="particles"></div>

      <nav className="navbar navbar-expand-lg navbar-dark fixed-top">
        <div className="container">
          <a
          className="navbar-brand"
          role="button"
          style={{ cursor: 'pointer' }}
          onClick={() => router.push('/')}
        >
          <i className="fas fa-graduation-cap me-2"></i>EduMath
        </a>
          <div className="d-flex align-items-center">
            <Badge bg="primary" className="me-3">
              <i className="fas fa-question-circle me-1"></i>
              {questions.length} Questions
            </Badge>
          </div>
        </div>
      </nav>

      <Container className="d-flex justify-content-center align-items-start" style={{ minHeight: '100vh', paddingTop: '6rem', paddingBottom: '2rem' }}>
        <div className="quiz-container" style={{ width: '100%', maxWidth: '800px' }}>
          
          <div className="quiz-header">
            <h1 className="quiz-title">
              <i className="fas fa-brain me-3"></i>
              {topic} Quiz
            </h1>
            <p className="quiz-subtitle">Test your knowledge and learn something new!</p>
          </div>

          {!loading && questions.length > 0 && (
            <div className="progress-section">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted">Progress</span>
                <span className="text-light fw-bold">
                  {answers.filter(a => a.trim()).length}/{questions.length} completed
                </span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-bar-fill" 
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="loading-container">
              <Spinner animation="border" variant="primary" />
              <h4 className="mt-3 text-light">Generating your quiz...</h4>
              <p className="text-muted">Please wait while we prepare your questions</p>
            </div>
          ) : (
            <div>
              {questions.map((question, index) => {
                const { questionText, options } = parseQuestionContent(question);
                return (
                  <div key={index} className="question-card">
                    <div className="question-header">
                      <div className="d-flex align-items-center">
                        <span className="question-number">{index + 1}</span>
                        <h5 className="question-text">{questionText}</h5>
                      </div>
                    </div>
                    
                    <div className="options-container">
                      {options.map((option, optIndex) => {
                        const letter = option.charAt(0);
                        const text = option.substring(3);
                        const isSelected = answers[index] === letter;
                        return (
                          <div 
                            key={optIndex} 
                            className={`option-row ${isSelected ? 'selected' : ''}`}
                            onClick={() => handleOptionClick(index, letter)}
                          >
                            <span className="option-letter">{letter}</span>
                            <p className="option-text">{text}</p>
                          </div>
                        );
                      })}
                      
                      <Form.Control
                        type="text"
                        placeholder="A, B, C, or D"
                        value={answers[index] || ''}
                        onChange={(e) => handleAnswerChange(index, e.target.value)}
                        className={`answer-input ${answers[index] ? 'filled' : ''}`}
                        maxLength={1}
                      />
                    </div>
                  </div>
                );
              })}

              <div className="submit-section">
                <Button 
                  className="btn-submit"
                  onClick={handleSubmit}
                  disabled={answers.filter(a => a.trim()).length !== questions.length}
                >
                  <i className="fas fa-rocket me-2"></i>
                  Submit Quiz
                </Button>
                <Button 
                  variant="secondary" 
                  className="btn-secondary"
                  onClick={() => router.push(`/slides?topic=${topic}`)}
                >
                  <i className="fas fa-arrow-left me-2"></i>
                  Back to Slides
                </Button>
              </div>
            </div>
          )}
        </div>
      </Container>
    </>
  );
}