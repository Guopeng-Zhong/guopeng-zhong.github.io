(() => {
  const canvas = document.getElementById('hypercube-canvas');
  const content = document.querySelector('.content');
  if (!canvas || !content) return;
  const context = canvas.getContext('2d');
  if (!context) return;

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const vertices = Array.from({ length: 16 }, (_, i) =>
    [1, 2, 4, 8].map(bit => (i & bit) ? 1 : -1)
  );
  const edges = [];
  vertices.forEach((_, i) => {
    for (let bit = 0; bit < 4; bit++) {
      const j = i ^ (1 << bit);
      if (i < j) edges.push([i, j]);
    }
  });

  let width = 0;
  let height = 0;
  let target = 0;
  let current = 0;
  let frame = 0;

  function readProgress() {
    const paneScrolls = getComputedStyle(content).overflowY === 'auto';
    const element = paneScrolls ? content : document.scrollingElement;
    const range = element.scrollHeight - element.clientHeight;
    return range > 0 ? Math.max(0, Math.min(1, element.scrollTop / range)) : 0;
  }

  function rotate(vertex, a, b) {
    let [x, y, z, w] = vertex;
    let cosine = Math.cos(a), sine = Math.sin(a);
    [x, w] = [x * cosine - w * sine, x * sine + w * cosine];
    cosine = Math.cos(b); sine = Math.sin(b);
    [z, w] = [z * cosine - w * sine, z * sine + w * cosine];
    cosine = Math.cos(a * 0.42); sine = Math.sin(a * 0.42);
    [y, z] = [y * cosine - z * sine, y * sine + z * cosine];
    return [x, y, z, w];
  }

  function draw() {
    context.clearRect(0, 0, width, height);
    if (!width || !height) return;
    const points = vertices.map(vertex => {
      const [x, y, z, w] = rotate(vertex, current * Math.PI * 2.2 + 0.35, current * Math.PI * 1.35);
      const perspective4 = 3.4 / (3.4 - w);
      const depth = z * perspective4;
      const perspective3 = 3.9 / (3.9 - depth);
      return { x: x * perspective4 * perspective3, y: y * perspective4 * perspective3, z: depth, w };
    });

    // One scale preserves the geometry and keeps every vertex inside the canvas.
    const extentX = Math.max(...points.map(point => Math.abs(point.x)));
    const extentY = Math.max(...points.map(point => Math.abs(point.y)));
    const scale = Math.max(0, Math.min((width - 32) / (extentX * 2), (height - 32) / (extentY * 2)));
    points.forEach(point => {
      point.x = width / 2 + point.x * scale;
      point.y = height / 2 + point.y * scale;
    });

    context.lineCap = 'round';
    edges.forEach(([i, j]) => {
      const p = points[i], q = points[j];
      const depth = (p.z + q.z) / 2;
      const alpha = Math.min(0.8, Math.max(0.16, 0.18 + (depth + 1.5) * 0.12));
      context.beginPath();
      context.moveTo(p.x, p.y);
      context.lineTo(q.x, q.y);
      context.strokeStyle = `rgba(154,81,56,${alpha})`;
      context.lineWidth = 1 + Math.max(0, depth + 1.5) * 0.32;
      context.stroke();
    });
    points.forEach(point => {
      context.beginPath();
      context.arc(point.x, point.y, 1.4 + (point.w + 1) * 0.55, 0, Math.PI * 2);
      context.fillStyle = `rgba(48,46,41,${Math.min(0.85, Math.max(0.2, 0.35 + (point.z + 1.5) * 0.15))})`;
      context.fill();
    });
  }

  function animate() {
    frame = 0;
    current += (target - current) * 0.12;
    if (Math.abs(target - current) < 0.0001) current = target;
    draw();
    if (current !== target) frame = requestAnimationFrame(animate);
  }

  function update() {
    target = reducedMotion.matches ? 0 : readProgress();
    if (reducedMotion.matches) {
      cancelAnimationFrame(frame);
      frame = 0;
      current = 0;
      draw();
    } else if (!frame) {
      frame = requestAnimationFrame(animate);
    }
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    draw();
    update();
  }

  content.addEventListener('scroll', update, { passive: true });
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', resize);
  reducedMotion.addEventListener('change', update);
  new ResizeObserver(resize).observe(canvas);
  document.fonts.ready.then(resize);
  resize();
})();
