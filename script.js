/* ==================== THREE.JS ADVANCED 3D BACKGROUND ==================== */
(function () {
    const canvas = document.getElementById('bg-canvas');
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;

    let mouseX = 0, mouseY = 0, targetMouseX = 0, targetMouseY = 0;

    // === PARTICLE SYSTEM WITH CONNECTIONS ===
    const particleCount = 800;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 80;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 80;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 60;
        velocities.push({
            x: (Math.random() - 0.5) * 0.02,
            y: (Math.random() - 0.5) * 0.02,
            z: (Math.random() - 0.5) * 0.02
        });
        const mix = Math.random();
        colors[i * 3] = 0.42 * (1 - mix) + 0.99 * mix;
        colors[i * 3 + 1] = 0.36 * (1 - mix) + 0.81 * mix;
        colors[i * 3 + 2] = 0.91 * (1 - mix) + 0.49 * mix;
        sizes[i] = Math.random() * 0.15 + 0.05;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particleGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const particleMat = new THREE.PointsMaterial({
        size: 0.12, vertexColors: true, transparent: true, opacity: 0.8,
        blending: THREE.AdditiveBlending, depthWrite: false
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // === CONNECTION LINES BETWEEN NEARBY PARTICLES ===
    const lineGeo = new THREE.BufferGeometry();
    const maxLines = 300;
    const linePositions = new Float32Array(maxLines * 6);
    const lineColors = new Float32Array(maxLines * 6);
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    lineGeo.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));
    const lineMat = new THREE.LineBasicMaterial({
        vertexColors: true, transparent: true, opacity: 0.15,
        blending: THREE.AdditiveBlending, depthWrite: false
    });
    const lines = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(lines);

    // === FLOATING 3D SHAPES ===
    const shapes = [];
    const shapeMaterials = [
        new THREE.MeshStandardMaterial({ color: 0x6c5ce7, metalness: 0.8, roughness: 0.2, transparent: true, opacity: 0.12, wireframe: true }),
        new THREE.MeshStandardMaterial({ color: 0x00cec9, metalness: 0.8, roughness: 0.2, transparent: true, opacity: 0.1, wireframe: true }),
        new THREE.MeshStandardMaterial({ color: 0xfd79a8, metalness: 0.8, roughness: 0.2, transparent: true, opacity: 0.08, wireframe: true }),
    ];
    const geos = [
        new THREE.TorusKnotGeometry(2, 0.6, 80, 16, 2, 3),
        new THREE.IcosahedronGeometry(2.5, 1),
        new THREE.OctahedronGeometry(2, 0),
        new THREE.TorusGeometry(2, 0.5, 12, 24),
        new THREE.DodecahedronGeometry(2, 0),
        new THREE.TetrahedronGeometry(2.5, 0),
        new THREE.TorusKnotGeometry(1.5, 0.5, 64, 12, 3, 5),
        new THREE.SphereGeometry(2, 8, 8),
    ];
    for (let i = 0; i < 12; i++) {
        const mesh = new THREE.Mesh(geos[i % geos.length], shapeMaterials[i % shapeMaterials.length].clone());
        mesh.position.set(
            (Math.random() - 0.5) * 60,
            (Math.random() - 0.5) * 60,
            (Math.random() - 0.5) * 30 - 5
        );
        mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
        const scale = 0.6 + Math.random() * 1.2;
        mesh.scale.set(scale, scale, scale);
        mesh.userData = {
            rotSpeed: { x: (Math.random() - 0.5) * 0.008, y: (Math.random() - 0.5) * 0.008, z: (Math.random() - 0.5) * 0.004 },
            floatSpeed: 0.2 + Math.random() * 0.5,
            floatAmp: 1 + Math.random() * 2,
            floatOffset: Math.random() * Math.PI * 2,
            baseY: mesh.position.y,
            baseX: mesh.position.x,
            pulseSpeed: 0.5 + Math.random() * 1.5,
        };
        shapes.push(mesh);
        scene.add(mesh);
    }

    // === GLOWING ORB THAT FOLLOWS MOUSE ===
    const orbGeo = new THREE.SphereGeometry(0.8, 16, 16);
    const orbMat = new THREE.MeshBasicMaterial({
        color: 0x6c5ce7, transparent: true, opacity: 0.25,
        blending: THREE.AdditiveBlending
    });
    const orb = new THREE.Mesh(orbGeo, orbMat);
    scene.add(orb);

    const orbGlow = new THREE.Mesh(
        new THREE.SphereGeometry(2, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0x6c5ce7, transparent: true, opacity: 0.06, blending: THREE.AdditiveBlending })
    );
    scene.add(orbGlow);

    // === RING GEOMETRIES ===
    for (let i = 0; i < 3; i++) {
        const ring = new THREE.Mesh(
            new THREE.TorusGeometry(8 + i * 5, 0.03, 8, 64),
            new THREE.MeshBasicMaterial({ color: 0x6c5ce7, transparent: true, opacity: 0.04 + i * 0.01 })
        );
        ring.rotation.x = Math.PI / 2 + i * 0.3;
        ring.rotation.y = i * 0.5;
        ring.userData = { rotSpeed: 0.001 + i * 0.0005, axis: i };
        shapes.push(ring);
        scene.add(ring);
    }

    // === LIGHTS ===
    scene.add(new THREE.AmbientLight(0x6c5ce7, 0.6));
    const point1 = new THREE.PointLight(0x00cec9, 1.5, 80);
    point1.position.set(15, 15, 20);
    scene.add(point1);
    const point2 = new THREE.PointLight(0xfd79a8, 0.8, 60);
    point2.position.set(-15, -10, 15);
    scene.add(point2);

    // === MOUSE TRACKING ===
    document.addEventListener('mousemove', (e) => {
        targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    // === RESIZE ===
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // === SCROLL PARALLAX FOR 3D SCENE ===
    let scrollY = 0;
    window.addEventListener('scroll', () => { scrollY = window.scrollY; });

    // === ANIMATE ===
    function animate() {
        requestAnimationFrame(animate);
        const time = performance.now() * 0.001;

        // Smooth mouse
        mouseX += (targetMouseX - mouseX) * 0.05;
        mouseY += (targetMouseY - mouseY) * 0.05;

        // Animate particles
        const posArr = particles.geometry.attributes.position.array;
        for (let i = 0; i < particleCount; i++) {
            posArr[i * 3] += velocities[i].x;
            posArr[i * 3 + 1] += velocities[i].y;
            posArr[i * 3 + 2] += velocities[i].z;
            // Wrap around
            if (posArr[i * 3] > 40) posArr[i * 3] = -40;
            if (posArr[i * 3] < -40) posArr[i * 3] = 40;
            if (posArr[i * 3 + 1] > 40) posArr[i * 3 + 1] = -40;
            if (posArr[i * 3 + 1] < -40) posArr[i * 3 + 1] = 40;
        }
        particles.geometry.attributes.position.needsUpdate = true;

        // Update connection lines
        let lineIdx = 0;
        const lp = lineGeo.attributes.position.array;
        const lc = lineGeo.attributes.color.array;
        for (let i = 0; i < particleCount && lineIdx < maxLines; i += 4) {
            for (let j = i + 4; j < particleCount && lineIdx < maxLines; j += 4) {
                const dx = posArr[i * 3] - posArr[j * 3];
                const dy = posArr[i * 3 + 1] - posArr[j * 3 + 1];
                const dz = posArr[i * 3 + 2] - posArr[j * 3 + 2];
                const dist = dx * dx + dy * dy + dz * dz;
                if (dist < 80) {
                    const idx = lineIdx * 6;
                    lp[idx] = posArr[i * 3]; lp[idx + 1] = posArr[i * 3 + 1]; lp[idx + 2] = posArr[i * 3 + 2];
                    lp[idx + 3] = posArr[j * 3]; lp[idx + 4] = posArr[j * 3 + 1]; lp[idx + 5] = posArr[j * 3 + 2];
                    const alpha = 1 - dist / 80;
                    lc[idx] = 0.42 * alpha; lc[idx + 1] = 0.36 * alpha; lc[idx + 2] = 0.91 * alpha;
                    lc[idx + 3] = 0.42 * alpha; lc[idx + 4] = 0.36 * alpha; lc[idx + 5] = 0.91 * alpha;
                    lineIdx++;
                }
            }
        }
        for (let i = lineIdx * 6; i < maxLines * 6; i++) { lp[i] = 0; lc[i] = 0; }
        lineGeo.attributes.position.needsUpdate = true;
        lineGeo.attributes.color.needsUpdate = true;
        lineGeo.setDrawRange(0, lineIdx * 2);

        // Rotate & float shapes
        particles.rotation.y += 0.0002;
        shapes.forEach(s => {
            if (s.userData.rotSpeed) {
                s.rotation.x += s.userData.rotSpeed.x || s.userData.rotSpeed;
                s.rotation.y += s.userData.rotSpeed.y || 0;
                if (s.userData.rotSpeed.z) s.rotation.z += s.userData.rotSpeed.z;
            }
            if (s.userData.baseY !== undefined) {
                s.position.y = s.userData.baseY + Math.sin(time * s.userData.floatSpeed + s.userData.floatOffset) * s.userData.floatAmp;
                s.position.x = s.userData.baseX + Math.cos(time * s.userData.floatSpeed * 0.7 + s.userData.floatOffset) * (s.userData.floatAmp * 0.5);
            }
            if (s.userData.pulseSpeed) {
                const pulse = 1 + Math.sin(time * s.userData.pulseSpeed) * 0.1;
                if (s.userData.baseY !== undefined) s.scale.setScalar(pulse * (0.6 + Math.random() * 0.01));
            }
        });

        // Orb follows mouse in 3D
        orb.position.x += (mouseX * 15 - orb.position.x) * 0.04;
        orb.position.y += (-mouseY * 15 - orb.position.y) * 0.04;
        orb.position.z = 10 + Math.sin(time * 2) * 2;
        orbGlow.position.copy(orb.position);
        orbMat.opacity = 0.2 + Math.sin(time * 3) * 0.1;

        // Camera parallax
        const scrollFactor = scrollY * 0.002;
        camera.position.x += (mouseX * 4 - camera.position.x) * 0.02;
        camera.position.y += (-mouseY * 4 + scrollFactor * 3 - camera.position.y) * 0.02;
        camera.position.z = 30 + Math.sin(time * 0.3) * 2;
        camera.lookAt(0, scrollFactor * 2, 0);

        // Lights react to mouse
        point1.position.x = 15 + mouseX * 10;
        point1.position.y = 15 - mouseY * 10;
        point2.position.x = -15 - mouseX * 8;
        point2.position.y = -10 + mouseY * 8;

        renderer.render(scene, camera);
    }
    animate();
})();

/* ==================== LOADER ==================== */
window.addEventListener('load', () => {
    setTimeout(() => document.getElementById('loader').classList.add('hidden'), 800);
});

/* ==================== CUSTOM CURSOR WITH TRAIL ==================== */
const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');

// Cursor trail
const trailCount = 8;
const trails = [];
if (window.innerWidth > 600) {
    for (let i = 0; i < trailCount; i++) {
        const trail = document.createElement('div');
        trail.className = 'cursor-trail';
        trail.style.cssText = `
            width: ${4 - i * 0.3}px; height: ${4 - i * 0.3}px;
            background: rgba(162, 155, 254, ${0.5 - i * 0.05});
            border-radius: 50%; position: fixed; pointer-events: none; z-index: 9999;
            transition: transform ${0.08 + i * 0.03}s ease-out;
            transform: translate(-50%, -50%);
        `;
        document.body.appendChild(trail);
        trails.push({ el: trail, x: 0, y: 0 });
    }
}

let cursorX = 0, cursorY = 0;
if (window.innerWidth > 600) {
    document.addEventListener('mousemove', (e) => {
        cursorX = e.clientX;
        cursorY = e.clientY;
        cursorDot.style.left = cursorX + 'px';
        cursorDot.style.top = cursorY + 'px';
        cursorOutline.style.left = cursorX + 'px';
        cursorOutline.style.top = cursorY + 'px';
    });

    // Animate trail
    function animateTrail() {
        let x = cursorX, y = cursorY;
        trails.forEach((t, i) => {
            t.x += (x - t.x) * (0.3 - i * 0.025);
            t.y += (y - t.y) * (0.3 - i * 0.025);
            t.el.style.left = t.x + 'px';
            t.el.style.top = t.y + 'px';
            x = t.x; y = t.y;
        });
        requestAnimationFrame(animateTrail);
    }
    animateTrail();

    // Cursor hover effects
    document.querySelectorAll('a, button, .skill-tag, .project-card, .info-card, .achieve-card, .cert-item').forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursorOutline.style.width = '52px';
            cursorOutline.style.height = '52px';
            cursorOutline.style.borderColor = '#a29bfe';
            cursorOutline.style.background = 'rgba(108, 92, 231, 0.08)';
        });
        el.addEventListener('mouseleave', () => {
            cursorOutline.style.width = '36px';
            cursorOutline.style.height = '36px';
            cursorOutline.style.borderColor = '#6c5ce7';
            cursorOutline.style.background = 'transparent';
        });
    });
}

/* ==================== 3D TILT EFFECT ON CARDS ==================== */
function initTilt() {
    const tiltElements = document.querySelectorAll('.info-card, .skill-category, .project-card, .achieve-card, .timeline-card');
    tiltElements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / centerY * -8;
            const rotateY = (x - centerX) / centerX * 8;
            el.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`;
            el.style.transition = 'transform 0.1s ease-out';

            // Dynamic shine effect
            const shine = el.querySelector('.card-shine') || createShine(el);
            shine.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(108, 92, 231, 0.15), transparent 60%)`;
        });
        el.addEventListener('mouseleave', () => {
            el.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
            el.style.transition = 'transform 0.5s ease-out';
            const shine = el.querySelector('.card-shine');
            if (shine) shine.style.background = 'transparent';
        });
    });
}

function createShine(el) {
    const shine = document.createElement('div');
    shine.className = 'card-shine';
    shine.style.cssText = 'position:absolute;inset:0;border-radius:inherit;pointer-events:none;z-index:1;';
    el.style.position = 'relative';
    el.style.overflow = 'hidden';
    el.appendChild(shine);
    return shine;
}

/* ==================== TYPED TEXT ==================== */
const titles = ['Java Developer', 'Spring Boot Engineer', 'Cloud Enthusiast', 'Problem Solver', 'Backend Developer'];
let titleIndex = 0, charIndex = 0, isDeleting = false;
const typedEl = document.getElementById('typed-text');
function typeEffect() {
    const current = titles[titleIndex];
    typedEl.textContent = current.substring(0, charIndex);
    if (!isDeleting) {
        charIndex++;
        if (charIndex > current.length) { isDeleting = true; setTimeout(typeEffect, 1800); return; }
    } else {
        charIndex--;
        if (charIndex === 0) { isDeleting = false; titleIndex = (titleIndex + 1) % titles.length; }
    }
    setTimeout(typeEffect, isDeleting ? 40 : 90);
}
typeEffect();

/* ==================== NAVBAR SCROLL ==================== */
const navbar = document.getElementById('navbar');
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const curr = window.scrollY;
    navbar.classList.toggle('scrolled', curr > 50);
    lastScroll = curr;
});

/* ==================== MOBILE MENU ==================== */
const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');
menuToggle.addEventListener('click', () => mobileMenu.classList.toggle('open'));
mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

/* ==================== REVEAL ON SCROLL WITH STAGGER ==================== */
const revealElements = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            // Stagger children if inside a grid
            const parent = entry.target.parentElement;
            const siblings = parent ? Array.from(parent.querySelectorAll('.reveal')) : [];
            const idx = siblings.indexOf(entry.target);
            setTimeout(() => entry.target.classList.add('active'), idx * 120);
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });
revealElements.forEach(el => revealObserver.observe(el));

/* ==================== PARALLAX SECTIONS ==================== */
function parallaxSections() {
    const sections = document.querySelectorAll('.section');
    const scrollTop = window.scrollY;
    sections.forEach(sec => {
        const rect = sec.getBoundingClientRect();
        const speed = 0.05;
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            const offset = rect.top * speed;
            sec.style.transform = `translateY(${offset}px)`;
        }
    });
}
window.addEventListener('scroll', parallaxSections);

/* ==================== MAGNETIC BUTTONS ==================== */
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    });
    btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0, 0)';
        btn.style.transition = 'transform 0.4s ease-out';
    });
    btn.addEventListener('mouseenter', () => {
        btn.style.transition = 'transform 0.1s ease-out';
    });
});

/* ==================== SMOOTH NAV LINKS ==================== */
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(a.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
});

/* ==================== COUNTER ANIMATION ==================== */
function animateCounters() {
    document.querySelectorAll('.info-card h3').forEach(el => {
        const text = el.textContent;
        const match = text.match(/(\d+)\+?/);
        if (match) {
            const target = parseInt(match[1]);
            const suffix = text.includes('+') ? '+' : '';
            let count = 0;
            const increment = target / 60;
            const timer = setInterval(() => {
                count += increment;
                if (count >= target) { count = target; clearInterval(timer); }
                el.textContent = Math.floor(count) + suffix;
            }, 20);
        }
    });
}
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounters();
            counterObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.3 });
const aboutSection = document.getElementById('about');
if (aboutSection) counterObserver.observe(aboutSection);

/* ==================== ACTIVE NAV HIGHLIGHT ==================== */
const navLinks = document.querySelectorAll('.nav-links a');
const sectionIds = ['about', 'skills', 'experience', 'projects', 'achievements', 'contact'];
window.addEventListener('scroll', () => {
    let current = '';
    sectionIds.forEach(id => {
        const sec = document.getElementById(id);
        if (sec && window.scrollY >= sec.offsetTop - 200) current = id;
    });
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) link.classList.add('active');
    });
});

/* ==================== INITIALIZE ==================== */
window.addEventListener('DOMContentLoaded', () => {
    initTilt();
});
