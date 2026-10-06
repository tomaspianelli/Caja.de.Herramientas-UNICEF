(() => {
    "use strict";
    
    /* ---------- Datos ---------- */
    const ENTORNOS = [
        { id: "escuelas" },
        { id: "cuidado" },
        { id: "salud" },
        { id: "recreativos" }
    ];
    
    // herramientas: suman 59 (se usa en la slide 7)
    const LINEAS = [
        { id: "eas",       nombre: "Educación alimentaria nutricional",     herramientas: 10 },
        { id: "agua",      nombre: "Agua segura",                           herramientas: 8 },
        { id: "huertas",   nombre: "Huertas pedagógicas y agroecológicas",  herramientas: 9 },
        { id: "oferta",    nombre: "Oferta de alimentos y bebidas",         herramientas: 9 },
        { id: "servicios", nombre: "Servicios de alimentación",             herramientas: 7 },
        { id: "actividad", nombre: "Actividad física",                      herramientas: 8 },
        { id: "lactancia", nombre: "Lactancia humana",                      herramientas: 8 }
    ];
    
    /* ---------- Navegación (solo teclado: ← → ↑ ↓ RePág AvPág Espacio) ---------- */
    const app = document.querySelector(".presentation");
    const slides = [...document.querySelectorAll(".slide")];
    const dos = n => String(n).padStart(2, "0");
    const idx = id => slides.findIndex(s => s.id === id);
    let actual = -1;
    
    // dir: "adelante" | "atras" | "zoom" | "derecha" (el CSS define cada movimiento)
    function mostrar(n, dir = "adelante") {
        if (document.body.classList.contains("virando") && dir !== "zoom") return;   // no se interrumpe la animación 4 → 5
        n = Math.max(0, Math.min(n, slides.length - 1));                             // frena en la primera y la última slide
        if (n === actual) return;
        const previa = slides[actual];
        app.dataset.dir = dir;
        if (previa) { previa.classList.add("sale"); setTimeout(() => previa.classList.remove("sale"), 700); }
        slides.forEach((s, i) => {
            s.classList.toggle("active", i === n);
            s.inert = i !== n;   // las slides ocultas no reciben foco con Tab ni las lee un lector de pantalla
        });
        actual = n;
        if (slides[n].id === "slide6") reiniciarAnatomia();
        if (slides[n].id === "slide7") contarTotal();
    }
    
    const SIGUIENTE = ["ArrowRight", "ArrowDown", "PageDown", " "];
    const ANTERIOR = ["ArrowLeft", "ArrowUp", "PageUp"];
    document.addEventListener("keydown", e => {
        if (document.body.classList.contains("zoom-abierto") || e.repeat) return;   // con los logos ampliados no se cambia de slide
        if (e.key === " " && e.target.closest("button")) return;                    // el espacio sobre un botón lo activa, no avanza
        if (SIGUIENTE.includes(e.key)) { e.preventDefault(); mostrar(actual + 1); }
        else if (ANTERIOR.includes(e.key)) { e.preventDefault(); mostrar(actual - 1, "atras"); }
    });
    mostrar(0);
    
    /* ---------- Slide 3 · Cuadro (vectorial) ---------- */
    const icono = (id, vb) => `<svg viewBox="${vb}"><use href="#i-${id}"/></svg>`;
    const celda = (clase, contenido, n) => `<div class="${clase}" style="--i:${n}">${contenido}</div>`;
    
    {
        let n = 0;
        let celdas = celda("esquina",
            '<span class="e-ent">Entornos</span><span class="e-lin">Líneas de<br>trabajo</span>', n++);
    
        ENTORNOS.forEach(e => {
            celdas += celda("cab", icono(e.id, "0 0 100 100"), n++);
        });
    
        LINEAS.forEach(l => {
            celdas += celda("fila", `${icono(l.id, "0 0 24 24")}<span>${l.nombre}</span>`, n++);
            ENTORNOS.forEach(() => { celdas += celda("ok", icono("check", "0 0 24 24"), n++); });
        });
    
        document.getElementById("matriz").innerHTML = celdas;
    }
    
    
    /* ---------- Portadas (slides 4, 5 y 8) ---------- */
    const portada = i => `assets/Portada-2.${i + 1}.png`;
    
    // Slide 4 · solo la primera portada se puede abrir
    const lineas = document.getElementById("lineas");
    lineas.innerHTML = LINEAS.map((l, i) => i === 0
        ? `<button class="portada activa" id="abrirPdf" style="--i:${i}" aria-label="Abrir la línea: ${l.nombre}"><img src="${portada(i)}" alt="${l.nombre}"></button>`
        : `<div class="portada" style="--i:${i}"><img src="${portada(i)}" alt="${l.nombre}"></div>`).join("");
    
    const abrirPdf = document.getElementById("abrirPdf");
    const slide4 = document.getElementById("slide4");
    abrirPdf.addEventListener("click", () => {
        if (lineas.classList.contains("abriendo")) return;
        if (matchMedia("(prefers-reduced-motion: reduce)").matches) { mostrar(idx("slide5"), "zoom"); return; }
    
        const r = abrirPdf.getBoundingClientRect();
        const desde = getComputedStyle(abrirPdf).transform;   // arranca justo donde está, sin saltos
        const dx = innerWidth / 2 - (r.left + r.width / 2);
        const dy = innerHeight / 2 - (r.top + r.height / 2);
        const s = Math.min(innerHeight * 0.72 / r.height, 3.4);                      // portada grande en el centro
        const fin = Math.max(innerWidth / r.width, innerHeight / r.height) * 1.15;   // portada cubriendo toda la pantalla
        const paso = k => `translate(${dx}px, ${dy}px) scale(${(s * Math.pow(fin / s, k)).toFixed(3)})`;
    
        lineas.classList.add("abriendo");
        slide4.classList.add("abriendo");
        document.body.classList.add("virando");   // el fondo empieza a pasar a blanco
    
        // 1) viaja al centro y se agranda  2) pausa breve  3) zoom continuo y la portada se vuelve transparente
        const N = 6;
        const cuadros = [
            { transform: desde,   opacity: 1, offset: 0,    easing: "cubic-bezier(.22, .8, .3, 1)" },
            { transform: paso(0), opacity: 1, offset: 0.36 },
            { transform: paso(0), opacity: 1, offset: 0.44 }
        ];
        for (let k = 1; k <= N; k++) {
            cuadros.push({
                transform: paso(k / N),
                opacity: Math.max(0, 1 - k / N),   // llega a 0 justo al terminar el zoom
                offset: 0.44 + 0.56 * k / N
            });
        }
        const anim = abrirPdf.animate(cuadros, { duration: 1800, easing: "linear", fill: "forwards" });
    
        setTimeout(() => mostrar(idx("slide5"), "zoom"), 1650);   // la slide 5 aparece recién en los últimos milisegundos
        setTimeout(() => { anim.cancel(); lineas.classList.remove("abriendo"); slide4.classList.remove("abriendo"); document.body.classList.remove("virando"); }, 2300);   // limpieza cuando la slide 4 ya está oculta
    });
    
    // Slide 5 · solo la Herramienta 1 se puede abrir
    document.getElementById("abrirHerr").addEventListener("click", () => mostrar(idx("slide6"), "derecha"));
    
    // Slide 8 · portadas en círculo; el hover frena el giro y muestra la cantidad
    const orbita = document.getElementById("orbita");
    orbita.innerHTML = LINEAS.map((l, i) => `
        <div class="pos" style="--a:${(360 / LINEAS.length * i).toFixed(2)}deg">
            <figure class="tarjeta" tabindex="0">
                <img src="${portada(i)}" alt="${l.nombre}">
                <figcaption class="info"><strong>${l.herramientas}</strong><span>herramientas</span></figcaption>
            </figure>
        </div>`).join("");
    
    orbita.addEventListener("pointerover", e => { if (e.target.closest(".tarjeta")) orbita.classList.add("pausa"); });
    orbita.addEventListener("pointerout", e => { if (!e.relatedTarget || !e.relatedTarget.closest(".tarjeta")) orbita.classList.remove("pausa"); });
    orbita.addEventListener("focusin", () => orbita.classList.add("pausa"));
    orbita.addEventListener("focusout", () => orbita.classList.remove("pausa"));
    
    function contarTotal() {
        const el = document.getElementById("totalNum");
        const fin = LINEAS.reduce((suma, l) => suma + l.herramientas, 0);
        if (matchMedia("(prefers-reduced-motion: reduce)").matches) { el.textContent = fin; return; }
        const t0 = performance.now();
        (function paso(t) {
            const p = Math.min((t - t0) / 1400, 1);
            el.textContent = Math.round(fin * (1 - Math.pow(1 - p, 3)));
            if (p < 1) requestAnimationFrame(paso);
        })(t0);
    }
    
    
    /* ---------- Slide 6 · La herramienta completa (hoja con scroll) ---------- */
    // t y h = posición y alto de cada paso dentro de la imagen, en %; l y w = izquierda y ancho (por defecto 3 % y 94 %).
    // El primer paso (los logos de arriba) no tiene título: no aparece en el índice de la izquierda.
    const SECCIONES = [
        {
            "t": 4.27,
            "h": 10.12,
            "l": 72.56,
            "w": 14.85
        },
        {
            "titulo": "PROPÓSITO",
            "t": 12.6,
            "h": 3.24
        },
        {
            "titulo": "RECURSOS",
            "t": 16.94,
            "h": 4.13
        },
        {
            "titulo": "TIEMPO",
            "t": 22.18,
            "h": 4.13
        },
        {
            "titulo": "DESCRIPCIÓN DE LA HERRAMIENTA",
            "t": 28.1,
            "h": 20.52
        },
        {
            "titulo": "EJEMPLO DE TEMÁTICAS PARA LOS TALLERES",
            "t": 60.88,
            "h": 14.46
        },
        {
            "titulo": "RECOMENDACIONES",
            "t": 77.82,
            "h": 8.4
        },
        {
            "titulo": "MATERIALES DE REFERENCIA",
            "t": 86.5,
            "h": 10.47
        }
    ];
    
    const slide6 = document.getElementById("slide6");
    const hoja = document.getElementById("hoja");
    const hojaInt = document.getElementById("hojaInt");
    const foco = document.getElementById("foco");
    const anatIndice = document.getElementById("anatIndice");
    const anatPista = document.getElementById("anatPista");
    let seccion = -1, auto = false, finAuto = 0, pendiente = false;
    
    anatIndice.innerHTML = SECCIONES.map((s, i) => s.titulo
        ? `<li><button type="button" data-i="${i}"><span>${dos(i)}</span>${s.titulo}</button></li>` : "").join("");
    
    function activarSeccion(i) {
        if (i === seccion) return;
        seccion = i;
        foco.style.setProperty("--t", SECCIONES[i].t + "%");
        foco.style.setProperty("--h", SECCIONES[i].h + "%");
        foco.style.setProperty("--l", (SECCIONES[i].l ?? 3) + "%");
        foco.style.setProperty("--w", (SECCIONES[i].w ?? 94) + "%");
        anatIndice.querySelectorAll("button").forEach(b => b.classList.toggle("on", +b.dataset.i === i));
    }
    
    // "línea de lectura": al inicio del scroll está en el borde superior de la hoja y al final en el borde inferior,
    // así la primera y la última sección siempre se pueden alcanzar
    function seccionVisible() {
        const max = hoja.scrollHeight - hoja.clientHeight;
        const avance = max > 0 ? hoja.scrollTop / max : 0;
        const centro = (hoja.scrollTop + hoja.clientHeight * avance) / hojaInt.offsetHeight * 100;
        let mejor = 0, dist = Infinity;
        SECCIONES.forEach((s, i) => {
            const d = Math.abs(s.t + s.h / 2 - centro);
            if (d < dist) { dist = d; mejor = i; }
        });
        return mejor;
    }
    
    hoja.addEventListener("scroll", () => {
        anatPista.classList.add("oculta");
        if (auto) {   // scroll automático por clic en el índice: se mantiene lo elegido hasta que termine
            clearTimeout(finAuto);
            finAuto = setTimeout(() => { auto = false; }, 160);
            return;
        }
        if (pendiente) return;
        pendiente = true;
        requestAnimationFrame(() => { pendiente = false; activarSeccion(seccionVisible()); });
    });
    
    // la rueda / el trackpad mueve la hoja en cualquier parte de la slide, sin hacer clic ni tener el cursor encima
    // (con el teclado ↑ ↓ se cambia de slide, igual que ← →)
    slide6.addEventListener("wheel", e => {
        if (e.ctrlKey || document.body.classList.contains("zoom-abierto")) return;   // Ctrl + rueda = zoom del navegador
        e.preventDefault();
        const k = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? hoja.clientHeight : 1;   // líneas / páginas -> px
        hoja.scrollTop += e.deltaY * k;
    }, { passive: false });
    
    // clic en un título del índice: la hoja se desplaza hasta esa sección
    anatIndice.addEventListener("click", e => {
        const b = e.target.closest("button");
        if (!b) return;
        const i = +b.dataset.i;
        auto = true;
        clearTimeout(finAuto);
        finAuto = setTimeout(() => { auto = false; }, 1200);
        activarSeccion(i);
        hoja.scrollTo({ top: SECCIONES[i].t / 100 * hojaInt.offsetHeight - hoja.clientHeight * 0.15, behavior: "smooth" });
    });
    
    function reiniciarAnatomia() {
        hoja.scrollTop = 0;
        cerrarLogos();
        auto = false;
        seccion = -1;
        anatPista.classList.remove("oculta");
        activarSeccion(0);
        hoja.focus({ preventScroll: true });
    }
    
    
    /* ---------- Slide 6 · Los dos logos de arriba a la derecha: a color, con lupa y ampliables ---------- */
    const NAT_W = 532, NAT_H = 1452;   // medidas de referencia de foto-completa-herramienta.png; si la re-exportás más grande con la misma proporción, no hace falta tocar nada
    // cajas (en px de las medidas de referencia) de los dos logos de cada página
    const LOGOS = [
        [{ x: 396, y: 72, w: 59, h: 58 }, { x: 396, y: 141, w: 59, h: 58 }],     // página 1
        [{ x: 397, y: 771, w: 58, h: 59 }, { x: 397, y: 840, w: 58, h: 58 }]     // página 2
    ];
    const zoomLogos = document.getElementById("zoomLogos");
    
    function abrirLogos() {
        zoomLogos.classList.add("abierto");
        zoomLogos.setAttribute("aria-hidden", "false");
        document.body.classList.add("zoom-abierto");
    }
    function cerrarLogos() {
        zoomLogos.classList.remove("abierto");
        zoomLogos.setAttribute("aria-hidden", "true");
        document.body.classList.remove("zoom-abierto");
    }
    
    LOGOS.forEach(par => {
        const x0 = Math.min(...par.map(l => l.x)), y0 = Math.min(...par.map(l => l.y));
        const W = Math.max(...par.map(l => l.x + l.w)) - x0, H = Math.max(...par.map(l => l.y + l.h)) - y0;
        const b = document.createElement("button");
        b.type = "button";
        b.className = "logos-par";
        b.setAttribute("aria-label", "Ampliar los logos");
        b.style.cssText = `left:${x0 / NAT_W * 100}%;top:${y0 / NAT_H * 100}%;width:${W / NAT_W * 100}%;height:${H / NAT_H * 100}%`;
        b.innerHTML = par.map(l => `<span class="logo" style="left:${(l.x - x0) / W * 100}%;top:${(l.y - y0) / H * 100}%;width:${l.w / W * 100}%;height:${l.h / H * 100}%;` +
            `background-size:${NAT_W / l.w * 100}% ${NAT_H / l.h * 100}%;background-position:${l.x / (NAT_W - l.w) * 100}% ${l.y / (NAT_H - l.h) * 100}%"></span>`).join("");
        b.addEventListener("click", abrirLogos);
        hojaInt.appendChild(b);
    });
    
    document.getElementById("zoomCerrar").addEventListener("click", cerrarLogos);
    zoomLogos.addEventListener("click", e => { if (e.target === zoomLogos) cerrarLogos(); });
    document.addEventListener("keydown", e => { if (e.key === "Escape") cerrarLogos(); });
    
    })();