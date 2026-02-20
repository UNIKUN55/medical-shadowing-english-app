import { useEffect } from 'react';

export function useInteractiveBackground(canvasRef) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W, H, t = 0, animId;
    let points = [];
    let ripples = [], lastRipple = 0;
    let scrollRatio = 0;

    const mouse = { x: -9999, y: -9999, vx: 0, vy: 0 };
    const isMobile = () => window.innerWidth < 768;

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
      initPoints();
    }

    function initPoints() {
      points = [];
      const spacing = isMobile() ? 75 : 90;
      const cols = Math.ceil(W / spacing) + 2;
      const rows = Math.ceil(H / spacing) + 2;
      for (let r = -1; r <= rows; r++) {
        for (let c = -1; c <= cols; c++) {
          const bx = c * spacing + (r % 2 === 0 ? 0 : spacing * 0.5) + (Math.random() - 0.5) * 24;
          const by = r * spacing + (Math.random() - 0.5) * 24;
          points.push({ bx, by, x: bx, y: by, vx: 0, vy: 0 });
        }
      }
    }

    function onMouseMove(e) {
      const cx = e.clientX;
      const cy = e.clientY;
      mouse.vx = cx - mouse.x;
      mouse.vy = cy - mouse.y;
      mouse.x = cx;
      mouse.y = cy;
    }

    function onTouchMove(e) {
      const t0 = e.touches[0];
      mouse.vx = t0.clientX - mouse.x;
      mouse.vy = t0.clientY - mouse.y;
      mouse.x = t0.clientX;
      mouse.y = t0.clientY;
    }

    function onTouchStart(e) {
      const t0 = e.touches[0];
      mouse.x = t0.clientX;
      mouse.y = t0.clientY;
    }

    function onScroll() {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      scrollRatio = maxScroll > 0 ? Math.min(window.scrollY / maxScroll, 1) : 0;
      if (isMobile()) {
        mouse.y = H * 0.3 + scrollRatio * H * 0.6;
        mouse.x = W * 0.5 + Math.sin(scrollRatio * Math.PI * 2) * W * 0.2;
        mouse.vy = window.scrollY > 0 ? 3 : 0;
      }
    }

    function onOrientation(e) {
      if (!isMobile()) return;
      if (e.gamma !== null && e.beta !== null) {
        mouse.x = W / 2 + (e.gamma / 45) * (W / 3);
        mouse.y = H / 2 + ((e.beta - 45) / 45) * (H / 3);
      }
    }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('deviceorientation', onOrientation);
    window.addEventListener('resize', resize);

    function updatePoints() {
      const influence = isMobile() ? 130 : 160;
      const scrollWave = scrollRatio * Math.PI * 4;

      points.forEach(p => {
        const freq = 0.8 + scrollRatio * 0.8;
        const wave = Math.sin(t * freq + p.bx * 0.015 + scrollWave * 0.3) * 6 + Math.cos(t * 0.5 + p.by * 0.018) * 5;

        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;

        let fx = 0, fy = 0;
        if (dist < influence) {
          const force = (1 - dist / influence) * 110;
          fx = (dx / dist) * force;
          fy = (dy / dist) * force;
        }

        const mdist = dist < influence * 1.5 ? 1 - dist / (influence * 1.5) : 0;
        fx += mouse.vy * mdist * 0.28 * (dx / dist);
        fy -= mouse.vx * mdist * 0.28 * (dy / dist);

        p.vx += (p.bx + wave - p.x + fx) * 0.04 - p.vx * 0.12;
        p.vy += (p.by + wave - p.y + fy) * 0.04 - p.vy * 0.12;
        p.x += p.vx;
        p.y += p.vy;
      });

      mouse.vx *= 0.85;
      mouse.vy *= 0.85;
    }

    function drawTriangles() {
      const spacing = isMobile() ? 75 : 90;
      const cols = Math.ceil(W / spacing) + 2;
      const totalCols = cols + 1;
      const rows = Math.ceil(H / spacing) + 2;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < totalCols - 1; c++) {
          const i = r * totalCols + c;
          if (i + totalCols + 1 >= points.length) continue;
          const p0 = points[i], p1 = points[i + 1];
          const p2 = points[i + totalCols], p3 = points[i + totalCols + 1];
          if (!p0 || !p1 || !p2 || !p3) continue;
          drawTri(p0, p1, p2, r, c, 0);
          drawTri(p1, p3, p2, r, c, 1);
        }
      }
    }

    function drawTri(a, b, c, row, col, sub) {
      const minX = Math.min(a.x, b.x, c.x);
      const maxX = Math.max(a.x, b.x, c.x);
      const minY = Math.min(a.y, b.y, c.y);
      const maxY = Math.max(a.y, b.y, c.y);
      if (maxX < -20 || minX > W + 20 || maxY < -20 || minY > H + 20) return;

      const cx = (a.x + b.x + c.x) / 3;
      const cy = (a.y + b.y + c.y) / 3;
      const dx = cx - mouse.x, dy = cy - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const prox = Math.max(0, 1 - dist / 300);

      const hueBase = (cx / W * 180 + cy / H * 60 + t * 10) % 360;
      const hueScroll = scrollRatio * 80;
      const hue = (hueBase + prox * 60 + hueScroll) % 360;

      const light = 3 + (row + col + sub) % 3 + prox * 14;
      const alpha = 0.1 + prox * 0.28 + scrollRatio * 0.05 + Math.sin(t * 0.5 + cx * 0.01) * 0.03;

      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.lineTo(c.x, c.y);
      ctx.closePath();
      ctx.fillStyle = `hsla(${hue}, 90%, ${light}%, ${Math.min(alpha, 0.5).toFixed(3)})`;
      ctx.fill();

      const edgeAlpha = 0.03 + prox * 0.14;
      ctx.strokeStyle = `hsla(${hue}, 80%, 60%, ${edgeAlpha.toFixed(3)})`;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    function drawNodes() {
      const influence = 200;
      ctx.save();
      points.forEach(p => {
        const dx = p.x - mouse.x, dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > influence) return;
        const alpha = (1 - dist / influence) * 0.75;
        const size = (1 - dist / influence) * 4;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 240, 255, ${alpha})`;
        ctx.shadowBlur = 14;
        ctx.shadowColor = 'rgba(0, 240, 255, 0.9)';
        ctx.fill();
      });
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    function drawEnergyLines() {
      const influence = 240;
      const nearby = points.filter(p => {
        const dx = p.x - mouse.x, dy = p.y - mouse.y;
        return Math.sqrt(dx * dx + dy * dy) < influence;
      });
      ctx.save();
      for (let i = 0; i < nearby.length; i++) {
        for (let j = i + 1; j < nearby.length; j++) {
          const a = nearby[i], b = nearby[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 110) continue;
          const alpha = (1 - dist / 110) * 0.32;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(0, 240, 255, ${alpha})`;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    function addRipple() {
      if (t - lastRipple > 0.5 && Math.abs(mouse.vx) + Math.abs(mouse.vy) > 3) {
        ripples.push({
          x: mouse.x, y: mouse.y, r: 0, alpha: 0.6,
          color: scrollRatio > 0.5 ? '255,0,128' : '0,240,255',
        });
        lastRipple = t;
      }
    }

    function drawRipples() {
      ripples = ripples.filter(r => r.alpha > 0.01);
      ripples.forEach(r => {
        r.r += 2.8;
        r.alpha *= 0.94;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${r.color}, ${r.alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    }

    function draw() {
      t += 0.016;
      ctx.fillStyle = 'rgba(6, 8, 15, 0.22)';
      ctx.fillRect(0, 0, W, H);
      updatePoints();
      drawTriangles();
      drawEnergyLines();
      drawNodes();
      addRipple();
      drawRipples();
      animId = requestAnimationFrame(draw);
    }

    resize();
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('deviceorientation', onOrientation);
      window.removeEventListener('resize', resize);
    };
  }, []);
}