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
  player = new YT.Player('player', {
    height: '360',
    width: '640',
    videoId: '8tWMCGRWr-Y',
    playerVars: {
      autoplay: 1,
      modestbranding: 1,
      playsinline: 1,
      listType: 'playlist',
      list: 'PLX_YaKXOr1s6u6O3srDxVJn720Zi2RRC5',
      origin: window.location.origin
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

const openPlaylistBtn = document.getElementById('open-playlist');

openPlaylistBtn.addEventListener('click', () => {
  // Cria o iframe do modal se não existir
  let modal = document.getElementById('playlist-modal');
  if (!modal) {
    modal = document.createElement('iframe');
    modal.id = 'playlist-modal';
    modal.src = 'modal.html';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.zIndex = '10000';
    modal.style.border = 'none';
    modal.style.background = 'rgba(0,0,0,0.5)';
    modal.style.transition = 'opacity 0.2s';
    document.body.appendChild(modal);
  } else {
    modal.style.display = 'block';
  }

  // Fecha o modal ao receber mensagem do iframe
  window.addEventListener('message', function handler(e) {
    if (e.data === 'close-modal') {
      modal.style.display = 'none';
      window.removeEventListener('message', handler);
    }
    // Troca de vídeo na playlist
    if (e.data && e.data.type === 'select-video' && e.data.videoId) {
      player.loadVideoById(e.data.videoId);
      modal.style.display = 'none';
      window.removeEventListener('message', handler);
    }
  });
});
