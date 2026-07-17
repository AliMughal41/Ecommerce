import React, { useState, useEffect, useRef } from 'react';

const PER_PAGE_OPTIONS = [5, 8, 10];

export default function Pagination({ currentPage, totalPages, onPageChange, itemsPerPage, onItemsPerPageChange, darkTheme = true }) {
  const [showPerPage, setShowPerPage] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowPerPage(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const windowSize = 4;

    if (totalPages <= windowSize + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    let start = Math.max(2, currentPage - 1);
    let end = Math.min(totalPages - 1, start + windowSize - 1);
    if (end - start < windowSize - 1) {
      start = Math.max(2, end - windowSize + 1);
    }

    pages.push(1);
    if (start > 2) pages.push('...');
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages - 1) pages.push('...');
    pages.push(totalPages);

    return pages;
  };

  const pageNumbers = getPageNumbers();

  const bg = darkTheme ? '#0d0a06' : '#fff';
  const border = darkTheme ? '#2a1f10' : '#e0e0e0';
  const textPrimary = darkTheme ? '#fff' : '#333';
  const textMuted = darkTheme ? '#8a7a6a' : '#888';
  const gold = '#c9a84c';
  const goldBg = darkTheme ? 'rgba(201,168,76,0.12)' : 'rgba(201,168,76,0.1)';
  const hoverBg = darkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', padding: '16px 0', borderTop: `1px solid ${border}` }}>
      {/* Per page selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: textMuted }}>
        <span>Show</span>
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setShowPerPage(!showPerPage)}
            style={{
              background: bg, border: `1px solid ${border}`, borderRadius: '4px',
              color: gold, padding: '4px 10px', fontSize: '12px', fontWeight: 600,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
              minWidth: '44px', justifyContent: 'center'
            }}
          >
            {itemsPerPage}
            <span style={{ fontSize: '8px', color: textMuted }}>▼</span>
          </button>
          {showPerPage && (
            <div style={{
              position: 'absolute', bottom: '100%', left: 0, marginBottom: '4px',
              background: bg, border: `1px solid ${border}`, borderRadius: '6px',
              overflow: 'hidden', zIndex: 50, minWidth: '50px',
              boxShadow: darkTheme ? '0 8px 24px rgba(0,0,0,0.6)' : '0 4px 12px rgba(0,0,0,0.15)'
            }}>
              {PER_PAGE_OPTIONS.map(opt => (
                <div
                  key={opt}
                  onClick={() => { onItemsPerPageChange(opt); setShowPerPage(false); }}
                  style={{
                    padding: '6px 12px', cursor: 'pointer', fontSize: '12px', fontWeight: opt === itemsPerPage ? 700 : 400,
                    color: opt === itemsPerPage ? gold : textMuted,
                    background: opt === itemsPerPage ? goldBg : 'transparent',
                    textAlign: 'center',
                  }}
                  onMouseEnter={e => { if (opt !== itemsPerPage) e.currentTarget.style.background = hoverBg; }}
                  onMouseLeave={e => { if (opt !== itemsPerPage) e.currentTarget.style.background = opt === itemsPerPage ? goldBg : 'transparent'; }}
                >
                  {opt}
                </div>
              ))}
            </div>
          )}
        </div>
        <span>per page</span>
      </div>

      {/* Page buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {/* Prev */}
        <button
          onClick={() => { onPageChange(currentPage - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          disabled={currentPage === 1}
          style={{
            padding: '6px 10px', borderRadius: '4px', border: `1px solid ${border}`,
            background: 'transparent', color: currentPage === 1 ? (darkTheme ? '#333' : '#ccc') : textMuted,
            cursor: currentPage === 1 ? 'default' : 'pointer', fontSize: '11px', fontWeight: 600,
            letterSpacing: '1px', transition: 'all 0.2s'
          }}
          onMouseEnter={e => { if (currentPage !== 1) { e.currentTarget.style.borderColor = gold; e.currentTarget.style.color = gold; } }}
          onMouseLeave={e => { if (currentPage !== 1) { e.currentTarget.style.borderColor = border; e.currentTarget.style.color = textMuted; } }}
        >
          ◀
        </button>

        {pageNumbers.map((page, idx) => {
          if (page === '...') {
            return (
              <span key={`dots-${idx}`} style={{ padding: '6px 6px', color: textMuted, fontSize: '12px', letterSpacing: '2px' }}>
                ...
              </span>
            );
          }
          const isActive = page === currentPage;
          return (
            <button
              key={page}
              onClick={() => { onPageChange(page); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              style={{
                padding: '6px 10px', minWidth: '32px', borderRadius: '4px', border: `1px solid ${isActive ? gold : border}`,
                background: isActive ? gold : 'transparent',
                color: isActive ? '#0a0a0a' : textMuted,
                cursor: 'pointer', fontSize: '12px', fontWeight: isActive ? 700 : 500,
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.borderColor = gold; e.currentTarget.style.color = gold; } }}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.borderColor = border; e.currentTarget.style.color = textMuted; } }}
            >
              {page}
            </button>
          );
        })}

        {/* Next */}
        <button
          onClick={() => { onPageChange(currentPage + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          disabled={currentPage === totalPages}
          style={{
            padding: '6px 10px', borderRadius: '4px', border: `1px solid ${border}`,
            background: 'transparent', color: currentPage === totalPages ? (darkTheme ? '#333' : '#ccc') : textMuted,
            cursor: currentPage === totalPages ? 'default' : 'pointer', fontSize: '11px', fontWeight: 600,
            letterSpacing: '1px', transition: 'all 0.2s'
          }}
          onMouseEnter={e => { if (currentPage !== totalPages) { e.currentTarget.style.borderColor = gold; e.currentTarget.style.color = gold; } }}
          onMouseLeave={e => { if (currentPage !== totalPages) { e.currentTarget.style.borderColor = border; e.currentTarget.style.color = textMuted; } }}
        >
          ▶
        </button>
      </div>

      {/* Page info */}
      <div style={{ fontSize: '11px', color: textMuted, letterSpacing: '0.5px' }}>
        Page {currentPage} of {totalPages}
      </div>
    </div>
  );
}
