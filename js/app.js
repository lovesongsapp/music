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
  player = new YT.Player('player', {
    height: '360', // valor numérico padrão
    width: '640',  // valor numérico padrão
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
