import { useRouter } from 'next/router';
import Head from 'next/head';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();

  // Generate random particles and math symbols once page is mounted
  useEffect(() => {
    const container = document.querySelector('.particles');
    const mathContainer = document.querySelector('.math-background');
    if (!container || !mathContainer) return;

    // Generate floating particles
    for (let i = 0; i < 50; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      particle.style.animationDuration = `${3 + Math.random() * 3}s`;
      particle.style.animationDelay = `${Math.random() * 2}s`;
      container.appendChild(particle);
    }

    // Math symbols and equations to display
    const mathSymbols = [
      '2 + 3 = 5', '8 × 7 = 56', '15 ÷ 3 = 5', '12 - 4 = 8',
      '∑', '∏', '∫', '√', 'π', '∞', '△', '∠',
      '9 + 6 = 15', '24 ÷ 4 = 6', '5 × 9 = 45', '20 - 7 = 13',
      'x²', 'y = mx + b', 'a² + b² = c²', 'f(x)',
      '45°', '90°', '180°', '360°',
      '3.14', '2.71', '1.618', '0.618'
    ];

    // Generate floating math symbols
    for (let i = 0; i < 30; i++) {
      const mathElement = document.createElement('div');
      mathElement.className = 'math-symbol';
      mathElement.textContent = mathSymbols[Math.floor(Math.random() * mathSymbols.length)];
      mathElement.style.left = `${Math.random() * 100}%`;
      mathElement.style.top = `${Math.random() * 100}%`;
      mathElement.style.animationDuration = `${8 + Math.random() * 12}s`;
      mathElement.style.animationDelay = `${Math.random() * 5}s`;
      mathElement.style.fontSize = `${0.8 + Math.random() * 0.8}rem`;
      mathContainer.appendChild(mathElement);
    }

    // Generate geometric shapes
    for (let i = 0; i < 15; i++) {
      const shape = document.createElement('div');
      const shapeTypes = ['circle', 'triangle', 'square'];
      const shapeType = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
      shape.className = `geometric-shape ${shapeType}`;
      shape.style.left = `${Math.random() * 100}%`;
      shape.style.top = `${Math.random() * 100}%`;
      shape.style.animationDuration = `${10 + Math.random() * 10}s`;
      shape.style.animationDelay = `${Math.random() * 3}s`;
      mathContainer.appendChild(shape);
    }
  }, []);

  return (
    <>
      <Head>
        <title>EduMath - Transform Your Learning Journey</title>
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
        :root {
          --primary-dark: #0f1419;
          --secondary-dark: #1a202c;
          --accent-blue: #3182ce;
          --accent-purple: #805ad5;
          --accent-green: #48bb78;
          --accent-orange: #ed8936;
          --text-light: #e2e8f0;
          --text-muted: #a0aec0;
        }

        body {
          font-family: 'Inter', sans-serif;
          background: linear-gradient(135deg, var(--primary-dark) 0%, var(--secondary-dark) 100%);
          color: var(--text-light);
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

        .math-background {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: -2;
          overflow: hidden;
        }

        .particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: var(--accent-blue);
          border-radius: 50%;
          opacity: 0.6;
          animation: float 6s ease-in-out infinite;
        }

        .math-symbol {
          position: absolute;
          color: var(--accent-blue);
          font-weight: 500;
          opacity: 0.15;
          animation: mathFloat 20s linear infinite;
          font-family: 'Inter', monospace;
          user-select: none;
          white-space: nowrap;
        }

        .geometric-shape {
          position: absolute;
          opacity: 0.1;
          animation: shapeFloat 20s linear infinite;
        }

        .geometric-shape.circle {
          width: 30px;
          height: 30px;
          border: 2px solid var(--accent-purple);
          border-radius: 50%;
        }

        .geometric-shape.triangle {
          width: 0;
          height: 0;
          border-left: 15px solid transparent;
          border-right: 15px solid transparent;
          border-bottom: 26px solid var(--accent-green);
        }

        .geometric-shape.square {
          width: 25px;
          height: 25px;
          border: 2px solid var(--accent-orange);
          transform: rotate(45deg);
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
          }
        }

        @keyframes mathFloat {
          0% {
            transform: translateY(100vh) rotate(0deg);
            opacity: 0;
          }
          5% {
            opacity: 0.15;
          }
          95% {
            opacity: 0.15;
          }
          100% {
            transform: translateY(-100px) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes shapeFloat {
          0% {
            transform: translateY(100vh) rotate(0deg) scale(0.5);
            opacity: 0;
          }
          10% {
            opacity: 0.1;
          }
          90% {
            opacity: 0.1;
          }
          100% {
            transform: translateY(-100px) rotate(720deg) scale(1.2);
            opacity: 0;
          }
        }

        .navbar {
          background: rgba(15, 20, 25, 0.95) !important;
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding: 1rem 0;
          z-index: 1000;
        }

        .navbar-brand {
          font-weight: 700;
          font-size: 1.5rem;
          background: linear-gradient(45deg, var(--accent-blue), var(--accent-purple));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-section {
          min-height: 100vh;
          display: flex;
          align-items: center;
          position: relative;
          overflow: hidden;
          z-index: 10;
        }

        .hero-title {
          font-size: 3.5rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          background: linear-gradient(45deg, #ffffff, var(--accent-blue));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          line-height: 1.2;
          text-shadow: 0 0 30px rgba(49, 130, 206, 0.3);
        }

        .hero-subtitle {
          font-size: 1.25rem;
          color: var(--text-muted);
          margin-bottom: 2rem;
          max-width: 600px;
          backdrop-filter: blur(5px);
          padding: 1rem;
          border-radius: 10px;
          background: rgba(26, 32, 44, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .btn-get-started {
          background: linear-gradient(45deg, var(--accent-blue), var(--accent-purple));
          border: none;
          padding: 1rem 2.5rem;
          font-size: 1.1rem;
          font-weight: 600;
          border-radius: 50px;
          color: white;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
          box-shadow: 0 10px 30px rgba(49, 130, 206, 0.3);
          position: relative;
          overflow: hidden;
        }

        .btn-get-started::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s;
        }

        .btn-get-started:hover::before {
          left: 100%;
        }

        .btn-get-started:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 40px rgba(49, 130, 206, 0.4);
          color: white;
        }

        .hero-content {
          position: relative;
          z-index: 20;
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.5rem;
          }
          
          .student-image {
            opacity: 0.3;
            right: -20%;
          }
          
          .math-symbol {
            font-size: 0.7rem !important;
          }
        }
      `}</style>

      {/* Math Background */}
      <div className="math-background"></div>

      {/* Particles Background */}
      <div className="particles"></div>

      {/* Navbar */}
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

      {/* Hero Section */}
      <section id="home" className="hero-section">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 hero-content">
              <h1 className="hero-title">Learn Math with Confidence</h1>
              <p className="hero-subtitle">
                EduMath makes learning Addition, Subtraction, Multiplication, and Division fun and easy. Empower your journey with interactive lessons and smart feedback.
              </p>
              <button
                className="btn-get-started"
                onClick={() => router.push('/select-topic')}
              >
                <i className="fas fa-rocket me-2"></i>Get Started
              </button>
            </div>
          </div>
        </div>
        <div className="student-image"></div>
      </section>
    </>
  );
}