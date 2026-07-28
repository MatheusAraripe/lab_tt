import { artData } from "./data.js";

// --- CONFIGURAÇÃO E DADOS ---
const contentMap = {
  lab_tt:
    "Lab_tt é um espaço experimental para minhas ideias criativas e qualquer coisa que eu sentir vontade de jogar aqui.\nUm espaço de estudos visuais e caos organizado.",
  tt: "Matheus Araripe, Creative Coder & Designer.\nVeja mais aqui",
  // NOVA: Aba de trabalhos
  trabalhos_tt: "Inexplicável.ig  Inexplicável.idv",
  trabalhos_tt_mobile: "Inexplicável.ig\n\nInexplicável.idv",
  lab_tt_mobile:
    "Saia do celular!\nLab_tt é um espaço experimental que não cabe em uma tela vertical.",
  lab_js: "Agentes Elásticos   Ruído   Tripping",
  dont_click: "┌∩┐(◣_◢)┌∩┐",
};

const sketchDescriptions = {
  sketch01:
    "Sistema interativo de partículas inspirado em grafos, onde agentes autônomos se conectam e formam estruturas orgânicas dinâmicas, unindo arte generativa, física e matemática.",
  sketch02:
    "Obra interativa que simula um “éter” digital de partículas guiadas por ruído Perlin, explorando o equilíbrio entre ordem e caos.",
  sketch03:
    "Experiência visual hipnótica de fragmentos emergindo da escuridão, com cores sombrias e ritmo caótico, evocando uma deriva sensorial atemporal.",
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
const typeWriter = (text, element, speed = 40, onComplete = null) => {
  element.innerText = "";
  if (element.typingTimeout) clearTimeout(element.typingTimeout);

  let i = 0;
  const type = () => {
    if (i < text.length) {
      text.charAt(i) === "\n"
        ? (element.innerHTML += "<br>")
        : (element.innerHTML += text.charAt(i));
      i++;
      const randomVariation = Math.random() * 30 - 15;
      const currentSpeed = Math.max(10, speed + randomVariation);
      // Salva o timeout no elemento
      element.typingTimeout = setTimeout(type, currentSpeed);
    } else {
      if (onComplete) onComplete();
    }
  };
  type();
};

// --- DRAG AND DROP ---
let globalZIndex = 100;

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

  // Botões Mobile
  const mobNavLab = document.getElementById("btn-mob-lab");
  const mobNavTt = document.getElementById("btn-mob-tt");
  const mobNavTrab = document.getElementById("btn-mob-trabalhos");
  const mobNavFuck = document.getElementById("btn-mob-fuck");
  const navButtons = [mobNavLab, mobNavTt, mobNavTrab, mobNavFuck];

  // Centralizar Logo
  const centerX = (window.innerWidth - logoData.width) / 2;
  const centerY = (window.innerHeight - logoData.height) / 3;
  logoElement.style.left = `${centerX}px`;
  logoElement.style.top = `${centerY}px`;

  makeDraggable(logoElement);
  logoLayer.appendChild(logoElement);

  const setActiveButton = (clickedBtn) => {
    navButtons.forEach((btn) => btn.classList.remove("active"));
    clickedBtn.classList.add("active");
  };

  const updateInfoMobile = (key) => {
    const text = contentMap[key];
    typeWriter(text, mobileTextElement, 40, () => {
      if (key === "tt") {
        mobileTextElement.innerHTML = `Matheus Araripe<br>Creative Coder & Designer.<br><a href="https://www.behance.net/matheusararipe" target="_blank">Veja mais aqui</a>`;
      } else if (key === "trabalhos_tt") {
        mobileTextElement.innerHTML = `<a href="https://www.instagram.com/inexplicavelvinhos?igsh=cHdlOXVkYXJpNGNz" target="_blank">Inexplicável.ig</a>&nbsp&nbsp<a href="https://www.behance.net/gallery/252349023/InexplicavelIDV" target="_blank">Inexplicável.idv`;
      } else if (key === "trabalhos_tt_mobile") {
        mobileTextElement.innerHTML = `
          <a href="https://www.instagram.com/inexplicavelvinhos?igsh=cHdlOXVkYXJpNGNz" target="_blank">Inexplicável.ig</a><br><br><a href="https://www.behance.net/gallery/252349023/InexplicavelIDV" target="_blank">Inexplicável.idv</a>`;
      }
    });
  };

  // Animação de entrada simultânea do menu no celular
  setTimeout(() => {
    typeWriter("lab_tt", mobNavLab, 30);
    typeWriter("tt", mobNavTt, 30);
    typeWriter("trabalhos.tt", mobNavTrab, 30);
    // O último a terminar de digitar dispara o texto informativo base
    typeWriter("fuck!", mobNavFuck, 30, () => {
      updateInfoMobile("lab_tt_mobile");
      setActiveButton(mobNavLab);
    });
  }, 400);

  // Listeners do Mobile
  mobNavLab.addEventListener("click", () => {
    updateInfoMobile("lab_tt_mobile");
    setActiveButton(mobNavLab);
  });
  mobNavTt.addEventListener("click", () => {
    updateInfoMobile("tt");
    setActiveButton(mobNavTt);
  });
  mobNavTrab.addEventListener("click", () => {
    updateInfoMobile("trabalhos_tt_mobile");
    setActiveButton(mobNavTrab);
  });
  mobNavFuck.addEventListener("click", () => {
    updateInfoMobile("dont_click");
    setActiveButton(mobNavFuck);
  });
};

const initDesktopView = () => {
  const container = document.getElementById("canvas-container");
  const textElement = document.getElementById("typewriter-text");
  const tooltip = document.getElementById("sketch-tooltip");

  const btnLab = document.getElementById("btn-lab");
  const btnTt = document.getElementById("btn-tt");
  const btnTrabalhos = document.getElementById("btn-trabalhos");
  const btnLabJs = document.getElementById("btn-labjs");
  const btnFuck = document.getElementById("btn-fuck");

  const navButtons = [btnLab, btnTt, btnTrabalhos, btnLabJs, btnFuck];

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
        obj.element.style.zIndex = index + 40; // Mantendo z-index alto para as artes
        makeDraggable(obj.element);
        container.appendChild(obj.element);
      });
  };

  const updateInfo = (key) => {
    const text = contentMap[key];

    typeWriter(text, textElement, 40, () => {
      if (key === "tt") {
        textElement.innerHTML = `Matheus Araripe, Creative Coder & Designer.<br><a href="https://www.behance.net/matheusararipe" target="_blank">Veja mais aqui</a>`;
      } else if (key === "trabalhos_tt") {
        textElement.innerHTML = `<a href="https://www.instagram.com/inexplicavelvinhos?igsh=cHdlOXVkYXJpNGNz" target="_blank">Inexplicável.ig</a>&nbsp;&nbsp;&nbsp;<a href="https://www.behance.net/gallery/252349023/InexplicavelIDV" target="_blank">Inexplicável.idv</a>`;
      } else if (key === "lab_js") {
        // ATUALIZADO: Adicionamos classes e data-attributes aos links
        textElement.innerHTML = `<a href="https://matheusararipe.github.io/study-canvas-sketch/sketches/sketch01/dist/sketch01Funcional.html" target="_blank" class="sketch-link" data-id="sketch01">Agentes Elásticos</a>&nbsp;&nbsp;&nbsp<a href="https://matheusararipe.github.io/study-canvas-sketch/sketches/sketch02/dist/sketch02Funcional.html" target="_blank" class="sketch-link" data-id="sketch02">Ruído</a>&nbsp;&nbsp;&nbsp<a href="https://matheusararipe.github.io/study-canvas-sketch/sketches/sketch03/dist/" target="_blank" class="sketch-link" data-id="sketch03">Tripping</a>`;

        // 3. Lógica do Hover (Tooltip)
        const links = textElement.querySelectorAll(".sketch-link");

        links.forEach((link) => {
          // 1. MOSTRAR (MouseEnter)
          link.addEventListener("mouseenter", (e) => {
            const id = e.target.getAttribute("data-id");
            // Define o texto
            tooltip.innerHTML = sketchDescriptions[id].replace(/\n/g, "<br>");
            // Torna visível
            tooltip.classList.remove("opacity-0");
          });

          // 2. MOVER E POSICIONAR (MouseMove)
          link.addEventListener("mousemove", (e) => {
            // Recalcula o tamanho agora que o texto está dentro
            const tooltipWidth = tooltip.offsetWidth;
            const tooltipHeight = tooltip.offsetHeight;

            // CÁLCULO DO 1º QUADRANTE (Superior Esquerdo do Mouse)
            // X = Posição Mouse - Largura Balão - Margem
            // Y = Posição Mouse - Altura Balão - Margem
            const posX = e.clientX - tooltipWidth - 15;
            const posY = e.clientY - tooltipHeight - 15;

            // Aplica as coordenadas
            tooltip.style.left = `${posX}px`;
            tooltip.style.top = `${posY}px`;
          });

          // 3. ESCONDER (MouseLeave)
          link.addEventListener("mouseleave", () => {
            tooltip.classList.add("opacity-0");
          });
        });
      }
    });
  };

  const setActiveButton = (clickedBtn) => {
    navButtons.forEach((btn) => btn.classList.remove("active"));
    clickedBtn.classList.add("active");
  };

  btnLab.addEventListener("click", () => {
    updateInfo("lab_tt");
    setActiveButton(btnLab);
  });
  btnTt.addEventListener("click", () => {
    updateInfo("tt");
    setActiveButton(btnTt);
  });
  btnTrabalhos.addEventListener("click", () => {
    updateInfo("trabalhos_tt");
    setActiveButton(btnTrabalhos);
  });
  btnLabJs.addEventListener("click", () => {
    updateInfo("lab_js");
    setActiveButton(btnLabJs);
  });
  btnFuck.addEventListener("click", () => {
    updateInfo("dont_click");
    setActiveButton(btnFuck);
  });

  renderArts();
  updateInfo("lab_tt");
  setActiveButton(btnLab);
};

const initLoading = () => {
  const loadingScreen = document.getElementById("loading-screen");
  const loadingText = document.getElementById("loading-text");

  // O texto retrô de inicialização (com barras simulando carregamento)
  const bootSequence =
    "> booting lab_tt.exe\n> loading assets...\n> [████████████] 100%\n> access granted.";

  // Usamos a sua própria função typeWriter, um pouco mais rápida (speed 25)
  typeWriter(bootSequence, loadingText, 25, () => {
    // Quando terminar de digitar o boot, espera 800ms
    setTimeout(() => {
      // Faz o fade-out
      loadingScreen.style.opacity = "0";

      // Espera a animação de fade (700ms definidos no Tailwind) e então remove da tela
      setTimeout(() => {
        loadingScreen.style.display = "none";

        // AGORA SIM, iniciamos a aplicação principal!
        // Como o app() é chamado só agora, as animações de digitação
        // das abas só vão começar depois que o usuário já estiver vendo a tela.
        app();
      }, 700);
    }, 800);
  });
};

// ALTERADO: Antes chamava app(), agora chama initLoading()
document.addEventListener("DOMContentLoaded", initLoading);
