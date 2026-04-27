/* ─── NAV SCROLL STATE ─── */
window.addEventListener('scroll', function () {
    var nav = document.querySelector('.grid1');
    if (!nav) return;
    nav.classList.toggle('grid1--scrolled', window.scrollY > 0);
});

/* ─── HARDWARE PARALLAX BACKGROUND ─────────────────────────────
   Three-layer PCB aesthetic injected into <body> as a fixed
   full-screen element. Runs via requestAnimationFrame with
   lerp smoothing so layers trail the cursor naturally.

   Depth multipliers:
     BG  0.08 → barely moves (large, distant IC blocks)
     Mid 0.22 → medium drift (main trace layer)
     FG  0.45 → fastest shift (fine details, closest to viewer)

   All transforms use translate3d() → GPU composited layer,
   zero layout/paint cost at 60fps.
─────────────────────────────────────────────────────────────── */
(function () {
    /* ── Inject layer structure ── */
    var parallax = document.createElement('div');
    parallax.className = 'hw-parallax';
    parallax.setAttribute('aria-hidden', 'true');
    parallax.innerHTML =
        '<div class="hw-layer hw-layer--bg"  data-depth="0.08"></div>' +
        '<div class="hw-layer hw-layer--mid" data-depth="0.22"></div>' +
        '<div class="hw-layer hw-layer--fg"  data-depth="0.45"></div>';
    document.body.insertBefore(parallax, document.body.firstChild);

    /* ── Inject glowing data-node dots on the FG layer ──────────
       Nodes pulse asynchronously — like active data packets on a
       bus. Two are amber (rare, high-value signal) the rest cyan.
    ──────────────────────────────────────────────────────────── */
    var fgLayer = parallax.querySelector('.hw-layer--fg');

    var nodeConfig = [
        { size: 4, color: '#22d3ee', dur: '3.2s', delay: '0s'    },
        { size: 5, color: '#22d3ee', dur: '4.0s', delay: '0.7s'  },
        { size: 6, color: '#fbbf24', dur: '2.8s', delay: '1.4s'  },
        { size: 4, color: '#22d3ee', dur: '3.6s', delay: '0.3s'  },
        { size: 5, color: '#22d3ee', dur: '5.1s', delay: '2.1s'  },
        { size: 4, color: '#22d3ee', dur: '3.8s', delay: '1.0s'  },
        { size: 7, color: '#fbbf24', dur: '4.4s', delay: '1.8s'  },
        { size: 4, color: '#22d3ee', dur: '2.6s', delay: '0.5s'  },
        { size: 5, color: '#22d3ee', dur: '3.3s', delay: '2.6s'  },
        { size: 4, color: '#22d3ee', dur: '4.7s', delay: '0.9s'  },
    ];

    /* Seed positions so they don't cluster — simple grid + jitter */
    var cols = 4, rows = 3;
    nodeConfig.forEach(function (cfg, i) {
        var col = i % cols;
        var row = Math.floor(i / cols) % rows;
        var x = (col / cols * 88 + 6 + (Math.random() - 0.5) * 12).toFixed(1);
        var y = (row / rows * 80 + 10 + (Math.random() - 0.5) * 14).toFixed(1);

        var node = document.createElement('div');
        node.className = 'hw-node';
        node.style.cssText = [
            'width:'  + cfg.size + 'px',
            'height:' + cfg.size + 'px',
            'left:'   + x + '%',
            'top:'    + y + '%',
            'background:' + cfg.color,
            'box-shadow: 0 0 ' + (cfg.size * 3) + 'px ' + cfg.color,
            '--node-dur:'   + cfg.dur,
            '--node-delay:' + cfg.delay,
        ].join(';');
        fgLayer.appendChild(node);
    });

    /* ── Parallax motion loop ────────────────────────────────────
       targetX/Y  — raw mouse position normalised to -1..+1
       currentX/Y — lerped toward target each frame (smoothing)
       LERP = 0.05 → ~20 frames to reach 95% of target,
              giving that satisfying "camera weight" feel.
    ──────────────────────────────────────────────────────────── */
    var layers  = parallax.querySelectorAll('.hw-layer');
    var targetX = 0, targetY = 0;
    var currentX = 0, currentY = 0;
    var LERP = 0.05;
    var MAX_SHIFT = 28; /* px of travel at depth = 1.0 */

    /* Use passive listener — no preventDefault needed, zero jank */
    window.addEventListener('mousemove', function (e) {
        var cx = window.innerWidth  / 2;
        var cy = window.innerHeight / 2;
        targetX = (e.clientX - cx) / cx;
        targetY = (e.clientY - cy) / cy;
    }, { passive: true });

    /* Restore to center when cursor leaves the viewport */
    window.addEventListener('mouseleave', function () {
        targetX = 0;
        targetY = 0;
    });

    function tick() {
        /* Lerp — smooth exponential ease toward target */
        currentX += (targetX - currentX) * LERP;
        currentY += (targetY - currentY) * LERP;

        for (var i = 0; i < layers.length; i++) {
            var depth = parseFloat(layers[i].dataset.depth) * MAX_SHIFT;
            var tx = (currentX * depth).toFixed(3);
            var ty = (currentY * depth).toFixed(3);
            /* translate3d triggers GPU compositing — no repaint */
            layers[i].style.transform = 'translate3d(' + tx + 'px,' + ty + 'px,0)';
        }

        requestAnimationFrame(tick);
    }

    /* Respect prefers-reduced-motion — skip the loop entirely */
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        requestAnimationFrame(tick);
    }
}());
