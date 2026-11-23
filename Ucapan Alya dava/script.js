document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================
     1. WELCOME SCREEN & TRANSITION
     ========================================== */
  const welcomeScreen = document.getElementById('welcome-screen');
  const mainApp = document.getElementById('main-app');
  const enterBtn = document.getElementById('enter-btn');
  const audio = document.getElementById('bg-audio');

  audio.volume = 0.5;
  audio.addEventListener('error', () => {
    console.error('Gagal memuat musik latar.', audio.error);
  });

  enterBtn.addEventListener('click', () => {
    audio.play().catch(error => {
      console.error('Gagal memulai musik latar.', error);
    });

    welcomeScreen.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    welcomeScreen.style.opacity = '0';
    welcomeScreen.style.transform = 'scale(0.9)';

    setTimeout(() => {
      welcomeScreen.classList.add('hidden');
      mainApp.classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 800);
  });

  /* ==========================================
     2. FLOATING BACKGROUND PARTICLES
     ========================================== */
  const bgElementsContainer = document.getElementById('bg-elements');
  const icons = ['🌸', '💖', '✨', '☁️', '🌷', '💕'];

  function createBgParticle() {
    const el = document.createElement('div');
    el.classList.add('bg-bubble');
    el.innerText = icons[Math.floor(Math.random() * icons.length)];
    el.style.left = Math.random() * 100 + 'vw';
    el.style.animationDuration = (Math.random() * 5 + 8) + 's';
    el.style.fontSize = (Math.random() * 1.5 + 1) + 'rem';

    bgElementsContainer.appendChild(el);

    setTimeout(() => {
      el.remove();
    }, 13000);
  }

  setInterval(createBgParticle, 1500);

  /* ==========================================
     3. CARD CLICK SMOOTH SCROLL
     ========================================== */
  const cards = document.querySelectorAll('.card-item');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      const targetSelector = card.getAttribute('data-target');
      const targetElement = document.querySelector(targetSelector);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  document.querySelectorAll('.flip-card').forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('flipped');
    });
  });

  /* ==========================================
     5. A LITTLE MESSAGE (TYPING EFFECT)
     ========================================== */
  const envelope = document.getElementById('envelope');
     const envelopeWrapper = envelope.parentElement;
     const letter = document.getElementById('letter');
  const typedTextElement = document.getElementById('typed-text');
  
  const letterMessage = `Halo favoritku! ♡\n\nWebsite kecil ini kubuat khusus untukmu. Tempat di mana kamu bisa selalu datang saat butuh alasan untuk tersenyum.\n\nTerima kasih sudah membawa begitu banyak kehangatan dan kebahagiaan. Kamu sungguh luar biasa!`;

  let isTyped = false;

  envelope.addEventListener('click', () => {
    const isOpen = envelope.classList.toggle('open');
    envelopeWrapper.classList.toggle('open', isOpen);

    if (isOpen) {
      requestAnimationFrame(() => {
        letter.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    }

    if (!isTyped && isOpen) {
      isTyped = true;
      let index = 0;
      typedTextElement.innerText = '';

      function typeNextChar() {
        if (index < letterMessage.length) {
          typedTextElement.innerText += letterMessage.charAt(index);
          index++;
          setTimeout(typeNextChar, 40);
        }
      }
      setTimeout(typeNextChar, 600);
    }
  });

  /* ==========================================
     6. LOCAL MEMORY PHOTOS
     ========================================== */
  const photoAssetsStatus = document.getElementById('photo-assets-status');
  const supportsDirectoryAccess = window.isSecureContext && typeof window.showDirectoryPicker === 'function';
  let projectDirectoryHandle = null;
  let savedPhotoAssets = {};
  let photoManifestReady = false;

  const photoManifestReadyPromise = fetch('./assets/memory-photos.json')
    .then(async response => {
      if (response.status === 404) {
        photoManifestReady = true;
        return;
      }
      if (!response.ok) {
        throw new Error(`Gagal membaca daftar foto (HTTP ${response.status}).`);
      }

      const manifest = await response.json();
      if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
        throw new Error('Daftar foto di assets/memory-photos.json tidak valid.');
      }

      savedPhotoAssets = manifest;
      photoManifestReady = true;
    })
    .catch(error => {
      console.error('Gagal memuat daftar foto dari assets.', error);
    });

  document.querySelectorAll('.img-uploader').forEach(input => {
    const index = input.dataset.index;
    const photoPreview = document.getElementById(`img-preview-${index}`);
    const photoWrapper = input.closest('.polaroid-img-wrapper');
    let selectedFile = null;
    let previewUrl = null;
    const saveButton = document.createElement('button');
    saveButton.type = 'button';
    saveButton.className = 'btn-secondary save-memory-photo hidden';
    saveButton.innerText = 'Simpan ke assets';
    photoWrapper.after(saveButton);

    input.addEventListener('change', () => {
      const file = input.files[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        alert('Pilih file gambar untuk mengganti foto.');
        input.value = '';
        return;
      }

      if (previewUrl) URL.revokeObjectURL(previewUrl);
      selectedFile = file;
      previewUrl = URL.createObjectURL(file);
      photoPreview.src = previewUrl;
      photoPreview.classList.remove('photo-missing');
      saveButton.classList.remove('hidden');
      photoAssetsStatus.innerText = `Foto ${Number(index) + 1} masih pratinjau. bro tombolSimpan ke assets agar tersimpan permanen.`;
    });

    saveButton.addEventListener('click', async () => {
      if (!selectedFile) return;
      if (!supportsDirectoryAccess) {
        photoAssetsStatus.innerText = 'Simpan ke assets perlu Chrome atau Edge dan website yang dibuka lewat localhost.';
        return;
      }

      await photoManifestReadyPromise;
      if (!photoManifestReady) {
        photoAssetsStatus.innerText = 'Daftar foto belum bisa dibaca. Periksa server localhost dan folder assets.';
        return;
      }

      const extensionsByType = {
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp',
        'image/gif': 'gif',
        'image/bmp': 'bmp',
        'image/avif': 'avif',
        'image/svg+xml': 'svg'
      };
      const filenameExtension = selectedFile.name.match(/\.([a-z0-9]+)$/i);
      const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'avif', 'svg'];
      const extension = extensionsByType[selectedFile.type] ||
        (filenameExtension && allowedExtensions.includes(filenameExtension[1].toLowerCase())
          ? filenameExtension[1].toLowerCase()
          : null);

      if (!extension) {
        photoAssetsStatus.innerText = 'Format foto ini belum didukung. Coba gunakan JPG, PNG, atau WebP.';
        return;
      }

      saveButton.disabled = true;
      try {
        if (!projectDirectoryHandle) {
          const folderHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
          await folderHandle.getFileHandle('index.html');
          projectDirectoryHandle = folderHandle;
        }

        const assetsDirectory = await projectDirectoryHandle.getDirectoryHandle('assets', { create: true });
        const filename = `memory-${index}.${extension}`;
        const imageHandle = await assetsDirectory.getFileHandle(filename, { create: true });
        const imageWriter = await imageHandle.createWritable();
        await imageWriter.write(selectedFile);
        await imageWriter.close();

        const updatedManifest = { ...savedPhotoAssets, [index]: filename };
        const manifestHandle = await assetsDirectory.getFileHandle('memory-photos.json', { create: true });
        const manifestWriter = await manifestHandle.createWritable();
        await manifestWriter.write(JSON.stringify(updatedManifest, null, 2));
        await manifestWriter.close();

        savedPhotoAssets = updatedManifest;
        photoPreview.src = `./assets/${filename}`;
        photoPreview.classList.remove('photo-missing');
        saveButton.classList.add('hidden');
        selectedFile = null;
        input.value = '';
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
          previewUrl = null;
        }
        photoAssetsStatus.innerText = `Foto ${Number(index) + 1} tersimpan di assets/${filename}.`;
      } catch (error) {
        if (error.name === 'AbortError') {
          photoAssetsStatus.innerText = 'Penyimpanan dibatalkan.';
          return;
        }
        console.error('Gagal menyimpan foto ke folder assets.', error);
        photoAssetsStatus.innerText = `Gagal menyimpan foto: ${error.message}`;
      } finally {
        saveButton.disabled = false;
      }
    });
  });

  photoManifestReadyPromise.then(() => {
    if (!photoManifestReady) return;

    document.querySelectorAll('#polaroid-gallery img[id^="img-preview-"]').forEach(photo => {
      const index = photo.id.replace('img-preview-', '');
      const filename = savedPhotoAssets[index];
      if (typeof filename !== 'string' || !new RegExp(`^memory-${index}\\.(jpg|jpeg|png|webp|gif|bmp|avif|svg)$`, 'i').test(filename)) return;

      photo.src = `./assets/${filename}`;
      photo.addEventListener('error', () => {
        photo.classList.add('photo-missing');
        photoAssetsStatus.innerText = `Tidak bisa memuat assets/${filename}. Pastikan file ikut tersalin bersama project.`;
      }, { once: true });
    });
  });

  /* ==========================================
     7. GAME 1: CATCH THE HEARTS
     ========================================== */
  const gameArea = document.getElementById('heart-game-area');
  const startGameBtn = document.getElementById('start-game-btn');
  const scoreDisplay = document.getElementById('game-score');

  let score = 0;
  let gameInterval;

  startGameBtn.addEventListener('click', startGame);

  function startGame() {
    score = 0;
    scoreDisplay.innerText = score;
    startGameBtn.classList.add('hidden');
    
    gameInterval = setInterval(spawnHeart, 800);
  }

  function spawnHeart() {
    if (score >= 10) {
      clearInterval(gameInterval);
      gameArea.innerHTML = `<div style="text-align:center;">🎉 <b>Hebat! Kamu Berhasil!</b><br>Pesan Rahasia: <i>"Kamu selalu memenangkan hatiku setiap hari!"</i></div>`;
      return;
    }

    const heart = document.createElement('div');
    heart.classList.add('clickable-heart');
    heart.innerText = '💖';
    
    const x = Math.random() * (gameArea.clientWidth - 40);
    const y = Math.random() * (gameArea.clientHeight - 40);
    
    heart.style.left = x + 'px';
    heart.style.top = y + 'px';

    heart.addEventListener('click', () => {
      score++;
      scoreDisplay.innerText = score;
      heart.remove();
      if (score >= 10) {
        clearInterval(gameInterval);
        gameArea.innerHTML = `<div style="text-align:center; padding: 20px;">🎉 <b>Hebat! Kamu menang!</b><br><br>Pesan Rahasia: <i>"Kamu selalu memenangkan hatiku setiap hari!"</i> ♡</div>`;
      }
    });

    gameArea.appendChild(heart);

    setTimeout(() => {
      if (heart.parentNode) {
        heart.remove();
      }
    }, 1500);
  }

  /* ==========================================
     8. GAME 2: OPEN THE GIFT
     ========================================== */
  const giftBox = document.getElementById('gift-box');
  const giftMessage = document.getElementById('gift-message');

  giftBox.addEventListener('click', () => {
    giftBox.style.transform = 'scale(1.3) rotate(360deg)';
    giftBox.style.transition = 'transform 0.6s ease';
    
    setTimeout(() => {
      giftBox.classList.add('hidden');
      giftMessage.classList.remove('hidden');
    }, 600);
  });

  /* ==========================================
     9. JUST FOR YOU (RANDOM MESSAGES)
     ========================================== */
  const messages = [
    "You make ordinary days feel special. ✨",
    "Don't forget how amazing and capable you are! 🌟",
    "You deserve all the happiness in the world. 💖",
    "Here's a little reminder that you're immensely appreciated. 🌸",
    "Senyummu adalah pemandangan terindah! 😊",
    "Terima kasih sudah bertahan dan berjuang sejauh ini. Aku bangga padamu! 💪💕",
    "Dunia jadi tempat yang jauh lebih hangat karena ada kamu. 🌷",
    "Apapun yang sedang kamu hadapi, kamu pasti bisa melewatinya! ✨",
    "Jangan lupa istirahat ya, kamu sudah melakukan yang terbaik! ☕",
    "Kamu itu unik, bernilai, dan tak tergantikan. 💎",
    "Sending you a warm digital hug right now! 🫂❤️",
    "Hari ini adalah hari yang baik untuk bahagia! 🌼",
    "Kamu selalu punya alasan untuk bangga pada dirimu sendiri. ⭐",
    "Ingat, kamu tidak pernah sendirian. 💖",
    "Semoga hal-hal manis menghampiri harimu hari ini! 🍬"
  ];

  const happinessBtn = document.getElementById('happiness-btn');
  const messageBox = document.getElementById('message-display-box');
  const randomQuoteText = document.getElementById('random-quote-text');

  happinessBtn.addEventListener('click', () => {
    const randomIndex = Math.floor(Math.random() * messages.length);
    randomQuoteText.innerText = messages[randomIndex];
    messageBox.classList.remove('hidden');
  });

  /* ==========================================
     10. FINAL SURPRISE MODAL & CONFETTI
     ========================================== */
  const finalBtn = document.getElementById('final-surprise-btn');
  const finalModal = document.getElementById('final-modal');
  const closeModalBtn = document.getElementById('close-modal-btn');

  finalBtn.addEventListener('click', () => {
    finalModal.classList.remove('hidden');
    triggerSparkles();
  });

  closeModalBtn.addEventListener('click', () => {
    triggerCloseBurst(closeModalBtn);
    finalModal.classList.add('hidden');
  });

  function triggerCloseBurst(button) {
    const buttonBounds = button.getBoundingClientRect();
    const particles = ['💖', '💕', '💗', '💞', '😊', '☺️', '🩷'];
    const particleCount = 22;

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.4;
      const distance = 65 + Math.random() * 95;
      const particle = document.createElement('span');

      particle.className = 'close-burst-particle';
      particle.setAttribute('aria-hidden', 'true');
      particle.innerText = particles[Math.floor(Math.random() * particles.length)];
      particle.style.left = `${buttonBounds.left + buttonBounds.width / 2}px`;
      particle.style.top = `${buttonBounds.top + buttonBounds.height / 2}px`;
      particle.style.setProperty('--burst-x', `${Math.cos(angle) * distance}px`);
      particle.style.setProperty('--burst-y', `${Math.sin(angle) * distance}px`);
      particle.style.setProperty('--burst-rotation', `${Math.random() * 180 - 90}deg`);
      particle.style.animationDelay = `${Math.random() * 100}ms`;
      particle.addEventListener('animationend', () => particle.remove(), { once: true });

      document.body.appendChild(particle);
    }
  }

  /* Sparkle Particle Generator for Ending */
  function triggerSparkles() {
    for (let i = 0; i < 30; i++) {
      const sparkle = document.createElement('div');
      sparkle.innerText = ['🌸', '✨', '💖', '🎉'][Math.floor(Math.random() * 4)];
      sparkle.style.position = 'fixed';
      sparkle.style.left = Math.random() * 100 + 'vw';
      sparkle.style.top = Math.random() * 100 + 'vh';
      sparkle.style.fontSize = (Math.random() * 1.5 + 1) + 'rem';
      sparkle.style.pointerEvents = 'none';
      sparkle.style.zIndex = '1001';
      sparkle.style.animation = 'popUp 1s ease forwards';

      document.body.appendChild(sparkle);

      setTimeout(() => sparkle.remove(), 1000);
    }
  }

});