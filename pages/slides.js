// pages/slides.js
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Head from 'next/head';
import { Spinner, Container, Button } from 'react-bootstrap';
import dynamic from 'next/dynamic';

// Import Swiper modules and CSS - static imports work better with Vercel
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, A11y, EffectCoverflow } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';

// Safer dynamic import with proper error handling
const MotionDiv = dynamic(
  () => import('framer-motion').then((mod) => ({
    default: mod.motion.div
  })),
  { 
    ssr: false,
    loading: () => null
  }
);

// Create a wrapper component to handle motion safely
const AnimatedSlideWrapper = ({ children, motionEnabled, ...motionProps }) => {
  if (motionEnabled) {
    return <MotionDiv {...motionProps}>{children}</MotionDiv>;
  }
  return <div>{children}</div>;
};

export default function Slides() {
  const router = useRouter();
  const { topic } = router.query;
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [motionEnabled, setMotionEnabled] = useState(false);
  const swiperRef = useRef(null);

  // Client-side detection with better error handling
  useEffect(() => {
    setIsClient(true);
    
    // Safer framer-motion detection
    const checkMotion = async () => {
      try {
        await import('framer-motion');
        setMotionEnabled(true);
      } catch (error) {
        console.log('Framer Motion not available, using fallback animations');
        setMotionEnabled(false);
      }
    };
    
    checkMotion();
  }, []);

  // Enhanced particle system with better client-side check
  useEffect(() => {
    if (!isClient) return;
    
    const container = document.querySelector('.particles');
    if (!container) return;

    const colors = ['#3182ce', '#805ad5', '#38a169', '#e53e3e', '#dd6b20'];
    
    // Clear existing particles
    container.innerHTML = '';
    
    for (let i = 0; i < 80; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.cssText = `
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        animation-duration: ${4 + Math.random() * 6}s;
        animation-delay: ${Math.random() * 2}s;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        transform: scale(${0.5 + Math.random() * 0.8});
      `;
      container.appendChild(particle);
    }

    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [isClient]);

  // Fetch slides data with better error handling
  useEffect(() => {
    if (!topic) return;
    
    setIsGenerating(true);
    setLoading(true);
    
    const fetchSlides = async () => {
      try {
        const response = await axios.post('/api/gemini', {
          prompt: `Create an engaging educational presentation about "${topic}" for primary school students. Generate exactly 4-5 slides with:
          - Slide 1: Introduction with a fun hook
          - Slides 2-4: Core concepts broken down simply
          - Final slide: Fun summary or conclusion
          
          Format each slide with:
          - A catchy, emoji-enhanced title
          - 3-4 clear bullet points
          - Simple language appropriate for children
          
          Make it educational but exciting!`,
        });
        
        const rawText = response.data.candidates[0].content.parts[0].text;
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

        // Add conclusion slide
        formattedSlides.push({ 
          title: "🎉 Amazing! You've Learned So Much!", 
          bullets: [
            "🏆 You're now a " + topic + " expert!",
            "🌟 Keep exploring and learning",
            "🚀 Ready for your next adventure?"
          ]
        });

        setSlides(formattedSlides);
      } catch (error) {
        console.error('Error fetching slides:', error);
        // Fallback slides
        setSlides([{
          title: "📚 Welcome to " + topic,
          bullets: [
            "Let's explore this amazing topic together!",
            "Get ready for an exciting learning journey",
            "Each slide will teach you something new"
          ]
        }]);
      } finally {
        setLoading(false);
        setIsGenerating(false);
      }
    };

    fetchSlides();
  }, [topic]);

  const handleDownloadPDF = async () => {
    if (!slides.length || !isClient) return;
    
    setIsGenerating(true);
    
    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Pop-up blocked');
      }
      
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
            .slide:last-child { page-break-after: avoid; }
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
          </style>
        </head>
        <body>
          ${slides.map((slide, index) => `
            <div class="slide slide-${(index % 6) + 1}">
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

  // Enhanced slide component with safer motion handling
  const SlideContent = ({ slide, index }) => {
    const slideStyle = {
      background: getSlideGradient(index),
      color: '#ffffff',
      borderRadius: '20px',
      padding: '3rem',
      minHeight: '400px',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 15px 35px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
    };

    const slideContent = (
      <>
        <h3 className="slide-title">{slide.title}</h3>
        <ul className="slide-bullets">
          {slide.bullets.map((bullet, i) => (
            <li key={i}>{bullet}</li>
          ))}
        </ul>
      </>
    );

    if (motionEnabled && isClient) {
      return (
        <AnimatedSlideWrapper
          motionEnabled={true}
          className="slide-content"
          style={slideStyle}
          initial={{ opacity: 0, scale: 0.9, rotateY: 45 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          exit={{ opacity: 0, scale: 0.9, rotateY: -45 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {slideContent}
        </AnimatedSlideWrapper>
      );
    }

    // Fallback without motion
    return (
      <div className="slide-content" style={slideStyle}>
        {slideContent}
      </div>
    );
  };

  // Safer Swiper configuration
  const swiperOptions = {
    modules: [Navigation, Pagination, A11y, EffectCoverflow],
    spaceBetween: 30,
    slidesPerView: 1,
    navigation: {
      enabled: true,
    },
    pagination: { 
      clickable: true,
      dynamicBullets: true,
    },
    effect: 'coverflow',
    coverflowEffect: {
      rotate: 30,
      stretch: 0,
      depth: 100,
      modifier: 1,
      slideShadows: true,
    },
    loop: false,
    grabCursor: true,
    centeredSlides: true,
    onSlideChange: (swiper) => {
      if (swiper && typeof swiper.activeIndex !== 'undefined') {
        setCurrentSlide(swiper.activeIndex);
      }
    },
    breakpoints: {
      640: {
        slidesPerView: 1,
        spaceBetween: 20,
      },
      768: {
        slidesPerView: 1,
        spaceBetween: 30,
      },
    },
  };

  // Don't render until client-side
  if (!isClient) {
    return (
      <>
        <Head>
          <title>{topic || 'Loading'} Slides - EduMath</title>
        </Head>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0f1419 0%, #1a202c 100%)'
        }}>
          <Spinner animation="border" variant="primary" size="lg" />
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{topic} Slides - EduMath</title>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css" rel="stylesheet" />
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
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
        
        /* Swiper Styles */
        .swiper {
          padding: 2rem 0 4rem 0 !important;
          width: 100%;
          height: auto;
        }
        
        .swiper-slide {
          display: flex;
          justify-content: center;
          align-items: center;
          height: auto;
        }
        
        .swiper-button-next,
        .swiper-button-prev {
          color: rgba(255, 255, 255, 0.9) !important;
          background: rgba(255, 255, 255, 0.15) !important;
          border-radius: 50% !important;
          width: 50px !important;
          height: 50px !important;
          margin-top: -25px !important;
          backdrop-filter: blur(10px) !important;
          border: 2px solid rgba(255, 255, 255, 0.2) !important;
          transition: all 0.3s ease !important;
        }
        
        .swiper-button-next:hover,
        .swiper-button-prev:hover {
          background: rgba(255, 255, 255, 0.25) !important;
          transform: scale(1.1) !important;
          border-color: rgba(255, 255, 255, 0.4) !important;
        }
        
        .swiper-button-next::after,
        .swiper-button-prev::after {
          font-size: 18px !important;
          font-weight: bold !important;
        }
        
        .swiper-pagination {
          bottom: 10px !important;
        }
        
        .swiper-pagination-bullet {
          background: rgba(255, 255, 255, 0.5) !important;
          opacity: 1 !important;
          margin: 0 8px !important;
          transition: all 0.3s ease !important;
          width: 12px !important;
          height: 12px !important;
        }
        
        .swiper-pagination-bullet-active {
          background: #667eea !important;
          transform: scale(1.4) !important;
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
          z-index: 100;
        }

        @media (max-width: 768px) {
          .slide-title {
            font-size: 2rem;
          }
          
          .slide-bullets li {
            font-size: 1.1rem;
          }
          
          .progress-indicator {
            top: 10px;
            right: 15px;
            padding: 8px 15px;
            font-size: 0.9rem;
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
        </div>
      </nav>

      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', paddingTop: '6rem' }}>
        <div className="slides-container" style={{ width: '100%', maxWidth: '1000px', padding: '2.5rem', position: 'relative' }}>
          <h2 className="text-center mb-4" style={{ color: '#ffffff', fontSize: '2.2rem', fontWeight: '700' }}>
            ✨ {topic} - Interactive Learning Journey ✨
          </h2>
          
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
              {/* Swiper Component */}
              {slides.length > 0 && (
                <Swiper
                  ref={swiperRef}
                  {...swiperOptions}
                >
                  {slides.map((slide, index) => (
                    <SwiperSlide key={index}>
                      <SlideContent slide={slide} index={index} />
                    </SwiperSlide>
                  ))}
                </Swiper>
              )}

              {/* Action Buttons */}
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
                      disabled={isGenerating}
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