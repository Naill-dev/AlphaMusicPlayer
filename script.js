(() => {
  const tracks = [
    {
      title: "SoundHelix Song 1",
      artist: "T. Schürger",
      src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      color: "#8b5cf6",
    },
    {
      title: "SoundHelix Song 2",
      artist: "T. Schürger",
      src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      color: "#22d3ee",
    },
    {
      title: "SoundHelix Song 3",
      artist: "T. Schürger",
      src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
      color: "#f472b6",
    },
    {
      title: "SoundHelix Song 8",
      artist: "T. Schürger",
      src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
      color: "#34d399",
    },
    {
      title: "SoundHelix Song 16",
      artist: "T. Schürger",
      src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3",
      color: "#fbbf24",
    },
  ];

  const audio = document.getElementById("audio");
  const titleEl = document.getElementById("title");
  const artistEl = document.getElementById("artist");
  const playBtn = document.getElementById("play");
  const prevBtn = document.getElementById("prev");
  const nextBtn = document.getElementById("next");
  const progress = document.getElementById("progress");
  const volume = document.getElementById("volume");
  const volIcon = document.getElementById("volIcon");
  const currentTimeEl = document.getElementById("currentTime");
  const durationEl = document.getElementById("duration");
  const playlistEl = document.getElementById("playlist");
  const trackCountEl = document.getElementById("trackCount");
  const autoplayEl = document.getElementById("autoplay");
  const art = document.getElementById("art");
  const artCore = document.getElementById("artCore");

  let index = 0;
  let isSeeking = false;

  function formatTime(sec) {
    if (!Number.isFinite(sec) || sec < 0) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  function setPlayingUI(playing) {
    playBtn.textContent = playing ? "⏸" : "▶";
    playBtn.setAttribute("aria-label", playing ? "Pause" : "Play");
    art.classList.toggle("playing", playing);
  }

  function loadTrack(i, autoPlay = false) {
    index = (i + tracks.length) % tracks.length;
    const track = tracks[index];

    audio.src = track.src;
    titleEl.textContent = track.title;
    artistEl.textContent = track.artist;
    artCore.style.background = `linear-gradient(145deg, ${track.color}, #312e81)`;
    progress.value = 0;
    currentTimeEl.textContent = "0:00";
    durationEl.textContent = "0:00";

    document.querySelectorAll(".track").forEach((el, idx) => {
      el.classList.toggle("active", idx === index);
    });

    if (autoPlay) {
      audio.play().then(() => setPlayingUI(true)).catch(() => setPlayingUI(false));
    } else {
      setPlayingUI(false);
    }
  }

  function togglePlay() {
    if (!audio.src) loadTrack(index);
    if (audio.paused) {
      audio.play().then(() => setPlayingUI(true)).catch(() => setPlayingUI(false));
    } else {
      audio.pause();
      setPlayingUI(false);
    }
  }

  function nextTrack(fromEnded = false) {
    const shouldPlay = fromEnded ? autoplayEl.checked : !audio.paused || fromEnded;
    loadTrack(index + 1, shouldPlay || !audio.paused);
  }

  function prevTrack() {
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    loadTrack(index - 1, !audio.paused);
  }

  function renderPlaylist() {
    trackCountEl.textContent = `${tracks.length} tracks`;
    playlistEl.innerHTML = tracks
      .map(
        (t, i) => `
      <li class="track${i === index ? " active" : ""}" data-index="${i}">
        <span class="track-num">${String(i + 1).padStart(2, "0")}</span>
        <div class="track-info">
          <strong>${t.title}</strong>
          <span>${t.artist}</span>
        </div>
        <span class="track-dur">—</span>
      </li>`
      )
      .join("");

    playlistEl.querySelectorAll(".track").forEach((el) => {
      el.addEventListener("click", () => {
        loadTrack(Number(el.dataset.index), true);
      });
    });
  }

  playBtn.addEventListener("click", togglePlay);
  nextBtn.addEventListener("click", () => nextTrack(false));
  prevBtn.addEventListener("click", prevTrack);

  audio.addEventListener("loadedmetadata", () => {
    durationEl.textContent = formatTime(audio.duration);
  });

  audio.addEventListener("timeupdate", () => {
    if (isSeeking || !audio.duration) return;
    progress.value = Math.floor((audio.currentTime / audio.duration) * 1000);
    currentTimeEl.textContent = formatTime(audio.currentTime);
  });

  audio.addEventListener("ended", () => {
    if (autoplayEl.checked) {
      nextTrack(true);
    } else {
      setPlayingUI(false);
      progress.value = 0;
      currentTimeEl.textContent = "0:00";
    }
  });

  audio.addEventListener("play", () => setPlayingUI(true));
  audio.addEventListener("pause", () => setPlayingUI(false));

  progress.addEventListener("input", () => {
    isSeeking = true;
    if (!audio.duration) return;
    currentTimeEl.textContent = formatTime((progress.value / 1000) * audio.duration);
  });

  progress.addEventListener("change", () => {
    if (audio.duration) {
      audio.currentTime = (progress.value / 1000) * audio.duration;
    }
    isSeeking = false;
  });

  volume.addEventListener("input", () => {
    audio.volume = Number(volume.value);
    if (audio.volume === 0) volIcon.textContent = "🔇";
    else if (audio.volume < 0.4) volIcon.textContent = "🔈";
    else volIcon.textContent = "🔊";
  });

  volIcon.addEventListener("click", () => {
    if (audio.volume > 0) {
      volIcon.dataset.prev = String(audio.volume);
      audio.volume = 0;
      volume.value = 0;
      volIcon.textContent = "🔇";
    } else {
      const prev = Number(volIcon.dataset.prev || 0.8);
      audio.volume = prev;
      volume.value = prev;
      volIcon.textContent = prev < 0.4 ? "🔈" : "🔊";
    }
  });

  window.addEventListener("keydown", (e) => {
    if (e.target.matches("input, textarea")) return;
    switch (e.code) {
      case "Space":
        e.preventDefault();
        togglePlay();
        break;
      case "ArrowRight":
        e.preventDefault();
        nextTrack(false);
        break;
      case "ArrowLeft":
        e.preventDefault();
        prevTrack();
        break;
      case "ArrowUp":
        e.preventDefault();
        audio.volume = Math.min(1, audio.volume + 0.05);
        volume.value = audio.volume;
        volume.dispatchEvent(new Event("input"));
        break;
      case "ArrowDown":
        e.preventDefault();
        audio.volume = Math.max(0, audio.volume - 0.05);
        volume.value = audio.volume;
        volume.dispatchEvent(new Event("input"));
        break;
      default:
        break;
    }
  });

  audio.volume = Number(volume.value);
  renderPlaylist();
  loadTrack(0, false);
})();
