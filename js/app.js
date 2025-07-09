// Simulação de player de áudio com YouTube (modo somente áudio)

// Função para buscar dados do vídeo atual usando apenas a API do player
function atualizarInfoVideo(videoId) {
  // Obtém informações básicas do vídeo pelo próprio player
  if (player && typeof player.getVideoData === 'function') {
    const data = player.getVideoData();
    document.querySelector('.music-title').textContent = data.title || 'Desconhecido';
    document.querySelector('.artist-name').textContent = data.author || '';
    // Mantém a capa como está, pois não há thumbnail via player API
  }
}

// Inicialização do player
let player;
let playerPronto = false; // flag para saber se o player está pronto

function onPlayerReady(event) {
  playerPronto = true;
  atualizarInfoVideo(player.getVideoData().video_id);
  monitorarBotaoPularAnuncio(); // inicia monitoramento
}

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.ENDED) {
    player.nextVideo();
  }
  if (
    event.data === YT.PlayerState.PLAYING ||
    event.data === YT.PlayerState.BUFFERING
  ) {
    atualizarInfoVideo(player.getVideoData().video_id);
  }
  // Atualiza o botão play/pause conforme o estado real do player
  if (event.data === YT.PlayerState.PLAYING) {
    playBtn.textContent = '⏸️';
  } else if (
    event.data === YT.PlayerState.PAUSED ||
    event.data === YT.PlayerState.ENDED
  ) {
    playBtn.textContent = '▶️';
  }
}

// Função global para API do YouTube
window.onYouTubeIframeAPIReady = function () {
  const playerDiv = document.getElementById('player');
  if (playerDiv) {
    playerDiv.style.width = '100%';
    playerDiv.style.height = '100%';
    playerDiv.style.position = 'absolute';
    playerDiv.style.top = '0';
    playerDiv.style.left = '0';
    playerDiv.style.zIndex = '2';
    playerDiv.style.background = 'black';
  }

  player = new YT.Player('player', {
    height: '100%',
    width: '100%',
    videoId: '8tWMCGRWr-Y',
    playerVars: {
      autoplay: 1,
      modestbranding: 1,
      playsinline: 1,
      listType: 'playlist',
      list: 'PLX_YaKXOr1s6u6O3srDxVJn720Zi2RRC5'
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange
    }
  });
};

// Controles
const playBtn = document.getElementById('play');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');

playBtn.addEventListener('click', () => {
  if (!player || !playerPronto) return;
  const state = player.getPlayerState();
  if (state === YT.PlayerState.PLAYING) {
    player.pauseVideo();
    // O texto do botão será atualizado pelo onPlayerStateChange
  } else {
    player.playVideo();
    // O texto do botão será atualizado pelo onPlayerStateChange
  }
});

prevBtn.addEventListener('click', () => {
  if (player && playerPronto) player.previousVideo();
});

nextBtn.addEventListener('click', () => {
  if (player && playerPronto) player.nextVideo();
});

// TEMA
const toggleBtn = document.getElementById('theme-toggle');
const themeMeta = document.querySelector('meta[name="theme-color"]');

function setTheme(dark) {
  if (dark) {
    document.documentElement.classList.add('dark-mode');
    toggleBtn.textContent = '☀️';
    if (themeMeta) themeMeta.setAttribute('content', '#111');
  } else {
    document.documentElement.classList.remove('dark-mode');
    toggleBtn.textContent = '🌙';
    if (themeMeta) themeMeta.setAttribute('content', '#fff');
  }
}

// Detecta tema inicial do sistema
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
setTheme(prefersDark);

toggleBtn.addEventListener('click', () => {
  const isDark = document.documentElement.classList.toggle('dark-mode');
  setTheme(isDark);
});

/**
 * Exibe um botão customizado para "Pular anúncio" por alguns segundos após o início do vídeo.
 * Observação: Não é possível pular anúncios do YouTube via API pública, este botão é apenas ilustrativo.
 */
function monitorarBotaoPularAnuncio() {
  let skipBtn = document.getElementById('custom-skip-ad');
  if (!skipBtn) {
    skipBtn = document.createElement('button');
    skipBtn.id = 'custom-skip-ad';
    skipBtn.textContent = '⏭️ Pular anúncio';
    skipBtn.style.position = 'fixed';
    skipBtn.style.bottom = '20px';
    skipBtn.style.left = '20px';
    skipBtn.style.zIndex = '9999';
    skipBtn.style.padding = '1em 1.5em';
    skipBtn.style.fontSize = '1.6rem';
    skipBtn.style.background = 'var(--bg-secondary)';
    skipBtn.style.color = 'var(--text)';
    skipBtn.style.border = 'none';
    skipBtn.style.borderRadius = '0.5rem';
    skipBtn.style.cursor = 'pointer';
    skipBtn.style.display = 'none';
    document.body.appendChild(skipBtn);

    skipBtn.addEventListener('click', () => {
      skipBtn.style.display = 'none';
    });
  }

  // Função para exibir o botão por 7 segundos após o início do vídeo
  function mostrarBotaoTemporariamente() {
    skipBtn.style.display = 'block';
    setTimeout(() => {
      skipBtn.style.display = 'none';
    }, 7000);
  }

  // Exibe o botão sempre que um novo vídeo começa a tocar
  if (window._skipAdListenerAdded) return;
  window._skipAdListenerAdded = true;

  window.onPlayerStateChange = function(event) {
    if (event.data === YT.PlayerState.PLAYING) {
      mostrarBotaoTemporariamente();
    }
    if (typeof window._originalOnPlayerStateChange === 'function') {
      window._originalOnPlayerStateChange(event);
    }
  };

  // Salva o original e substitui
  if (!window._originalOnPlayerStateChange) {
    window._originalOnPlayerStateChange = onPlayerStateChange;
    onPlayerStateChange = window.onPlayerStateChange;
  }
}
    }
    if (typeof window._originalOnPlayerStateChange === 'function') {
      window._originalOnPlayerStateChange(event);
    }
  };

  // Salva o original e substitui
  if (!window._originalOnPlayerStateChange) {
    window._originalOnPlayerStateChange = onPlayerStateChange;
    onPlayerStateChange = window.onPlayerStateChange;
  }
}
