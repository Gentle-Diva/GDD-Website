// Gentle Diva Digitals — site scripts

document.addEventListener('DOMContentLoaded', () => {
  initNavMenu();
  initHeroNetwork();
});

function initNavMenu() {
  const menuBtn = document.getElementById('navMenuBtn');
  const dropdown = document.getElementById('navDropdown');
  if (!menuBtn || !dropdown) return;

  menuBtn.addEventListener('click', () => {
    const isOpen = dropdown.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', isOpen);
  });

  dropdown.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      dropdown.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
    });
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-menu')) {
      dropdown.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
    }
  });
}

function initHeroNetwork() {
  const canvas = document.getElementById('heroNetwork');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, nodes, dpr;

  function resize() {
    dpr = window.devicePixelRatio || 1;
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function makeNodes() {
    const count = w < 700 ? 11 : 20;
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 1.6 + Math.random() * 1.4,
      phase: Math.random() * Math.PI * 2,
      speedX: (Math.random() - 0.5) * 0.06,
      speedY: (Math.random() - 0.5) * 0.06
    }));
  }

  resize();
  makeNodes();
  window.addEventListener('resize', () => { resize(); makeNodes(); });

  const maxDist = 190;
  let pulse = null;
  let t = 0;

  function maybeStartPulse() {
    if (pulse || nodes.length < 2) return;
    if (Math.random() < 0.006) {
      const a = nodes[Math.floor(Math.random() * nodes.length)];
      let b = a, tries = 0;
      while (b === a && tries < 10) {
        b = nodes[Math.floor(Math.random() * nodes.length)];
        tries++;
      }
      pulse = { a, b, p: 0 };
    }
  }

  function draw() {
    t += 1;
    ctx.clearRect(0, 0, w, h);

    nodes.forEach(n => {
      n.x += n.speedX; n.y += n.speedY;
      if (n.x < 0 || n.x > w) n.speedX *= -1;
      if (n.y < 0 || n.y > h) n.speedY *= -1;
    });

    ctx.strokeStyle = 'rgba(201,162,39,0.16)';
    ctx.lineWidth = 1;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < maxDist) {
          ctx.globalAlpha = 1 - (d / maxDist);
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;

    nodes.forEach(n => {
      const breathe = 0.6 + Math.sin(t * 0.02 + n.phase) * 0.4;
      ctx.beginPath();
      ctx.fillStyle = 'rgba(201,162,39,' + (0.35 + breathe * 0.35) + ')';
      ctx.arc(n.x, n.y, n.r + breathe * 0.8, 0, Math.PI * 2);
      ctx.fill();
    });

    maybeStartPulse();
    if (pulse) {
      pulse.p += 0.012;
      const x = pulse.a.x + (pulse.b.x - pulse.a.x) * pulse.p;
      const y = pulse.a.y + (pulse.b.y - pulse.a.y) * pulse.p;
      ctx.beginPath();
      ctx.fillStyle = 'rgba(255,224,140,0.9)';
      ctx.arc(x, y, 2.4, 0, Math.PI * 2);
      ctx.fill();
      if (pulse.p >= 1) pulse = null;
    }

    requestAnimationFrame(draw);
  }
  draw();
}
