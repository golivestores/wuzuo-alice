/* =============================================================
   WebGL Candle Flame — Particle system using Three.js
   Usage: WebGLFlame.init(canvasElement) → WebGLFlame.setIntensity(0-1)
   ============================================================= */
var WebGLFlame = (function() {
  var scene, camera, renderer, particles, clock;
  var PARTICLE_COUNT = 160;
  var intensity = 0.3;
  var canvas;

  function init(canvasEl) {
    canvas = canvasEl;
    if (!canvas || !window.THREE) return;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, canvas.width / canvas.height, 0.1, 100);
    camera.position.z = 5;

    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
      premultipliedAlpha: false
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(canvas.width, canvas.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    clock = new THREE.Clock();

    // Particle geometry
    var geometry = new THREE.BufferGeometry();
    var positions = new Float32Array(PARTICLE_COUNT * 3);
    var colors = new Float32Array(PARTICLE_COUNT * 3);
    var sizes = new Float32Array(PARTICLE_COUNT);
    var speeds = new Float32Array(PARTICLE_COUNT);
    var offsets = new Float32Array(PARTICLE_COUNT);

    for (var i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 0.6;
      positions[i * 3 + 1] = Math.random() * 1.5 - 0.2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
      sizes[i] = Math.random() * 8 + 3;
      speeds[i] = Math.random() * 0.8 + 0.4;
      offsets[i] = Math.random() * Math.PI * 2;

      // Color: white core → gold → orange
      var t = Math.random();
      if (t < 0.3) {
        colors[i * 3] = 1.0; colors[i * 3 + 1] = 0.95; colors[i * 3 + 2] = 0.85; // white
      } else if (t < 0.6) {
        colors[i * 3] = 1.0; colors[i * 3 + 1] = 0.82; colors[i * 3 + 2] = 0.4; // gold
      } else {
        colors[i * 3] = 1.0; colors[i * 3 + 1] = 0.55; colors[i * 3 + 2] = 0.15; // orange
      }
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.userData = { speeds: speeds, offsets: offsets, initPositions: positions.slice() };

    // Shader material
    var material = new THREE.PointsMaterial({
      size: 6,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);

    animate();
  }

  function animate() {
    if (!renderer) return;
    requestAnimationFrame(animate);

    var elapsed = clock.getElapsedTime();
    var pos = particles.geometry.attributes.position.array;
    var initPos = particles.geometry.userData.initPositions;
    var spd = particles.geometry.userData.speeds;
    var off = particles.geometry.userData.offsets;

    for (var i = 0; i < PARTICLE_COUNT; i++) {
      var idx = i * 3;
      var t = (elapsed * spd[i] + off[i]) % 3.0;

      // Rise upward
      pos[idx + 1] = initPos[idx + 1] + t * 0.8 * intensity;

      // Horizontal sway
      pos[idx] = initPos[idx] + Math.sin(elapsed * 2 + off[i]) * 0.12 * intensity;

      // Fade by height (higher = smaller)
      var life = 1.0 - (t / 3.0);
      pos[idx + 2] = initPos[idx + 2] + Math.sin(elapsed + off[i]) * 0.05;
    }

    particles.geometry.attributes.position.needsUpdate = true;
    particles.material.opacity = 0.4 + intensity * 0.5;
    particles.scale.set(intensity * 0.8 + 0.4, intensity * 0.8 + 0.4, 1);

    renderer.render(scene, camera);
  }

  function setIntensity(val) {
    intensity = Math.max(0, Math.min(1, val));
  }

  function destroy() {
    if (renderer) {
      renderer.dispose();
      renderer = null;
    }
  }

  return { init: init, setIntensity: setIntensity, destroy: destroy };
})();
