import React, { useState, useRef, useEffect } from 'react';

const PER_PAGE_OPTIONS = [5, 7, 10, 20, 50, 100];

export default function Pagination({ currentPage, totalPages, onPageChange, itemsPerPage, onItemsPerPageChange, darkTheme = true }) {
  const [showPerPage, setShowPerPage] = useState(false);
  const [goToPage, setGoToPage] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowPerPage(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (totalPages <= 1) return null;

  const goTo = (page) => {
    const p = Math.max(1, Math.min(totalPages, page));
    if (p !== currentPage) {
      onPageChange(p);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleGoToPage = (e) => {
    if (e.key === 'Enter') {
      const val = parseInt(goToPage, 10);
      if (val && val >= 1 && val <= totalPages) {
        goTo(val);
        setGoToPage('');
      }
    }
  };

  // Dynamic page numbers: 4 around current + first + last + ellipsis
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
  const textMuted = darkTheme ? '#8a7a6a' : '#888';
  const gold = '#c9a84c';
  const goldBg = darkTheme ? 'rgba(201,168,76,0.12)' : 'rgba(201,168,76,0.1)';
  const hoverBg = darkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
  const disabledColor = darkTheme ? '#333' : '#ccc';
  const inputStyle = {
    background: bg, border: `1px solid ${border}`, borderRadius: '4px',
    color: '#fff', padding: '6px 8px', fontSize: '12px', width: '44px',
    textAlign: 'center', outline: 'none', transition: 'border-color 0.2s'
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', padding: '16px 0', borderTop: `1px solid ${border}` }}>

      {/* Left: Per page selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: textMuted }}>
        <span>Show</span>
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setShowPerPage(!showPerPage)}
            style={{
              background: bg, border: `1px solid ${border}`, borderRadius: '4px',
              color: gold, padding: '4px 10px', fontSize: '12px', fontWeight: 600,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
              minWidth: '44px', justifyContent: 'center', transition: 'border-color 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = gold}
            onMouseLeave={e => e.currentTarget.style.borderColor = border}
          >
            {itemsPerPage}
            <span style={{ fontSize: '8px', color: textMuted }}>▼</span>
          </button>
          {showPerPage && (
            <div style={{
              position: 'absolute', bottom: '100%', left: 0, marginBottom: '4px',
              background: bg, border: `1px solid ${border}`, borderRadius: '6px',
              overflow: 'hidden', zIndex: 50, minWidth: '55px',
              boxShadow: darkTheme ? '0 8px 24px rgba(0,0,0,0.6)' : '0 4px 12px rgba(0,0,0,0.15)'
            }}>
              {PER_PAGE_OPTIONS.map(opt => (
                <div
                  key={opt}
                  onClick={() => { onItemsPerPageChange(opt); setShowPerPage(false); }}
                  style={{
                    padding: '6px 14px', cursor: 'pointer', fontSize: '12px', fontWeight: opt === itemsPerPage ? 700 : 400,
                    color: opt === itemsPerPage ? gold : textMuted,
                    background: opt === itemsPerPage ? goldBg : 'transparent',
                    textAlign: 'center', transition: 'background 0.15s'
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
        <span>/ page</span>
      </div>

      {/* Center: Page buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {/* Prev */}
        <button
          onClick={() => goTo(currentPage - 1)}
          disabled={currentPage === 1}
          style={{
            padding: '6px 10px', borderRadius: '4px', border: `1px solid ${border}`,
            background: 'transparent', color: currentPage === 1 ? disabledColor : textMuted,
            cursor: currentPage === 1 ? 'default' : 'pointer', fontSize: '14px', fontWeight: 600,
            transition: 'all 0.2s', lineHeight: 1
          }}
          onMouseEnter={e => { if (currentPage !== 1) { e.currentTarget.style.borderColor = gold; e.currentTarget.style.color = gold; } }}
          onMouseLeave={e => { if (currentPage !== 1) { e.currentTarget.style.borderColor = border; e.currentTarget.style.color = textMuted; } }}
        >
          ‹
        </button>

        {pageNumbers.map((page, idx) => {
          if (page === '...') {
            return (
              <span key={`dots-${idx}`} style={{ padding: '6px 4px', color: textMuted, fontSize: '13px', letterSpacing: '2px', userSelect: 'none' }}>
                ...
              </span>
            );
          }
          const isActive = page === currentPage;
          return (
            <button
              key={page}
              onClick={() => goTo(page)}
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
          onClick={() => goTo(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{
            padding: '6px 10px', borderRadius: '4px', border: `1px solid ${border}`,
            background: 'transparent', color: currentPage === totalPages ? disabledColor : textMuted,
            cursor: currentPage === totalPages ? 'default' : 'pointer', fontSize: '14px', fontWeight: 600,
            transition: 'all 0.2s', lineHeight: 1
          }}
          onMouseEnter={e => { if (currentPage !== totalPages) { e.currentTarget.style.borderColor = gold; e.currentTarget.style.color = gold; } }}
          onMouseLeave={e => { if (currentPage !== totalPages) { e.currentTarget.style.borderColor = border; e.currentTarget.style.color = textMuted; } }}
        >
          ›
        </button>
      </div>

      {/* Right: Go to page + info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: textMuted }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>Go to</span>
          <input
            type="number"
            min={1}
            max={totalPages}
            value={goToPage}
            placeholder={currentPage}
            onChange={e => setGoToPage(e.target.value)}
            onKeyDown={handleGoToPage}
            onFocus={e => e.currentTarget.style.borderColor = gold}
            onBlur={e => e.currentTarget.style.borderColor = border}
            style={inputStyle}
          />
          <span>of {totalPages}</span>
        </div>
      </div>
    </div>
  );
}
