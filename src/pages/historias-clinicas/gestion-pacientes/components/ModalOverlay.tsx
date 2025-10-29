import React from 'react';

interface ModalOverlayProps {
  children: React.ReactNode;
}

export const ModalOverlay: React.FC<ModalOverlayProps> = ({ children }) => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(255,255,255,0.4)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div style={{ minWidth: 600, maxWidth: '90vw', maxHeight: '90vh', overflowY: 'auto' }}>
        {children}
      </div>
    </div>
  );
};