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
    videoId: '3ZdbHUolTi8',
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
const shuffleBtn = document.getElementById('shuffle');
const repeatBtn = document.getElementById('repeat');
const openPlaylistBtn = document.getElementById('open-playlist');

// Estados dos modos
let shuffleAtivo = false;
let repeatAtivo = false;

// Play/Pause
playBtn.addEventListener('click', () => {
  if (!player || !playerPronto) return;
  const state = player.getPlayerState();
  if (state === YT.PlayerState.PLAYING) {
    player.pauseVideo();
  } else {
    player.playVideo();
  }
});

// Próximo vídeo
nextBtn.addEventListener('click', () => {
  if (!player || !playerPronto) return;
  if (typeof player.nextVideo === 'function') {
    player.nextVideo();
  }
});

// Vídeo anterior
prevBtn.addEventListener('click', () => {
  if (!player || !playerPronto) return;
  if (typeof player.previousVideo === 'function') {
    player.previousVideo();
  }
});

// Shuffle (aleatório)
shuffleBtn.addEventListener('click', () => {
  if (!player || !playerPronto) return;
  shuffleAtivo = !shuffleAtivo;
  if (typeof player.setShuffle === 'function') {
    player.setShuffle(shuffleAtivo);
  }
  shuffleBtn.style.color = shuffleAtivo ? 'var(--text-secondary)' : 'var(--text)';
});

// Repeat (repetir música atual)
repeatBtn.addEventListener('click', () => {
  if (!player || !playerPronto) return;
  repeatAtivo = !repeatAtivo;
  if (typeof player.setLoop === 'function') {
    player.setLoop(repeatAtivo);
  }
  repeatBtn.style.color = repeatAtivo ? 'var(--text-secondary)' : 'var(--text)';
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

// --- Patrulha global de links para YouTube ---

function isYouTubeLink(el) {
  return el.tagName === 'A' && el.href && el.href.match(/^https?:\/\/(www\.)?youtube\.com/);
}

// Bloqueio para clique normal e Ctrl+Click/botão do meio
function bloquearLinksYouTube(e) {
  let el = e.target;
  while (el && el !== document.body) {
    if (el.tagName === 'A') {
      if (isYouTubeLink(el)) {
        e.preventDefault();
        e.stopPropagation();
        alert('Abertura de links do YouTube bloqueada!');
        return false;
      }
      break;
    }
    el = el.parentElement;
  }
}

// Clique esquerdo
document.addEventListener('click', bloquearLinksYouTube, true);
// Clique do meio ou Ctrl+Click
document.addEventListener('auxclick', bloquearLinksYouTube, true);

// 2. Patch do window.open para bloquear tentativas de abrir YouTube
(function () {
  const originalOpen = window.open;
  window.open = function (url, ...args) {
    if (typeof url === 'string' && url.match(/^https?:\/\/(www\.)?youtube\.com/)) {
      alert('window.open para YouTube bloqueado!');
      return null;
    }
    return originalOpen.apply(window, arguments);
  };
})();

// 3. MutationObserver para detectar inserção de novos links YouTube
const observer = new MutationObserver(mutations => {
  mutations.forEach(mutation => {
    mutation.addedNodes.forEach(node => {
      if (
        node.nodeType === 1 &&
        node.tagName === 'A' &&
        node.href &&
        node.href.match(/^https?:\/\/(www\.)?youtube\.com/)
      ) {
        node.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          alert('Link do YouTube bloqueado (inserido dinamicamente)!');
        }, true);
        node.addEventListener('auxclick', function (e) {
          e.preventDefault();
          e.stopPropagation();
          alert('Link do YouTube bloqueado (inserido dinamicamente)!');
        }, true);
      }
    });
  });
});
observer.observe(document.body, { childList: true, subtree: true });
