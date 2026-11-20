import { useEffect, useRef } from 'react';

export default function Modal({ title, eyebrow, onClose, children }) {
  const ref = useRef(null);
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const first = ref.current?.querySelector('input,select,textarea,button');
    first?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="ov" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={title} ref={ref}>
        <div>
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h2 className="sheet-title">{title}</h2>
        </div>
        {children}
      </div>
    </div>
  );
}
