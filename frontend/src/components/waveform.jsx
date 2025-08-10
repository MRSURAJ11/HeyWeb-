import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

/**
 * Enhanced Waveform: animated canvas that visualizes microphone input with better styling
 * Props:
 * - active: boolean (animate when true)
 */
export default function Waveform({ active = false }) {
  const canvasRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const rafRef = useRef(null);
  const sourceRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    async function init() {
      if (!active) return stop();
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        audioCtxRef.current = audioCtx;
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        analyserRef.current = analyser;
        const src = audioCtx.createMediaStreamSource(stream);
        sourceRef.current = src;
        src.connect(analyser);
        draw();
      } catch (e) {
        // If getUserMedia blocked or not available, fallback to idle animation
        drawIdle();
      }
    }

    function stop() {
      if (!mounted) return;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (audioCtxRef.current) audioCtxRef.current.close().catch(() => {});
    }

    function drawIdle() {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const w = canvas.width;
      const h = canvas.height;
      let t = 0;
      
      function frame() {
        ctx.clearRect(0, 0, w, h);
        
        // Create gradient background
        const gradient = ctx.createLinearGradient(0, 0, w, 0);
        gradient.addColorStop(0, 'rgba(102, 126, 234, 0.1)');
        gradient.addColorStop(0.5, 'rgba(118, 75, 162, 0.1)');
        gradient.addColorStop(1, 'rgba(102, 126, 234, 0.1)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, h/2 - 8, w, 16);
        
        // Animated sine wave
        ctx.strokeStyle = 'rgba(102, 126, 234, 0.6)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        for (let x = 0; x < w; x++) {
          const y = h/2 + Math.sin((x + t) * 0.02) * 15;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        
        ctx.stroke();
        
        // Add glow effect
        ctx.shadowColor = 'rgba(102, 126, 234, 0.5)';
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;
        
        t += 2;
        rafRef.current = requestAnimationFrame(frame);
      }
      frame();
    }

    function draw() {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const analyser = analyserRef.current;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      const w = canvas.width;
      const h = canvas.height;

      function drawFrame() {
        analyser.getByteTimeDomainData(dataArray);
        ctx.clearRect(0, 0, w, h);
        
        // Create gradient for the waveform
        const gradient = ctx.createLinearGradient(0, 0, w, 0);
        gradient.addColorStop(0, 'rgba(102, 126, 234, 0.8)');
        gradient.addColorStop(0.5, 'rgba(118, 75, 162, 0.8)');
        gradient.addColorStop(1, 'rgba(102, 126, 234, 0.8)');
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Add glow effect
        ctx.shadowColor = 'rgba(102, 126, 234, 0.6)';
        ctx.shadowBlur = 8;
        
        ctx.beginPath();
        const sliceWidth = (w * 1.0) / bufferLength;
        let x = 0;
        
        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * h) / 2;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
          x += sliceWidth;
        }
        
        ctx.lineTo(w, h/2);
        ctx.stroke();
        
        // Reset shadow for next frame
        ctx.shadowBlur = 0;
        
        rafRef.current = requestAnimationFrame(drawFrame);
      }
      drawFrame();
    }

    init();

    return () => {
      mounted = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (audioCtxRef.current) audioCtxRef.current.close().catch(() => {});
    };
  }, [active]);

  return (
    <motion.div 
      className="w-full h-16 bg-transparent rounded-2xl overflow-hidden border border-white/10"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <canvas 
        ref={canvasRef} 
        width={800} 
        height={100} 
        className="w-full h-full"
      />
    </motion.div>
  );
}
