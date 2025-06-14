// pages/summary.js
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Container, Button, Badge, Modal, Form } from 'react-bootstrap';
import Head from 'next/head';

export default function Summary() {
  const router = useRouter();
  const { data } = router.query;
  const [summary, setSummary] = useState(null);
  const [showNameModal, setShowNameModal] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [animateCards, setAnimateCards] = useState(false);

  useEffect(() => {
    if (data) {
      try {
        const parsed = JSON.parse(decodeURIComponent(data));
        const results = parsed.questions.map((q, i) => {
          const user = parsed.answers[i]?.trim().toUpperCase();
          const correct = parsed.correctAnswers[i]?.trim().toUpperCase();
          return {
            question: q,
            userAnswer: parsed.answers[i],
            correctAnswer: parsed.correctAnswers[i],
            isCorrect: user === correct,
          };
        });

        setSummary({
          ...parsed,
          results,
          score: results.filter(r => r.isCorrect).length,
        });

        // Animate cards after data loads
        setTimeout(() => setAnimateCards(true), 100);
      } catch (err) {
        console.error("Failed to parse summary data:", err);
      }
    }
  }, [data]);

  // Enhanced particle system
  useEffect(() => {
    const container = document.querySelector('.particles');
    if (container) {
      container.innerHTML = '';
      for (let i = 0; i < 80; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.animationDuration = `${4 + Math.random() * 6}s`;
        particle.style.animationDelay = `${Math.random() * 2}s`;
        container.appendChild(particle);
      }
    }
  }, []);

  const getBadge = (score) => {
    if (score === 5) return <Badge className="score-badge perfect">🏆 Perfect Score</Badge>;
    if (score >= 3) return <Badge className="score-badge good">👍 Good Job</Badge>;
    return <Badge className="score-badge practice">📚 Keep Practicing</Badge>;
  };

  const getBadgeText = (score) => {
    if (score === 5) return "🏆 Perfect Score";
    if (score >= 3) return "👍 Good Job";
    return "📚 Keep Practicing";
  };

  const generateFeedback = (score) => {
    if (score === 5) return "Outstanding! You've mastered this topic!";
    if (score >= 3) return "Well done! A bit more practice and you'll be perfect.";
    return "You're getting there! Keep learning and try again.";
  };

  const handleDownloadPDF = () => {
    setShowNameModal(true);
  };

  const generatePDFWithName = async () => {
    if (!studentName.trim()) {
      alert('Please enter your name');
      return;
    }
    
    setShowNameModal(false);
    await downloadPDF(studentName.trim());
    setStudentName('');
  };

  const downloadPDF = async (name) => {
    if (!summary) return;

    try {
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF();

      pdf.setFont('helvetica');
      
      // Header
      pdf.setFontSize(20);
      pdf.setTextColor(0, 102, 204);
      pdf.text('EduMath Quiz Summary', 20, 30);
      
      // Student Name
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Student: ${name}`, 20, 45);
      
      // Topic and Score
      pdf.setFontSize(16);
      pdf.text(`Topic: ${summary.topic}`, 20, 60);
      pdf.text(`Score: ${summary.score}/5 - ${getBadgeText(summary.score)}`, 20, 75);
      
      // Feedback
      pdf.setFontSize(12);
      pdf.text(`Feedback: ${generateFeedback(summary.score)}`, 20, 90);
      
      pdf.line(20, 100, 190, 100);
      
      // Questions and answers
      let yPosition = 115;
      const pageHeight = pdf.internal.pageSize.height;
      
      summary.results.forEach((result, index) => {
        if (yPosition > pageHeight - 60) {
          pdf.addPage();
          yPosition = 30;
        }
        
        pdf.setFontSize(12);
        pdf.setTextColor(0, 102, 204);
        pdf.text(`Question ${index + 1}:`, 20, yPosition);
        yPosition += 8;
        
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(10);
        const questionLines = pdf.splitTextToSize(result.question, 170);
        questionLines.forEach(line => {
          pdf.text(line, 20, yPosition);
          yPosition += 6;
        });
        yPosition += 3;
        
        pdf.text(`Your Answer: ${result.userAnswer}`, 20, yPosition);
        yPosition += 8;
        pdf.text(`Correct Answer: ${result.correctAnswer}`, 20, yPosition);
        yPosition += 8;
        
        if (result.isCorrect) {
          pdf.setTextColor(0, 128, 0);
          pdf.text('✓ Correct', 20, yPosition);
        } else {
          pdf.setTextColor(255, 0, 0);
          pdf.text('✗ Incorrect', 20, yPosition);
        }
        pdf.setTextColor(0, 0, 0);
        yPosition += 15;
      });
      
      const currentDate = new Date().toLocaleDateString();
      pdf.setFontSize(8);
      pdf.setTextColor(128, 128, 128);
      pdf.text(`Generated on ${currentDate} by EduMath`, 20, pageHeight - 20);
      
      pdf.save(`${name.replace(/\s+/g, '-')}-${summary.topic}-quiz-summary.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      downloadText();
    }
  };

  const downloadText = () => {
    const text = summary.results.map((r, i) =>
      `Q${i + 1}: ${r.question}\nYour Answer: ${r.userAnswer}\nCorrect Answer: ${r.correctAnswer}\n${r.isCorrect ? '✅ Correct' : '❌ Incorrect'}\n`
    ).join('\n') + `\n\nScore: ${summary.score}/5\nFeedback: ${generateFeedback(summary.score)}`;

    const blob = new Blob([text], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quiz-summary.txt';
    a.click();
  };

  const getScoreColor = (score) => {
    if (score === 5) return '#10b981'; // emerald-500
    if (score >= 3) return '#3b82f6'; // blue-500
    return '#f59e0b'; // amber-500
  };

  return (
    <>
      <Head>
        <title>Quiz Summary - EduMath</title>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css" rel="stylesheet" />
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
      </Head>

      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
          color: #f8fafc;
          min-height: 100vh;
          overflow-x: hidden;
          position: relative;
        }

        /* Enhanced Particle System */
        .particles {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }

        .particle {
          position: absolute;
          background: linear-gradient(45deg, #3b82f6, #8b5cf6, #06b6d4);
          border-radius: 50%;
          animation: particleFloat 8s ease-in-out infinite;
        }

        .particle:nth-child(odd) {
          width: 3px;
          height: 3px;
          opacity: 0.4;
        }

        .particle:nth-child(even) {
          width: 2px;
          height: 2px;
          opacity: 0.6;
        }

        .particle:nth-child(3n) {
          width: 4px;
          height: 4px;
          opacity: 0.3;
          background: linear-gradient(45deg, #f59e0b, #ef4444);
        }

        @keyframes particleFloat {
          0%, 100% { 
            transform: translateY(0px) translateX(0px) rotate(0deg) scale(1);
            opacity: 0.4;
          }
          25% {
            transform: translateY(-30px) translateX(10px) rotate(90deg) scale(1.2);
            opacity: 0.8;
          }
          50% { 
            transform: translateY(-15px) translateX(-15px) rotate(180deg) scale(0.8);
            opacity: 0.6;
          }
          75% {
            transform: translateY(-40px) translateX(20px) rotate(270deg) scale(1.1);
            opacity: 0.7;
          }
        }

        /* Modern Navbar */
        .navbar {
          background: rgba(15, 23, 42, 0.9) !important;
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(59, 130, 246, 0.2);
          padding: 1.2rem 0;
          position: fixed !important;
          top: 0;
          width: 100%;
          z-index: 1000;
          transition: all 0.3s ease;
        }

        .navbar:hover {
          background: rgba(15, 23, 42, 0.95) !important;
          border-bottom: 1px solid rgba(59, 130, 246, 0.4);
        }

        .navbar-brand {
          font-weight: 800;
          font-size: 1.8rem;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6, #06b6d4);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          transition: all 0.3s ease;
          text-decoration: none !important;
        }

        .navbar-brand:hover {
          transform: scale(1.05);
          filter: brightness(1.2);
        }

        .navbar-brand i {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-right: 0.5rem;
        }

        /* Main Content */
        .main-container {
          position: relative;
          z-index: 10;
          padding-top: 8rem;
          min-height: 100vh;
        }

        /* Header Section */
        .summary-header {
          text-align: center;
          margin-bottom: 3rem;
          animation: slideInFromTop 0.8s ease-out;
        }

        .summary-title {
          font-size: 3rem;
          font-weight: 800;
          background: linear-gradient(135deg, #f8fafc, #e2e8f0);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 1rem;
          text-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);
        }

        .score-section {
          background: rgba(30, 41, 59, 0.4);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 20px;
          padding: 2rem;
          margin: 2rem auto;
          max-width: 600px;
          animation: slideInFromBottom 0.8s ease-out 0.2s both;
        }

        .score-display {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        }

        .score-badge {
          font-size: 1.1rem;
          padding: 0.8rem 1.5rem;
          border-radius: 50px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border: none;
          margin: 0 0.5rem;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
        }

        .score-badge.perfect {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
        }

        .score-badge.good {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
        }

        .score-badge.practice {
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: white;
          box-shadow: 0 8px 25px rgba(245, 158, 11, 0.4);
        }

        .score-badge:hover {
          transform: translateY(-2px) scale(1.05);
          filter: brightness(1.1);
        }

        .feedback-text {
          font-size: 1.2rem;
          color: #cbd5e0;
          font-weight: 500;
          margin-top: 1rem;
          opacity: 0.9;
        }

        /* Question Cards */
        .questions-grid {
          display: grid;
          gap: 2rem;
          margin: 3rem 0;
        }

        .question-card {
          background: rgba(30, 41, 59, 0.3);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(59, 130, 246, 0.15);
          border-radius: 20px;
          padding: 2rem;
          transition: all 0.4s ease;
          position: relative;
          overflow: hidden;
          opacity: 0;
          transform: translateY(30px);
        }

        .question-card.animate {
          animation: slideInCard 0.6s ease-out forwards;
        }

        .question-card:nth-child(1) { animation-delay: 0.1s; }
        .question-card:nth-child(2) { animation-delay: 0.2s; }
        .question-card:nth-child(3) { animation-delay: 0.3s; }
        .question-card:nth-child(4) { animation-delay: 0.4s; }
        .question-card:nth-child(5) { animation-delay: 0.5s; }

        .question-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6, #06b6d4);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .question-card:hover {
          transform: translateY(-8px);
          border-color: rgba(59, 130, 246, 0.4);
          box-shadow: 0 20px 40px rgba(59, 130, 246, 0.1);
        }

        .question-card:hover::before {
          opacity: 1;
        }

        .question-card.correct {
          border-color: rgba(16, 185, 129, 0.3);
          background: rgba(16, 185, 129, 0.05);
        }

        .question-card.correct::before {
          background: linear-gradient(90deg, #10b981, #059669);
        }

        .question-card.incorrect {
          border-color: rgba(239, 68, 68, 0.3);
          background: rgba(239, 68, 68, 0.05);
        }

        .question-card.incorrect::before {
          background: linear-gradient(90deg, #ef4444, #dc2626);
        }

        .question-number {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: white;
          border-radius: 50%;
          font-weight: 700;
          font-size: 1.1rem;
          margin-bottom: 1rem;
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
        }

        .question-text {
          font-size: 1.1rem;
          font-weight: 600;
          color: #f8fafc;
          margin-bottom: 1.5rem;
          line-height: 1.6;
        }

        .answer-section {
          display: grid;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .answer-item {
          padding: 1rem;
          border-radius: 12px;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .your-answer {
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.3);
          color: #93c5fd;
        }

        .correct-answer {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #6ee7b7;
        }

        .result-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.8rem 1.2rem;
          border-radius: 50px;
          font-weight: 600;
          font-size: 1rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .result-correct {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
        }

        .result-incorrect {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
        }

        /* Action Buttons */
        .action-buttons {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin: 3rem 0;
          flex-wrap: wrap;
          animation: fadeInUp 0.8s ease-out 0.6s both;
        }

        .action-btn {
          padding: 1rem 2rem;
          border-radius: 50px;
          font-weight: 600;
          font-size: 1rem;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          min-width: 180px;
          justify-content: center;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .btn-download {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
        }

        .btn-home {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
        }

        .btn-restart {
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          color: white;
          box-shadow: 0 8px 25px rgba(139, 92, 246, 0.3);
        }

        .action-btn:hover {
          transform: translateY(-3px) scale(1.05);
          filter: brightness(1.1);
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.2);
        }

        /* Modal Styling */
        .modal-content {
          background: rgba(30, 41, 59, 0.95) !important;
          backdrop-filter: blur(20px);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 20px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
        }

        .modal-header {
          border-bottom: 1px solid rgba(59, 130, 246, 0.2);
          padding: 1.5rem 2rem;
        }

        .modal-title {
          font-weight: 700;
          font-size: 1.3rem;
          color: #f8fafc !important;
        }

        .modal-title i {
          color: #3b82f6 !important;
        }

        .modal-body {
          padding: 2rem;
        }

        .form-label {
          color: #cbd5e0 !important;
          font-weight: 600;
          margin-bottom: 0.8rem;
        }

        .form-label i {
          color: #3b82f6 !important;
        }

        .form-control {
          background: rgba(15, 23, 42, 0.6) !important;
          border: 2px solid rgba(59, 130, 246, 0.3) !important;
          border-radius: 12px;
          color: #f8fafc !important;
          padding: 1rem;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .form-control:focus {
          border-color: rgba(59, 130, 246, 0.6) !important;
          box-shadow: 0 0 0 0.2rem rgba(59, 130, 246, 0.25) !important;
          background: rgba(15, 23, 42, 0.8) !important;
        }

        .modal-footer {
          border-top: 1px solid rgba(59, 130, 246, 0.2);
          padding: 1.5rem 2rem;
          gap: 1rem;
        }

        /* Animations */
        @keyframes slideInFromTop {
          from {
            opacity: 0;
            transform: translateY(-50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInFromBottom {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInCard {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Loading State */
        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 60vh;
          flex-direction: column;
          gap: 2rem;
        }

        .loading-spinner {
          width: 60px;
          height: 60px;
          border: 4px solid rgba(59, 130, 246, 0.2);
          border-left: 4px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .loading-text {
          font-size: 1.2rem;
          color: #cbd5e0;
          font-weight: 500;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .summary-title {
            font-size: 2.2rem;
          }
          
          .score-display {
            font-size: 2rem;
          }
          
          .action-buttons {
            flex-direction: column;
            align-items: center;
          }
          
          .action-btn {
            width: 100%;
            max-width: 300px;
          }
          
          .question-card {
            padding: 1.5rem;
          }
          
          .navbar-brand {
            font-size: 1.5rem;
          }
        }

        /* Accessibility */
        .question-card:focus {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }

        .action-btn:focus {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }

        /* Print Styles */
        @media print {
          .particles, .navbar, .action-buttons {
            display: none !important;
          }
          
          body {
            background: white !important;
            color: black !important;
          }
          
          .question-card {
            background: white !important;
            border: 1px solid #ccc !important;
            break-inside: avoid;
          }
        }
      `}</style>

      {/* Modern Navbar */}
      <nav className="navbar navbar-expand-lg">
        <div className="container">
          <a
          className="navbar-brand"
          role="button"
          style={{ cursor: 'pointer' }}
          onClick={() => router.push('/')}
        >
          <i className="fas fa-graduation-cap me-2"></i>EduMath
        </a>
        </div>
      </nav>

      {/* Enhanced Particle Background */}
      <div className="particles"></div>

      <div className="main-container">
        <Container>
          {summary ? (
            <>
              {/* Header Section */}
              <div className="summary-header">
                <h1 className="summary-title">
                  {summary.topic} Quiz Summary
                </h1>
              </div>

              {/* Score Section */}
              <div className="score-section">
                <div className="score-display" style={{ color: getScoreColor(summary.score) }}>
                  Score: {summary.score}/5
                </div>
                <div className="text-center">
                  {getBadge(summary.score)}
                </div>
                <div className="feedback-text">
                  {generateFeedback(summary.score)}
                </div>
              </div>

              {/* Questions Grid */}
              <div className="questions-grid">
                {summary.results.map((result, index) => (
                  <div 
                    key={index} 
                    className={`question-card ${result.isCorrect ? 'correct' : 'incorrect'} ${animateCards ? 'animate' : ''}`}
                  >
                    <div className="question-number">
                      {index + 1}
                    </div>
                    
                    <div className="question-text">
                      {result.question}
                    </div>
                    
                    <div className="answer-section">
                      <div className="answer-item your-answer">
                        <strong>Your Answer:</strong> {result.userAnswer}
                      </div>
                      <div className="answer-item correct-answer">
                        <strong>Correct Answer:</strong> {result.correctAnswer}
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <span className={`result-badge ${result.isCorrect ? 'result-correct' : 'result-incorrect'}`}>
                        {result.isCorrect ? (
                          <>
                            <i className="fas fa-check-circle"></i>
                            Correct
                          </>
                        ) : (
                          <>
                            <i className="fas fa-times-circle"></i>
                            Incorrect
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="action-buttons">
                <button className="action-btn btn-download" onClick={handleDownloadPDF}>
                  <i className="fas fa-download"></i>
                  Download PDF
                </button>
                <button 
                  className="action-btn btn-home" 
                  onClick={() => router.push('/')}
                >
                  <i className="fas fa-home"></i>
                  Home
                </button>
                <button 
                  className="action-btn btn-restart" 
                  onClick={() => router.push('/select-topic')}
                >
                  <i className="fas fa-redo"></i>
                  Restart Lesson
                </button>
              </div>

              {/* Enhanced Name Input Modal */}
              <Modal 
                show={showNameModal} 
                onHide={() => setShowNameModal(false)} 
                centered
                backdrop="static"
              >
                <Modal.Header closeButton>
                  <Modal.Title>
                    <i className="fas fa-user-graduate me-2"></i>
                    Enter Your Name
                  </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <Form.Group>
                    <Form.Label>
                      <i className="fas fa-user me-2"></i>
                      Student Name:
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter your full name"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          generatePDFWithName();
                        }
                      }}
                      autoFocus
                    />
                  </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => setShowNameModal(false)}
                    className="action-btn"
                  >
                    <i className="fas fa-times me-2"></i>
                    Cancel
                  </Button>
                  <Button 
                    variant="success" 
                    onClick={generatePDFWithName}
                    className="action-btn btn-download"
                  >
                    <i className="fas fa-file-pdf me-2"></i>
                    Generate PDF
                  </Button>
                </Modal.Footer>
              </Modal>
            </>
          ) : (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <div className="loading-text">
                <i className="fas fa-chart-line me-2"></i>
                Loading your quiz summary...
              </div>
            </div>
          )}
        </Container>
      </div>
    </>
  );
}