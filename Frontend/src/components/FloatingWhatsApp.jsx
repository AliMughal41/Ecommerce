import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';

const whatsappNumber = '923444133108';
const whatsappLink = `https://wa.me/${whatsappNumber}`;

export default function FloatingWhatsApp() {
  return (
    <>
      <style>{`
        @keyframes wa-bounce {
          0%, 100% { transform: translateY(0); }
          15% { transform: translateY(-10px) rotate(-3deg); }
          30% { transform: translateY(0); }
          45% { transform: translateY(-6px) rotate(2deg); }
          60% { transform: translateY(0); }
        }
        @keyframes wa-pulse-ring {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.7); opacity: 0; }
        }
        @keyframes wa-glow {
          0%, 100% { box-shadow: 0 4px 20px rgba(37,211,102,0.4); }
          50% { box-shadow: 0 4px 35px rgba(37,211,102,0.75), 0 0 60px rgba(37,211,102,0.3); }
        }
        .wa-float-btn {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 9999;
          width: 58px;
          height: 58px;
          border-radius: 50%;
          background: #25D366;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          text-decoration: none;
          color: #fff;
          animation: wa-bounce 2.5s ease-in-out infinite, wa-glow 2.5s ease-in-out infinite;
        }
        .wa-float-btn:hover {
          animation: none;
          transform: scale(1.12) !important;
          box-shadow: 0 6px 30px rgba(37,211,102,0.7) !important;
        }
        .wa-float-btn:hover .wa-pulse {
          animation-play-state: paused;
        }
        .wa-pulse {
          position: absolute;
          inset: -6px;
          border-radius: 50%;
          border: 3px solid #25D366;
          animation: wa-pulse-ring 1.8s ease-out infinite;
          pointer-events: none;
        }
      `}</style>
      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="wa-float-btn"
      >
        <span className="wa-pulse" />
        <FaWhatsapp size={28} style={{ position: 'relative', zIndex: 1 }} />
      </a>
    </>
  );
}
