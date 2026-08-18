import React, { useState, useEffect } from 'react';
import { Car, Sparkles, ShieldCheck, Zap } from 'lucide-react';

const SplashScreen = ({ onFinish }) => {
  const [stage, setStage] = useState(0); // 0: icon & glow, 1: text & tagline, 2: progress, 3: fadeout

  useEffect(() => {
    // Stage progression for cinematic entrance
    const t1 = setTimeout(() => setStage(1), 300);
    const t2 = setTimeout(() => setStage(2), 700);
    const t3 = setTimeout(() => setStage(3), 1700);
    const t4 = setTimeout(() => {
      if (onFinish) onFinish();
    }, 2100);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onFinish]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: '#070A13',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: stage === 3 ? 0 : 1,
        transform: stage === 3 ? 'scale(1.04)' : 'scale(1)',
        filter: stage === 3 ? 'blur(8px)' : 'none',
        transition: 'all 450ms cubic-bezier(0.16, 1, 0.3, 1)',
        pointerEvents: stage === 3 ? 'none' : 'all',
        overflow: 'hidden'
      }}
    >
      {/* Background Ambient Glows */}
      <div
        style={{
          position: 'absolute',
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.35) 0%, rgba(6, 182, 212, 0.15) 50%, transparent 70%)',
          filter: 'blur(40px)',
          animation: 'pulseGlow 2.5s infinite alternate ease-in-out'
        }}
      />

      <div
        style={{
          position: 'absolute',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.25) 0%, transparent 70%)',
          filter: 'blur(30px)',
          top: '20%',
          right: '15%'
        }}
      />

      {/* Main Content Container */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          position: 'relative',
          zIndex: 10,
          padding: '0 2rem'
        }}
      >
        {/* Animated Brand Emblem */}
        <div
          style={{
            width: '84px',
            height: '84px',
            borderRadius: '26px',
            background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 50%, #8B5CF6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 35px rgba(59, 130, 246, 0.6), inset 0 0 15px rgba(255, 255, 255, 0.4)',
            marginBottom: '1.5rem',
            transform: stage >= 0 ? 'scale(1) rotate(0deg)' : 'scale(0.5) rotate(-15deg)',
            opacity: stage >= 0 ? 1 : 0,
            transition: 'all 600ms cubic-bezier(0.34, 1.56, 0.64, 1)',
            position: 'relative'
          }}
        >
          <Car size={44} color="#FFFFFF" style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))' }} />

          {/* Speed Sparks */}
          <div
            style={{
              position: 'absolute',
              top: '-6px',
              right: '-6px',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: '#10B981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 12px #10B981'
            }}
          >
            <Zap size={11} color="#FFFFFF" />
          </div>
        </div>

        {/* Brand Name */}
        <div
          style={{
            transform: stage >= 1 ? 'translateY(0)' : 'translateY(15px)',
            opacity: stage >= 1 ? 1 : 0,
            transition: 'all 500ms ease-out'
          }}
        >
          <h1
            style={{
              fontSize: '2.4rem',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: '#FFFFFF',
              margin: '0 0 0.4rem',
              fontFamily: "'Outfit', sans-serif"
            }}
          >
            Drive<span style={{ color: '#3B82F6', textShadow: '0 0 20px rgba(59, 130, 246, 0.8)' }}>Share</span>
          </h1>

          <p
            style={{
              fontSize: '0.875rem',
              color: '#94A3B8',
              letterSpacing: '0.02em',
              fontWeight: 500,
              marginBottom: '2rem'
            }}
          >
            Peer-to-Peer Car Sharing & Rental
          </p>
        </div>

        {/* Loading Progress Bar */}
        <div
          style={{
            width: '180px',
            height: '4px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '999px',
            overflow: 'hidden',
            position: 'relative',
            opacity: stage >= 2 ? 1 : 0,
            transition: 'opacity 300ms ease'
          }}
        >
          <div
            style={{
              height: '100%',
              width: stage >= 2 ? '100%' : '0%',
              background: 'linear-gradient(90deg, #3B82F6, #06B6D4, #10B981)',
              borderRadius: '999px',
              boxShadow: '0 0 12px #3B82F6',
              transition: 'width 900ms cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          />
        </div>

        {/* Safety & Trust Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            marginTop: '2.5rem',
            color: '#64748B',
            fontSize: '0.75rem',
            fontWeight: 600,
            opacity: stage >= 1 ? 1 : 0,
            transition: 'opacity 500ms ease 300ms'
          }}
        >
          <ShieldCheck size={14} color="#10B981" />
          <span>100% Verified Fleet & Direct UPI</span>
        </div>
      </div>

      <style>{`
        @keyframes pulseGlow {
          0% { transform: scale(0.9); opacity: 0.5; }
          100% { transform: scale(1.15); opacity: 0.85; }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
