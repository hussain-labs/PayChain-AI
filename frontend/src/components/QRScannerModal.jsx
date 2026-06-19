import { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import toast from 'react-hot-toast';

const QRScannerModal = ({ isOpen, onClose, onAddressFound }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const animFrameRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const [found, setFound] = useState(null);

  useEffect(() => {
    if (isOpen) { setFound(null); setError(null); startCamera(); }
    return () => stopCamera();
  }, [isOpen]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setScanning(true);
        scanLoop();
      }
    } catch {
      setError('Camera access denied. Please allow camera permissions and try again.');
    }
  };

  const stopCamera = () => {
    cancelAnimationFrame(animFrameRef.current);
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    setScanning(false);
  };

  const scanLoop = () => {
    const tick = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return;
      const ctx = canvas.getContext('2d');
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'dontInvert' });
        if (code?.data) {
          const match = code.data.match(/0x[0-9a-fA-F]{40}/);
          if (match) { setFound(match[0]); stopCamera(); return; }
        }
      }
      animFrameRef.current = requestAnimationFrame(tick);
    };
    animFrameRef.current = requestAnimationFrame(tick);
  };

  const handleUseAddress = () => {
    if (found) { onAddressFound(found); toast.success('Wallet address scanned!'); onClose(); }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      background: 'var(--modal-overlay)',
      backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 2000, animation: 'fadeIn 0.2s ease'
    }}>
      <div style={{
        background: 'var(--modal-bg)',
        border: '1px solid var(--modal-border)',
        borderRadius: '24px', padding: '2rem', width: '90%', maxWidth: '440px',
        textAlign: 'center', position: 'relative',
        boxShadow: 'var(--modal-shadow)'
      }}>
        <button onClick={() => { stopCamera(); onClose(); }} style={{
          position: 'absolute', top: '14px', right: '14px', background: 'transparent',
          border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer', transition: '0.2s'
        }}
          onMouseOver={e => e.currentTarget.style.color = 'var(--text-main)'}
          onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <i className='bx bx-x' />
        </button>

        <div style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ margin: '0 0 0.4rem', fontSize: '1.3rem', color: 'var(--text-main)' }}>
            <i className='bx bx-scan' style={{ marginRight: '0.5rem', color: 'var(--primary)' }} />
            Scan Wallet QR Code
          </h3>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Point your camera at a wallet address QR code
          </p>
        </div>

        {error ? (
          <div style={{
            padding: '2rem', background: 'rgba(248,113,113,0.08)',
            border: '1px solid rgba(248,113,113,0.3)', borderRadius: '16px', marginBottom: '1rem'
          }}>
            <i className='bx bx-camera-off' style={{ fontSize: '2.5rem', color: '#f87171', display: 'block', marginBottom: '0.75rem' }} />
            <p style={{ margin: 0, color: '#f87171', fontSize: '0.9rem' }}>{error}</p>
          </div>
        ) : found ? (
          <div style={{ marginBottom: '1rem' }}>
            <div style={{
              width: '70px', height: '70px', borderRadius: '50%',
              background: 'rgba(74,222,128,0.12)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem'
            }}>
              <i className='bx bx-check-circle' style={{ fontSize: '2.5rem', color: '#4ade80' }} />
            </div>
            <p style={{ fontWeight: 700, color: '#4ade80', marginBottom: '0.75rem' }}>QR Code Detected!</p>
            <div style={{
              background: 'var(--input-surface, rgba(248,246,255,0.9))',
              border: '1px solid var(--modal-border)',
              padding: '0.75rem 1rem', borderRadius: '10px',
              fontFamily: 'monospace', fontSize: '0.82rem',
              color: 'var(--text-main)', wordBreak: 'break-all', marginBottom: '1.25rem'
            }}>
              {found}
            </div>
            <button onClick={handleUseAddress} style={{
              width: '100%', padding: '0.85rem',
              background: 'linear-gradient(135deg, var(--primary), #6d28d9)',
              border: 'none', borderRadius: '12px', color: '#fff',
              fontWeight: 700, fontSize: '1rem', cursor: 'pointer'
            }}>
              <i className='bx bx-send' style={{ marginRight: '0.5rem' }} />
              Use This Address for Transfer
            </button>
          </div>
        ) : (
          <div style={{ position: 'relative', marginBottom: '1rem' }}>
            <div style={{ borderRadius: '16px', overflow: 'hidden', background: '#000', aspectRatio: '4/3', position: 'relative' }}>
              <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} playsInline muted />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '200px', height: '200px', border: '2px solid rgba(167,139,250,0.8)', borderRadius: '16px', boxShadow: '0 0 0 9999px rgba(0,0,0,0.4)', position: 'relative' }}>
                  {[{top:0,left:0},{top:0,right:0},{bottom:0,left:0},{bottom:0,right:0}].map((pos, i) => (
                    <div key={i} style={{
                      position: 'absolute', width: '24px', height: '24px',
                      borderColor: '#a78bfa', borderStyle: 'solid',
                      borderTopWidth: i < 2 ? '3px' : 0,
                      borderBottomWidth: i >= 2 ? '3px' : 0,
                      borderLeftWidth: i % 2 === 0 ? '3px' : 0,
                      borderRightWidth: i % 2 === 1 ? '3px' : 0,
                      ...pos
                    }} />
                  ))}
                  <div style={{
                    position: 'absolute', left: '4px', right: '4px', height: '2px',
                    background: 'linear-gradient(90deg, transparent, #a78bfa, transparent)',
                    animation: 'scanLine 2s ease-in-out infinite'
                  }} />
                </div>
              </div>
            </div>
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            <p style={{ margin: '0.75rem 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {scanning ? 'Scanning… Hold steady' : 'Starting camera…'}
            </p>
          </div>
        )}

        <style>{`@keyframes scanLine { 0%,100% { top:4px; } 50% { top:calc(100% - 6px); } }`}</style>
      </div>
    </div>
  );
};

export default QRScannerModal;
