// pages/slides.js
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Head from 'next/head';
import { Spinner, Container, Button } from 'react-bootstrap';
import dynamic from 'next/dynamic';

// Dynamically import Swiper with modules
const Swiper = dynamic(() => import('swiper/react').then(mod => mod.Swiper), { ssr: false });
const SwiperSlide = dynamic(() => import('swiper/react').then(mod => mod.SwiperSlide), { ssr: false });

// Import Swiper modules at the top level
import { Navigation, Pagination, A11y } from 'swiper/modules';

// Dynamically import framer-motion
const motion = dynamic(() => import('framer-motion').then(mod => mod.motion), { ssr: false });
const AnimatePresence = dynamic(() => import('framer-motion').then(mod => mod.AnimatePresence), { ssr: false });

export default function Slides() {
  const router = useRouter();
  const { topic } = router.query;
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const slidesRef = useRef();
  const swiperRef = useRef();

  // Ensure we're on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Enhanced particle system - only on client
  useEffect(() => {
    if (!isClient) return;
    
    const container = document.querySelector('.particles');
    if (!container) return;

    const colors = ['#3182ce', '#805ad5', '#38a169', '#e53e3e', '#dd6b20'];
    
    for (let i = 0; i < 80; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      particle.style.animationDuration = `${4 + Math.random() * 6}s`;
      particle.style.animationDelay = `${Math.random() * 2}s`;
      particle.style.background = colors[Math.floor(Math.random() * colors.length)];
      particle.style.transform = `scale(${0.5 + Math.random() * 0.8})`;
      container.appendChild(particle);
    }

    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [isClient]);

  useEffect(() => {
    if (topic) {
      setIsGenerating(true);
      axios.post('/api/gemini', {
        prompt: `Create an engaging educational presentation about "${topic}" for primary school students. Generate exactly 4-5 slides with:
        - Slide 1: Introduction with a fun hook
        - Slides 2-4: Core concepts broken down simply
        - Final slide: Fun summary or conclusion
        
        Format each slide with:
        - A catchy, emoji-enhanced title
        - 3-4 clear bullet points
        - Simple language appropriate for children
        
        Make it educational but exciting!`,
      }).then(res => {
        const rawText = res.data.candidates[0].content.parts[0].text;
        const rawSlides = rawText.split(/\n\s*\n/).map(s => s.trim()).filter(Boolean);

        const formattedSlides = rawSlides.map((slide, index) => {
          const lines = slide.split('\n').map(l => l.trim()).filter(Boolean);
          let title = lines.length > 0 ? lines[0].replace(/^(\*+|\-+|\#+)?\s*/, '') : `Slide ${index + 1}`;
          
          // Add emojis if not present
          if (!/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/u.test(title)) {
            const emojis = ['🌟', '🚀', '💡', '🎯', '⭐', '🔥', '💫', '🎉'];
            title = `${emojis[index % emojis.length]} ${title}`;
          }
          
          const bullets = lines.slice(1).map(line =>
            line ? line.replace(/^(\*+|\-+|\•)?\s*/, '') : ''
          ).filter(Boolean);
          
          return { title, bullets };
        });

        // Add a spectacular ending slide
        formattedSlides.push({ 
          title: "🎉 Amazing! You've Learned So Much!", 
          bullets: [
            "🏆 You're now a " + topic + " expert!",
            "🌟 Keep exploring and learning",
            "🚀 Ready for your next adventure?"
          ]
        });

        setSlides(formattedSlides);
        setLoading(false);
        setIsGenerating(false);
      }).catch(err => {
        console.error(err);
        setLoading(false);
        setIsGenerating(false);
      });
    }
  }, [topic]);

  const handleDownloadPDF = async () => {
    if (!slides.length || !isClient) return;
    
    setIsGenerating(true);
    
    try {
      // Dynamically import html2pdf only when needed
      const html2pdf = (await import('html2pdf.js')).default;
      
      // Create a clean PDF version of slides
      const printWindow = window.open('', '_blank');
      
      const pdfContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>${topic} Slides</title>
          <style>
            body {
              margin: 0;
              padding: 20px;
              font-family: 'Inter', 'Arial', sans-serif;
              background: white;
              color: #333;
            }
            .slide {
              page-break-after: always;
              padding: 40px;
              min-height: 700px;
              margin-bottom: 20px;
              border-radius: 15px;
              display: flex;
              flex-direction: column;
              justify-content: center;
              position: relative;
            }
            .slide:last-child {
              page-break-after: avoid;
            }
            h1 {
              text-align: center;
              font-size: 36px;
              font-weight: bold;
              margin-bottom: 40px;
              color: white;
              text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            }
            ul {
              list-style: none;
              padding: 0;
              font-size: 24px;
              line-height: 1.8;
            }
            li {
              margin-bottom: 20px;
              padding-left: 30px;
              color: white;
              position: relative;
            }
            li::before {
              content: "✨";
              position: absolute;
              left: 0;
              font-size: 20px;
            }
            .slide-1 { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
            .slide-2 { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
            .slide-3 { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
            .slide-4 { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }
            .slide-5 { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); }
            .slide-6 { background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); }
            .slide-7 { background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%); }
          </style>
        </head>
        <body>
          ${slides.map((slide, index) => `
            <div class="slide slide-${(index % 7) + 1}">
              <h1>${slide.title}</h1>
              <ul>
                ${slide.bullets.filter(bullet => bullet.trim()).map(bullet => `
                  <li>${bullet}</li>
                `).join('')}
              </ul>
            </div>
          `).join('')}
        </body>
        </html>
      `;
      
      printWindow.document.write(pdfContent);
      printWindow.document.close();
      
      // Wait for content to load, then print
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }, 500);
      
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const slideVariants = {
    enter: { opacity: 0, scale: 0.8, rotateY: 90 },
    center: { opacity: 1, scale: 1, rotateY: 0 },
    exit: { opacity: 0, scale: 0.8, rotateY: -90 }
  };

  const getSlideGradient = (index) => {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    ];
    return gradients[index % gradients.length];
  };

  // Fallback component for SSR
  const StaticSlide = ({ slide, index }) => (
    <div
      className="slide-content"
      style={{ 
        background: getSlideGradient(index),
        color: '#ffffff'
      }}
    >
      <h3 className="slide-title">{slide.title}</h3>
      <ul className="slide-bullets">
        {slide.bullets.map((bullet, i) => (
          <li key={i}>{bullet}</li>
        ))}
      </ul>
    </div>
  );

  return (
    <>
      <Head>
        <title>{topic} Slides - EduMath</title>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css" rel="stylesheet" />
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        {/* Only load Swiper CSS on client side */}
        {isClient && (
          <>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/Swiper/8.4.7/swiper-bundle.min.css" />
          </>
        )}
      </Head>

      <style jsx global>{`
        body {
          font-family: 'Inter', sans-serif;
          background: linear-gradient(135deg, #0f1419 0%, #1a202c 100%);
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
          z-index: -1;
          overflow: hidden;
        }
        
        .particle {
          position: absolute;
          border-radius: 50%;
          opacity: 0.7;
          animation: magical-float 8s ease-in-out infinite;
          box-shadow: 0 0 20px currentColor;
        }
        
        .particle:nth-child(odd) {
          width: 6px;
          height: 6px;
        }
        
        .particle:nth-child(even) {
          width: 4px;
          height: 4px;
        }
        
        @keyframes magical-float {
          0%, 100% { 
            transform: translateY(0px) translateX(0px) rotate(0deg) scale(1); 
            opacity: 0.7;
          }
          25% { 
            transform: translateY(-30px) translateX(20px) rotate(90deg) scale(1.2); 
            opacity: 1;
          }
          50% { 
            transform: translateY(-60px) translateX(-10px) rotate(180deg) scale(0.8); 
            opacity: 0.5;
          }
          75% { 
            transform: translateY(-30px) translateX(-25px) rotate(270deg) scale(1.1); 
            opacity: 0.9;
          }
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
        
        .slides-container {
          background: rgba(45, 55, 72, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 25px;
          box-shadow: 
            0 25px 50px rgba(0, 0, 0, 0.3),
            0 0 0 1px rgba(255, 255, 255, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .slide-content {
          border-radius: 20px;
          padding: 3rem;
          min-height: 400px;
          position: relative;
          overflow: hidden;
          box-shadow: 
            0 15px 35px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
          margin-bottom: 2rem;
        }
        
        .slide-content::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          pointer-events: none;
        }
        
        .slide-title {
          font-size: 2.5rem;
          font-weight: 800;
          text-align: center;
          margin-bottom: 2rem;
          text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.3);
          position: relative;
          z-index: 2;
        }
        
        .slide-bullets {
          list-style: none;
          padding: 0;
          position: relative;
          z-index: 2;
        }
        
        .slide-bullets li {
          font-size: 1.3rem;
          line-height: 1.8;
          margin-bottom: 1.5rem;
          padding-left: 2rem;
          position: relative;
          opacity: 0;
          animation: slide-in 0.6s ease forwards;
        }
        
        .slide-bullets li:nth-child(1) { animation-delay: 0.2s; }
        .slide-bullets li:nth-child(2) { animation-delay: 0.4s; }
        .slide-bullets li:nth-child(3) { animation-delay: 0.6s; }
        .slide-bullets li:nth-child(4) { animation-delay: 0.8s; }
        
        .slide-bullets li::before {
          content: '✨';
          position: absolute;
          left: 0;
          top: 0;
          font-size: 1.2rem;
          animation: sparkle 2s ease-in-out infinite;
        }
        
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes sparkle {
          0%, 100% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.2) rotate(360deg); }
        }
        
        .swiper {
          padding: 2rem !important;
        }
        
        .swiper-button-next,
        .swiper-button-prev {
          color: rgba(255, 255, 255, 0.8) !important;
          background: rgba(255, 255, 255, 0.1) !important;
          border-radius: 50% !important;
          width: 50px !important;
          height: 50px !important;
          margin-top: -25px !important;
          backdrop-filter: blur(10px) !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          transition: all 0.3s ease !important;
        }
        
        .swiper-button-next:hover,
        .swiper-button-prev:hover {
          background: rgba(255, 255, 255, 0.2) !important;
          transform: scale(1.1) !important;
        }
        
        .swiper-pagination-bullet {
          background: rgba(255, 255, 255, 0.5) !important;
          opacity: 1 !important;
          margin: 0 8px !important;
          transition: all 0.3s ease !important;
        }
        
        .swiper-pagination-bullet-active {
          background: #667eea !important;
          transform: scale(1.3) !important;
          box-shadow: 0 0 20px rgba(102, 126, 234, 0.6) !important;
        }
        
        .magic-button {
          background: linear-gradient(45deg, #667eea, #764ba2) !important;
          border: none !important;
          border-radius: 15px !important;
          padding: 15px 30px !important;
          font-weight: 600 !important;
          font-size: 1.1rem !important;
          position: relative !important;
          overflow: hidden !important;
          transition: all 0.3s ease !important;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2) !important;
        }
        
        .magic-button:hover {
          transform: translateY(-3px) !important;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3) !important;
        }
        
        .magic-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transition: left 0.6s ease;
        }
        
        .magic-button:hover::before {
          left: 100%;
        }
        
        .loading-spinner {
          background: rgba(45, 55, 72, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 3rem;
          text-align: center;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .progress-indicator {
          position: absolute;
          top: 20px;
          right: 30px;
          background: rgba(255, 255, 255, 0.9);
          color: #2d3748;
          padding: 10px 20px;
          border-radius: 25px;
          font-size: 1rem;
          font-weight: 600;
          backdrop-filter: blur(10px);
          border: 2px solid rgba(102, 126, 234, 0.3);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        .static-slides {
          max-height: 60vh;
          overflow-y: auto;
          padding: 1rem;
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
        <div className="slides-container" style={{ width: '100%', maxWidth: '900px', padding: '2.5rem', position: 'relative' }}>
          {/* Title with conditional animation */}
          {isClient && motion ? (
            <motion.h2 
              className="text-center mb-4" 
              style={{ color: '#ffffff', fontSize: '2.2rem', fontWeight: '700' }}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              ✨ {topic} - Interactive Learning Journey ✨
            </motion.h2>
          ) : (
            <h2 className="text-center mb-4" style={{ color: '#ffffff', fontSize: '2.2rem', fontWeight: '700' }}>
              ✨ {topic} - Interactive Learning Journey ✨
            </h2>
          )}
          
          {slides.length > 0 && (
            <div className="progress-indicator">
              <i className="fas fa-chart-line me-2"></i>
              {currentSlide + 1} / {slides.length}
            </div>
          )}
          
          {loading ? (
            <div className="loading-spinner">
              <Spinner animation="border" variant="primary" size="lg" />
              <div className="mt-3">
                <h4>🎨 Creating Your Amazing Slides...</h4>
                <p>Preparing an incredible learning experience!</p>
              </div>
            </div>
          ) : (
            <>
              {/* Conditional rendering based on client availability */}
              {isClient && Swiper && SwiperSlide ? (
                <Swiper
                  ref={swiperRef}
                  modules={[Navigation, Pagination, A11y]}
                  spaceBetween={30}
                  slidesPerView={1}
                  navigation
                  pagination={{ clickable: true }}
                  onSlideChange={(swiper) => setCurrentSlide(swiper.activeIndex)}
                  style={{ padding: '1rem' }}
                >
                  {slides.map((slide, index) => (
                    <SwiperSlide key={index}>
                      {motion ? (
                        <motion.div
                          className="slide-content"
                          style={{ 
                            background: getSlideGradient(index),
                            color: '#ffffff'
                          }}
                          variants={slideVariants}
                          initial="enter"
                          animate="center"
                          exit="exit"
                          transition={{ duration: 0.6, ease: 'easeInOut' }}
                        >
                          <h3 className="slide-title">{slide.title}</h3>
                          <ul className="slide-bullets">
                            {slide.bullets.map((bullet, i) => (
                              <motion.li 
                                key={i}
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.2, duration: 0.6 }}
                              >
                                {bullet}
                              </motion.li>
                            ))}
                          </ul>
                        </motion.div>
                      ) : (
                        <StaticSlide slide={slide} index={index} />
                      )}
                    </SwiperSlide>
                  ))}
                </Swiper>
              ) : (
                // Fallback static slides for SSR
                <div className="static-slides">
                  {slides.map((slide, index) => (
                    <StaticSlide key={index} slide={slide} index={index} />
                  ))}
                </div>
              )}

              <div className="d-grid gap-3 mt-4">
                <Button 
                  className="magic-button"
                  onClick={() => router.push(`/quiz?topic=${topic}`)}
                  disabled={isGenerating}
                >
                  <i className="fas fa-brain me-2"></i>
                  Take Interactive Quiz
                </Button>
                
                <div className="row g-3">
                  <div className="col-md-6">
                    <Button 
                      className="magic-button w-100"
                      style={{ background: 'linear-gradient(45deg, #38a169, #2f855a) !important' }}
                      onClick={handleDownloadPDF}
                      disabled={isGenerating || !isClient}
                    >
                      {isGenerating ? (
                        <>
                          <Spinner size="sm" className="me-2" />
                          Generating PDF...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-download me-2"></i>
                          Download Slides
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="col-md-6">
                    <Button 
                      className="magic-button w-100"
                      style={{ background: 'linear-gradient(45deg, #4a5568, #2d3748) !important' }}
                      onClick={() => router.push('/select-topic')}
                      disabled={isGenerating}
                    >
                      <i className="fas fa-arrow-left me-2"></i>
                      New Topic
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </Container>
    </>
  );
}