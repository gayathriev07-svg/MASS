(function(){
  if(window.__aiParticles) return; window.__aiParticles = true;
  // create canvas
  const canvas = document.createElement('canvas');
  canvas.id = 'ai-particles-canvas';
  canvas.style.position = 'fixed';
  canvas.style.left = '0';
  canvas.style.top = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '0';
  document.body.insertBefore(canvas, document.body.firstChild);
  const ctx = canvas.getContext('2d');

  let W = canvas.width = window.innerWidth;
  let H = canvas.height = window.innerHeight;
  window.addEventListener('resize', ()=>{ W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; recalc(); });

  // ensure canvas sits behind visible content; avoid changing existing z-index values
  Array.from(document.body.children).forEach(ch=>{
    if(ch !== canvas && ch.tagName !== 'SCRIPT' && ch.tagName !== 'STYLE'){
      try{
        const s = window.getComputedStyle(ch);
        if(s.position === 'static') ch.style.position = 'relative';
        // do NOT set ch.style.zIndex here — preserve author styles to avoid hiding UI
      }catch(e){}
    }
  });

  const mouse = {x:-9999,y:-9999,down:false};
  window.addEventListener('mousemove', e=>{ mouse.x = e.clientX; mouse.y = e.clientY; });
  window.addEventListener('mouseleave', ()=>{ mouse.x = -9999; mouse.y = -9999; });
  window.addEventListener('mousedown', ()=>{ mouse.down = true; });
  window.addEventListener('mouseup', ()=>{ mouse.down = false; });

  const cfg = {
    areaFactor: 70000, // medium density
    maxLinkDist: 140,
    speed: 0.5,
    size: 2.4,
    color: '180,200,255'
  };

  let particles = [];
  function rand(a,b){ return Math.random()*(b-a)+a; }

  function recalc(){
    const count = Math.max(30, Math.min(110, Math.floor((W*H)/cfg.areaFactor)));
    cfg.count = count;
    // recreate particles keeping previous where possible
    const prev = particles.slice(0, cfg.count);
    particles = [];
    for(let i=0;i<cfg.count;i++){
      if(prev[i]) particles.push(prev[i]);
      else particles.push({x:Math.random()*W,y:Math.random()*H,vx:rand(-cfg.speed,cfg.speed),vy:rand(-cfg.speed,cfg.speed),r:rand(cfg.size*0.7,cfg.size*1.6)});
    }
  }
  recalc();

  function step(){
    ctx.clearRect(0,0,W,H);
    // update
    for(let p of particles){
      const dx = mouse.x - p.x; const dy = mouse.y - p.y;
      const d = Math.sqrt(dx*dx + dy*dy) || 0.001;
      if(d < 200){
        const force = (200 - d)/200;
        const dir = mouse.down ? -1 : 1;
        p.vx += (dx/d) * force * 0.12 * dir;
        p.vy += (dy/d) * force * 0.12 * dir;
      }
      p.vx += rand(-0.03,0.03);
      p.vy += rand(-0.03,0.03);
      p.vx *= 0.98; p.vy *= 0.98;
      p.x += p.vx; p.y += p.vy;
      if(p.x < -20) p.x = W + 20; if(p.x > W + 20) p.x = -20;
      if(p.y < -20) p.y = H + 20; if(p.y > H + 20) p.y = -20;
    }
    // draw links
    for(let i=0;i<particles.length;i++){
      const a = particles[i];
      for(let j=i+1;j<particles.length;j++){
        const b = particles[j];
        const dx = a.x - b.x; const dy = a.y - b.y; const d2 = dx*dx + dy*dy;
        if(d2 < cfg.maxLinkDist*cfg.maxLinkDist){
          const alpha = 1 - Math.sqrt(d2)/cfg.maxLinkDist;
          ctx.beginPath(); ctx.strokeStyle = `rgba(${cfg.color},${(alpha*0.18).toFixed(3)})`; ctx.lineWidth = 0.8; ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
        }
      }
    }
    // draw particles
    for(let p of particles){ ctx.beginPath(); ctx.fillStyle = `rgba(${cfg.color},0.95)`; ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill(); }
  }

  let raf;
  function loop(){ step(); raf = requestAnimationFrame(loop); }
  loop();

  window.aiParticles = { pause:()=>{ if(raf) cancelAnimationFrame(raf); raf=null; }, resume:()=>{ if(!raf) loop(); }, setDensityFactor:(n)=>{ cfg.areaFactor = n; recalc(); } };
})();
