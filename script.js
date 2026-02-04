import { artData } from "./data.js";

// --- CONFIGURAÇÃO E DADOS ---
const contentMap = {
  lab_tt:
    "Bem-vindo ao laboratório.\nUm espaço de experimentos visuais e caos organizado.",
  tt: "Matheus Araripe Lopes Corrêa\nCreative Coder & Designer.\nDisponível em behance.net/matheusararipe",
  mobile_warning:
    "Saia do celular!\nCertas coisas foram feitas para serem apreciadas em telas maiores!",
  dont_click: "┌∩┐(◣_◢)┌∩┐",
};

// --- UTILS ---
const getRandomPosition = (cw, ch, w, h) => ({
  x: Math.random() * (cw - w - 100) + 50,
  y: Math.random() * (ch - h - 100) + 50,
});

const getClientCoords = (e) => {
  if (e.touches && e.touches.length > 0) {
    return { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }
  return { x: e.clientX, y: e.clientY };
};

// --- CROSSHAIR ---
const initCrosshair = () => {
  const lineX = document.getElementById("crosshair-x");
  const lineY = document.getElementById("crosshair-y");
  const moveLines = (e) => {
    lineX.style.transform = `translate3d(0, ${e.clientY}px, 0)`;
    lineY.style.transform = `translate3d(${e.clientX}px, 0, 0)`;
  };
  window.addEventListener("mousemove", moveLines);
};

// --- ELEMENTS ---
const createDesktopArtElement = (art) => {
  const el = document.createElement("div");
  el.className = "art-item group";
  el.style.width = `${art.width}px`;
  el.style.height = `${art.height}px`;

  let contentHtml = "";
  if (art.img) {
    contentHtml = `<img src="${art.img}" alt="${art.title}" class="w-full h-full object-cover pointer-events-none select-none">`;
  } else {
    contentHtml = `<div class="absolute inset-0" style="background-color: ${art.color}; opacity: 0.9;"></div>`;
  }

  el.innerHTML = `
                <div class="w-full h-full relative overflow-hidden pointer-events-none">
                     ${contentHtml}
                </div>
            `;

  el.addEventListener("dblclick", () => window.open(art.url, "_blank"));
  return { element: el, ...art };
};

const createMobileLogo = (art) => {
  const el = document.createElement("div");
  el.className = "art-item pointer-events-auto";
  el.style.width = `${art.width}px`;
  el.style.height = `${art.height}px`;
  el.style.position = "absolute";

  if (art.img) {
    el.innerHTML = `<img src="${art.img}" alt="${art.title}" class="w-full h-full object-contain pointer-events-none select-none">`;
  } else {
    el.innerHTML = `
                    <div class="w-full h-full flex items-center justify-center" style="background-color: ${art.color}">
                        <span class="text-white font-bold text-xs uppercase tracking-widest">${art.title}</span>
                    </div>
                `;
  }
  return el;
};

// --- TYPEWRITER ---
let currentTypingTimeout = null;
const typeWriter = (text, element, speed = 40) => {
  element.innerText = "";
  if (currentTypingTimeout) clearTimeout(currentTypingTimeout);

  let i = 0;
  const type = () => {
    if (i < text.length) {
      text.charAt(i) === "\n"
        ? (element.innerHTML += "<br>")
        : (element.innerHTML += text.charAt(i));
      i++;
      const randomVariation = Math.random() * 30 - 15;
      const currentSpeed = Math.max(10, speed + randomVariation);
      currentTypingTimeout = setTimeout(type, currentSpeed);
    }
  };
  type();
};

// --- DRAG AND DROP ---
let globalZIndex = 50;

const makeDraggable = (el) => {
  let isDragging = false;
  let startX, startY, initialLeft, initialTop;

  const onStart = (e) => {
    if (e.type === "touchstart") {
    } else if (e.button !== 0) return;

    isDragging = true;
    const coords = getClientCoords(e);
    startX = coords.x;
    startY = coords.y;
    initialLeft = el.offsetLeft;
    initialTop = el.offsetTop;

    globalZIndex++;
    el.style.zIndex = globalZIndex;

    // REMOVIDO: 'shadow-2xl'. Mantido apenas o cursor e a escala
    el.classList.add("cursor-grabbing", "scale-[1.02]");
  };

  const onMove = (e) => {
    if (!isDragging) return;
    if (e.cancelable) e.preventDefault();
    const coords = getClientCoords(e);
    const dx = coords.x - startX;
    const dy = coords.y - startY;
    el.style.left = `${initialLeft + dx}px`;
    el.style.top = `${initialTop + dy}px`;
  };

  const onEnd = () => {
    if (isDragging) {
      isDragging = false;
      // REMOVIDO: 'shadow-2xl'
      el.classList.remove("cursor-grabbing", "scale-[1.02]");
    }
  };

  el.addEventListener("mousedown", onStart);
  window.addEventListener("mousemove", onMove);
  window.addEventListener("mouseup", onEnd);
  el.addEventListener("touchstart", onStart, { passive: false });
  window.addEventListener("touchmove", onMove, { passive: false });
  window.addEventListener("touchend", onEnd);
};

// --- MAIN APP ---
const app = () => {
  const isMobile = window.innerWidth < 768;

  if (isMobile) {
    initMobileView();
  } else {
    initDesktopView();
  }
};

const initMobileView = () => {
  const logoLayer = document.getElementById("mobile-logo-layer");
  const mobileTextElement = document.getElementById("mobile-typewriter-text");
  const logoData = artData[0];
  const logoElement = createMobileLogo(logoData);

  const centerX = (window.innerWidth - logoData.width) / 2;
  const centerY = (window.innerHeight - logoData.height) / 3;
  logoElement.style.left = `${centerX}px`;
  logoElement.style.top = `${centerY}px`;

  makeDraggable(logoElement);
  logoLayer.appendChild(logoElement);

  setTimeout(() => {
    typeWriter(contentMap.mobile_warning, mobileTextElement, 50);
  }, 500);
};

const initDesktopView = () => {
  const container = document.getElementById("canvas-container");
  const textElement = document.getElementById("typewriter-text");
  const btnLab = document.getElementById("btn-lab");
  const btnTt = document.getElementById("btn-tt");
  const btnDontClick = document.getElementById("btn-dont-click");

  initCrosshair();

  const renderArts = () => {
    const { clientWidth, clientHeight } = container;
    artData
      .slice(1)
      .map(createDesktopArtElement)
      .forEach((obj, index) => {
        const pos = getRandomPosition(
          clientWidth,
          clientHeight,
          obj.width,
          obj.height,
        );
        obj.element.style.left = `${pos.x}px`;
        obj.element.style.top = `${pos.y}px`;
        obj.element.style.zIndex = index + 10;
        makeDraggable(obj.element);
        container.appendChild(obj.element);
      });
  };

  const updateInfo = (key) => typeWriter(contentMap[key], textElement);

  btnLab.addEventListener("click", () => updateInfo("lab_tt"));
  btnTt.addEventListener("click", () => updateInfo("tt"));
  btnDontClick.addEventListener("click", () => updateInfo("dont_click"));

  renderArts();
  updateInfo("lab_tt");
};

document.addEventListener("DOMContentLoaded", app);
