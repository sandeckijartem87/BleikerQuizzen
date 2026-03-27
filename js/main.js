const quizRoot = document.querySelector('.quiz-page');

if (quizRoot) {
  const container = document.getElementById('emoji-container');
  const emojis = ['👅', '🧶', '🐱', '🦀', '🌖'];
  const leaderboardKey = 'bleikerquizzenLeaderboard';
  const totalQuestions = 10;
  const checkedQuestions = new Set();
  let score = 0;
  let scoreSaved = false;
  let celebrationStarted = false;

  const resultCard = document.getElementById('resultat-kort');
  const resultText = document.getElementById('resultat-tekst');
  const scoreLine = document.getElementById('score-line');
  const leaderboardList = document.getElementById('leaderboard');
  const leaderboardEmpty = document.getElementById('leaderboard-empty');
  const saveScoreButton = document.getElementById('lagre-score-btn');
  const nameInput = document.getElementById('navn');
  const answerButtons = document.querySelectorAll('.vis-svar-btn');

  function createEmoji() {
    const span = document.createElement('span');
    span.className = 'emoji';
    span.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    span.style.left = `${Math.random() * 100}vw`;
    span.style.top = '-10vh';
    span.style.fontSize = `${Math.random() * 24 + 16}px`;
    span.style.animationDuration = `${Math.random() * 2 + 4}s`;
    span.style.animationDelay = `${Math.random() * 2}s`;
    container.appendChild(span);

    const lifetime =
      (parseFloat(span.style.animationDuration) + parseFloat(span.style.animationDelay) + 0.2) * 1000;

    setTimeout(() => {
      span.remove();
    }, lifetime);
  }

  function startCelebration() {
    if (celebrationStarted) {
      return;
    }

    celebrationStarted = true;

    for (let i = 0; i < 18; i += 1) {
      createEmoji();
    }

    setInterval(createEmoji, 300);
  }

  function getLeaderboard() {
    try {
      const saved = localStorage.getItem(leaderboardKey);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      return [];
    }
  }

  function saveLeaderboard(entries) {
    localStorage.setItem(leaderboardKey, JSON.stringify(entries));
  }

  function renderLeaderboard() {
    const entries = getLeaderboard();
    leaderboardList.innerHTML = '';

    if (!entries.length) {
      leaderboardEmpty.classList.remove('skjult');
      return;
    }

    leaderboardEmpty.classList.add('skjult');

    entries.forEach((entry, index) => {
      const item = document.createElement('li');
      item.innerHTML =
        `<span class="leaderboard-rank">#${index + 1}</span>` +
        `<span class="leaderboard-name">${entry.name}</span>` +
        `<span class="leaderboard-score">${entry.score} / ${totalQuestions}</span>`;
      leaderboardList.appendChild(item);
    });
  }

  function updateResultCard() {
    resultCard.classList.remove('skjult');

    if (checkedQuestions.size < totalQuestions) {
      const remaining = totalQuestions - checkedQuestions.size;
      resultText.textContent = `Du har ${remaining} spørsmål igjen før resultatet blir klart.`;
      scoreLine.textContent = `Poeng så langt: ${score} / ${totalQuestions}`;
      saveScoreButton.disabled = true;
      saveScoreButton.textContent = 'Svar på alle spørsmål først';
      return;
    }

    resultText.textContent = 'Quiz ferdig! Nå kan du lagre resultatet ditt i topplisten.';
    scoreLine.textContent = `Du fikk ${score} av ${totalQuestions} riktige.`;
    saveScoreButton.disabled = scoreSaved;
    saveScoreButton.textContent = scoreSaved ? 'Poeng lagret' : 'Lagre poeng';
    startCelebration();
  }

  function saveScore() {
    const playerName = nameInput.value.trim();

    if (checkedQuestions.size < totalQuestions) {
      updateResultCard();
      return;
    }

    if (!playerName) {
      resultText.textContent = 'Skriv inn navnet ditt før du lagrer poengsummen.';
      nameInput.focus();
      return;
    }

    if (scoreSaved) {
      resultText.textContent = 'Poengsummen din er allerede lagret i topplisten.';
      return;
    }

    const entries = getLeaderboard();
    entries.push({ name: playerName, score });
    entries.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      return a.name.localeCompare(b.name, 'no');
    });

    saveLeaderboard(entries.slice(0, 5));
    scoreSaved = true;
    resultText.textContent = `Flott! ${playerName} er nå lagt inn i topplisten.`;
    updateResultCard();
    renderLeaderboard();
  }

  function showAnswer(fasitId, gruppeNavn, riktigId) {
    const valgt = document.querySelector(`input[name="${gruppeNavn}"]:checked`);
    const fasit = document.getElementById(fasitId);

    if (!valgt) {
      fasit.className = 'fasit info';
      fasit.textContent = 'Velg et alternativ først!';
      return;
    }

    if (checkedQuestions.has(gruppeNavn)) {
      return;
    }

    if (valgt.id === riktigId) {
      fasit.className = 'fasit riktig';
      fasit.textContent = '✓ Riktig! 🎉';
      score += 1;
    } else {
      const riktigLabel = document.querySelector(`label[for="${riktigId}"]`);
      fasit.className = 'fasit feil';
      fasit.textContent = `✗ Feil! Riktig svar: ${riktigLabel.textContent.trim()}`;
    }

    checkedQuestions.add(gruppeNavn);
    document.querySelectorAll(`input[name="${gruppeNavn}"]`).forEach((radio) => {
      radio.disabled = true;
    });
    updateResultCard();
  }

  answerButtons.forEach((button) => {
    button.addEventListener('click', () => {
      showAnswer(button.dataset.fasit, button.dataset.question, button.dataset.correct);
    });
  });

  saveScoreButton.addEventListener('click', saveScore);
  renderLeaderboard();
  updateResultCard();
}
