/* ============================================
   Hassan Ahmed — Portfolio JS
   ============================================ */

(function () {
    'use strict';

    /* ============================================
       CONSTELLATION CANVAS
       ============================================ */
    (function initCanvas() {
        const canvas = document.getElementById('heroCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        var W, H, particles, mouse;
        var PARTICLE_COUNT = 70;
        var CONNECTION_DIST = 140;
        var MOUSE_DIST = 180;

        mouse = { x: -9999, y: -9999 };

        function resize() {
            W = canvas.width  = canvas.offsetWidth;
            H = canvas.height = canvas.offsetHeight;
        }

        function Particle() {
            this.reset(true);
        }
        Particle.prototype.reset = function (initial) {
            this.x  = Math.random() * W;
            this.y  = initial ? Math.random() * H : -10;
            this.vx = (Math.random() - 0.5) * 0.35;
            this.vy = (Math.random() - 0.5) * 0.35;
            this.r  = Math.random() * 1.5 + 0.5;
            this.alpha = Math.random() * 0.4 + 0.15;
        };
        Particle.prototype.update = function () {
            this.x += this.vx;
            this.y += this.vy;
            if (this.x < -20) this.x = W + 10;
            if (this.x > W + 20) this.x = -10;
            if (this.y < -20) this.y = H + 10;
            if (this.y > H + 20) this.y = -10;

            // subtle mouse repulsion
            var dx = this.x - mouse.x;
            var dy = this.y - mouse.y;
            var dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < MOUSE_DIST) {
                var force = (MOUSE_DIST - dist) / MOUSE_DIST * 0.012;
                this.vx += (dx / dist) * force;
                this.vy += (dy / dist) * force;
            }

            // speed cap
            var speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            if (speed > 0.8) { this.vx = (this.vx / speed) * 0.8; this.vy = (this.vy / speed) * 0.8; }
        };

        function initParticles() {
            particles = [];
            for (var i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());
        }

        function draw() {
            ctx.clearRect(0, 0, W, H);

            // update & draw dots
            for (var i = 0; i < particles.length; i++) {
                var p = particles[i];
                p.update();
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(165,180,252,' + p.alpha + ')';
                ctx.fill();
            }

            // draw connections
            for (var i = 0; i < particles.length; i++) {
                for (var j = i + 1; j < particles.length; j++) {
                    var a = particles[i], b = particles[j];
                    var dx = a.x - b.x, dy = a.y - b.y;
                    var dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < CONNECTION_DIST) {
                        var opacity = (1 - dist / CONNECTION_DIST) * 0.18;
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.strokeStyle = 'rgba(165,180,252,' + opacity + ')';
                        ctx.lineWidth = 0.6;
                        ctx.stroke();
                    }
                }
            }

            requestAnimationFrame(draw);
        }

        window.addEventListener('resize', function () { resize(); initParticles(); }, { passive: true });
        document.getElementById('hero').addEventListener('mousemove', function (e) {
            var rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        }, { passive: true });
        document.getElementById('hero').addEventListener('mouseleave', function () {
            mouse.x = -9999; mouse.y = -9999;
        });

        resize();
        initParticles();
        draw();
    })();


    /* ============================================
       TEXT SCRAMBLE — hero name reveal
       ============================================ */
    (function initScramble() {
        var el = document.getElementById('heroName');
        if (!el) return;

        var CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&';
        var finalText = el.textContent;
        var revealed  = new Array(finalText.length).fill(false);
        var frame     = 0;
        var totalFrames = 38;
        var raf;

        el.style.fontVariantNumeric = 'tabular-nums';

        function scramble() {
            frame++;
            var progress = frame / totalFrames;

            var result = '';
            for (var i = 0; i < finalText.length; i++) {
                if (finalText[i] === ' ') { result += ' '; continue; }
                if (finalText[i] === '.') { result += revealed[i] ? '.' : CHARS[Math.floor(Math.random() * CHARS.length)]; continue; }

                var revealThreshold = i / finalText.length * 0.65;
                if (progress > revealThreshold || frame > totalFrames - 4) {
                    revealed[i] = true;
                }
                result += revealed[i] ? finalText[i] : CHARS[Math.floor(Math.random() * CHARS.length)];
            }

            el.textContent = result;

            if (frame < totalFrames) {
                raf = requestAnimationFrame(scramble);
            } else {
                el.textContent = finalText;
            }
        }

        // delay slightly so page paints first
        setTimeout(function () { raf = requestAnimationFrame(scramble); }, 300);
    })();


    /* ============================================
       CURSOR GLOW
       ============================================ */
    (function initCursorGlow() {
        var glow = document.getElementById('cursorGlow');
        if (!glow) return;

        var cx = window.innerWidth / 2, cy = window.innerHeight / 2;
        var tx = cx, ty = cy;
        var raf;

        document.addEventListener('mousemove', function (e) {
            tx = e.clientX;
            ty = e.clientY;
            glow.style.opacity = '1';
        }, { passive: true });

        document.addEventListener('mouseleave', function () {
            glow.style.opacity = '0';
        });

        function animateGlow() {
            cx += (tx - cx) * 0.1;
            cy += (ty - cy) * 0.1;
            glow.style.transform = 'translate(' + (cx - 200) + 'px, ' + (cy - 200) + 'px)';
            raf = requestAnimationFrame(animateGlow);
        }
        animateGlow();
    })();


    /* ============================================
       MAGNETIC BUTTONS
       ============================================ */
    document.querySelectorAll('.btn').forEach(function (btn) {
        btn.addEventListener('mousemove', function (e) {
            var rect = btn.getBoundingClientRect();
            var x = e.clientX - rect.left - rect.width  / 2;
            var y = e.clientY - rect.top  - rect.height / 2;
            btn.style.transform = 'translate(' + x * 0.18 + 'px, ' + y * 0.25 + 'px)';
        });
        btn.addEventListener('mouseleave', function () {
            btn.style.transform = '';
        });
    });


    /* ============================================
       NAV — scroll shadow + active link
       ============================================ */
    var nav = document.getElementById('nav');

    window.addEventListener('scroll', function () {
        nav.classList.toggle('scrolled', window.scrollY > 20);
        highlightNavLink();
    }, { passive: true });

    var navToggle = document.getElementById('navToggle');
    var navLinks  = document.getElementById('navLinks');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function () {
            var isOpen = navLinks.classList.toggle('open');
            navToggle.classList.toggle('open', isOpen);
        });
        navLinks.querySelectorAll('.nav-link').forEach(function (link) {
            link.addEventListener('click', function () {
                navLinks.classList.remove('open');
                navToggle.classList.remove('open');
            });
        });
        document.addEventListener('click', function (e) {
            if (!nav.contains(e.target)) {
                navLinks.classList.remove('open');
                navToggle.classList.remove('open');
            }
        });
    }

    function highlightNavLink() {
        var sections = document.querySelectorAll('section[id]');
        var links    = document.querySelectorAll('.nav-link');
        var current  = '';
        sections.forEach(function (s) {
            if (window.scrollY >= s.offsetTop - 120) current = s.id;
        });
        links.forEach(function (l) {
            l.classList.toggle('active', l.getAttribute('href') === '#' + current);
        });
    }


    /* ============================================
       SCROLL REVEAL
       ============================================ */
    var revealTargets = document.querySelectorAll(
        '.project-card, .skill-group, .article-card, .highlight-card, .about-text, .about-highlights'
    );

    revealTargets.forEach(function (el) { el.classList.add('fade-in'); });

    if ('IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        revealTargets.forEach(function (el) { observer.observe(el); });
    } else {
        revealTargets.forEach(function (el) { el.classList.add('visible'); });
    }

    // stagger grid children
    ['.projects-grid', '.skills-grid', '.articles-list'].forEach(function (sel) {
        var parent = document.querySelector(sel);
        if (!parent) return;
        Array.from(parent.children).forEach(function (child, i) {
            child.style.transitionDelay = (i * 0.07) + 's';
        });
    });


    /* ============================================
       YOUTUBE CLICK-TO-PLAY
       ============================================ */
    document.querySelectorAll('.video-thumb[data-video-id]').forEach(function (thumb) {
        thumb.addEventListener('click', function () {
            var iframe = document.createElement('iframe');
            iframe.src = 'https://www.youtube.com/embed/' + thumb.getAttribute('data-video-id') + '?autoplay=1&rel=0';
            iframe.allow = 'autoplay; encrypted-media; picture-in-picture';
            iframe.allowFullscreen = true;
            thumb.classList.add('playing');
            thumb.appendChild(iframe);
        });
    });

})();
