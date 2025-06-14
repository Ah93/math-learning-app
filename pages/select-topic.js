// pages/select-topic.js
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { Container, Button, Row, Col, Card } from 'react-bootstrap';

export default function SelectTopic() {
  const [selectedTopic, setSelectedTopic] = useState('Addition');
  const router = useRouter();

  const topics = [
    {
      name: 'Addition',
      icon: '➕',
      description: 'Learn to add numbers together',
      color: '#22c55e',
      bgGradient: 'linear-gradient(135deg, #22c55e, #16a34a)'
    },
    {
      name: 'Subtraction',
      icon: '➖',
      description: 'Master taking numbers away',
      color: '#ef4444',
      bgGradient: 'linear-gradient(135deg, #ef4444, #dc2626)'
    },
    {
      name: 'Multiplication',
      icon: '✖️',
      description: 'Discover repeated addition',
      color: '#8b5cf6',
      bgGradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
    },
    {
      name: 'Division',
      icon: '➗',
      description: 'Learn to split numbers equally',
      color: '#f59e0b',
      bgGradient: 'linear-gradient(135deg, #f59e0b, #d97706)'
    }
  ];

  useEffect(() => {
    const container = document.querySelector('.particles');
    if (!container) return;

    container.innerHTML = '';
    for (let i = 0; i < 50; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      particle.style.animationDuration = `${3 + Math.random() * 3}s`;
      container.appendChild(particle);
    }
  }, []);

  const handleTopicSelect = (topicName) => {
    setSelectedTopic(topicName);
  };

  const handleStart = () => {
    router.push(`/slides?topic=${selectedTopic}`);
  };

  return (
    <>
      <Head>
        <title>Select Topic - EduMath</title>
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css"
          rel="stylesheet"
        />
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <style jsx global>{`
        body {
          font-family: 'Inter', sans-serif;
          background: linear-gradient(135deg, #0f1419 0%, #1a202c 100%);
          color: #e2e8f0;
          overflow-x: hidden;
        }
        .particles {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: -1;
        }
        .particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: #3182ce;
          border-radius: 50%;
          opacity: 0.6;
          animation: float 6s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        .navbar {
          background: rgba(15, 20, 25, 0.95) !important;
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding: 1rem 0;
        }
        .navbar-brand {
          font-weight: 700;
          font-size: 1.5rem;
          background: linear-gradient(45deg, #3182ce, #805ad5);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .topic-card {
          background: rgba(45, 55, 72, 0.8);
          border: 2px solid transparent;
          border-radius: 16px;
          padding: 1.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
          height: 100%;
        }
        .topic-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }
        .topic-card.selected {
          border-color: #3182ce;
          background: rgba(49, 130, 206, 0.1);
          box-shadow: 0 0 30px rgba(49, 130, 206, 0.3);
        }
        .topic-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          display: block;
          text-align: center;
        }
        .topic-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          text-align: center;
          color: #ffffff;
        }
        .topic-description {
          font-size: 0.9rem;
          color: #cbd5e0;
          text-align: center;
          margin-bottom: 0;
        }
        .start-button {
          background: linear-gradient(135deg, #3182ce, #805ad5);
          border: none;
          padding: 0.75rem 2rem;
          font-size: 1.1rem;
          font-weight: 600;
          border-radius: 12px;
          transition: all 0.3s ease;
        }
        .start-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(49, 130, 206, 0.4);
        }
        .main-title {
          font-size: 2.5rem;
          font-weight: 700;
          text-align: center;
          margin-bottom: 0.5rem;
          background: linear-gradient(45deg, #3182ce, #805ad5);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .subtitle {
          text-align: center;
          color: #94a3b8;
          margin-bottom: 3rem;
          font-size: 1.1rem;
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
        </div>
      </nav>

      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', paddingTop: '6rem' }}>
        <div style={{ width: '100%', maxWidth: '900px' }}>
          <h1 className="main-title">Choose Your Math Adventure</h1>
          <p className="subtitle">Select a topic to begin your learning journey</p>
          
          <Row className="g-4 mb-5">
            {topics.map((topic, index) => (
              <Col key={index} xs={12} sm={6} lg={3}>
                <div
                  className={`topic-card ${selectedTopic === topic.name ? 'selected' : ''}`}
                  onClick={() => handleTopicSelect(topic.name)}
                >
                  <div className="topic-icon">{topic.icon}</div>
                  <h3 className="topic-title">{topic.name}</h3>
                  <p className="topic-description">{topic.description}</p>
                </div>
              </Col>
            ))}
          </Row>

          <div className="text-center">
            <div className="mb-3">
              <span style={{ color: '#cbd5e0', fontSize: '1.1rem' }}>
                Selected: <strong style={{ color: '#ffffff' }}>{selectedTopic}</strong>
              </span>
            </div>
            <Button 
              className="start-button me-3" 
              onClick={handleStart}
              size="lg"
            >
              🚀 Start Learning {selectedTopic}
            </Button>
            <Button 
              variant="outline-secondary" 
              onClick={() => router.push(`/`)}
              size="lg"
              style={{ 
                borderColor: '#4a5568', 
                color: '#cbd5e0',
                borderRadius: '12px'
              }}
            >
              ← Back to Home
            </Button>
          </div>
        </div>
      </Container>
    </>
  );
}