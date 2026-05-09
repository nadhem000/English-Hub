/* ================================================================
   exercise-conjugation.js
   – Drop-in replacement for exercise.js on conjugation pages.
   – Uses the exact CSS classes from style-conjugation.css.
   – Handles multiple-choice, fill-in-the-blank, sentence-ordering.
   – Provides touch‑friendly drag‑and‑drop (no inline script needed).
   ================================================================ */

/* -----------------------------------------------------------------
   Helper: add the required option container class if missing.
   ----------------------------------------------------------------- */
function _ensureConjugationOptionClasses() {
  document.querySelectorAll('.EH-exercise-option').forEach(opt => {
    opt.classList.add('EH-exercise-type1-possibilities3-option');
  });
}

/* -----------------------------------------------------------------
   MULTIPLE‑CHOICE
   ----------------------------------------------------------------- */
function ExerciseType1Possibilities3CheckAnswers(correctAnswers, totalQuestions, prefix = 'EH-exercise-type1-possibilities3') {
  _ensureConjugationOptionClasses();
  let score = 0;
  // reset
  for (let i = 1; i <= totalQuestions; i++) {
    const statusEl = document.getElementById(`${prefix}-q${i}-status`);
    if (statusEl) {
      statusEl.textContent = '';
      statusEl.className = `${prefix}-answer-status`;
    }
    const radios = document.querySelectorAll(`input[name="${prefix}-q${i}"]`);
    radios.forEach(r => {
      const optDiv = r.closest('.EH-exercise-type1-possibilities3-option');
      if (optDiv) optDiv.classList.remove('correct', 'incorrect');
    });
  }

  for (const [question, correctValue] of Object.entries(correctAnswers)) {
    const statusEl = document.getElementById(`${question}-status`);
    const selected = document.querySelector(`input[name="${question}"]:checked`);

    const correctRadio = document.querySelector(`input[name="${question}"][value="${correctValue}"]`);
    const correctContainer = correctRadio ? correctRadio.closest('.EH-exercise-type1-possibilities3-option') : null;

    if (selected) {
      const selectedContainer = selected.closest('.EH-exercise-type1-possibilities3-option');
      if (selected.value === correctValue) {
        score++;
        if (statusEl) {
          statusEl.textContent = 'Correct!';
          statusEl.className = `${prefix}-answer-status ${prefix}-correct-answer`;
        }
        if (selectedContainer) selectedContainer.classList.add('correct');
      } else {
        if (statusEl) {
          statusEl.textContent = 'Incorrect';
          statusEl.className = `${prefix}-answer-status ${prefix}-incorrect-answer`;
        }
        if (selectedContainer) selectedContainer.classList.add('incorrect');
        if (correctContainer) correctContainer.classList.add('correct');
      }
    } else {
      if (statusEl) {
        statusEl.textContent = 'Not answered';
        statusEl.className = `${prefix}-answer-status`;
      }
      if (correctContainer) correctContainer.classList.add('correct');
    }
  }
  return score;
}

function ExerciseType1Possibilities3Init(correctAnswers, totalQuestions, prefix = 'EH-exercise-type1-possibilities3') {
  // nothing special to init; check button is bound by the page's own code
}

/* -----------------------------------------------------------------
   FILL‑IN‑THE‑BLANK
   ----------------------------------------------------------------- */
/* -----------------------------------------------------------------
   FILL‑IN‑THE‑BLANK (fixed – preserves base class)
   ----------------------------------------------------------------- */
function ExerciseType2FillBlankCheckAnswers(correctAnswers, totalQuestions, prefix = 'EH-exercise-type2-fillblank') {
  let score = 0;
  // Reset: keep base class, remove all state classes
  for (let i = 1; i <= totalQuestions; i++) {
    const inp = document.getElementById(`${prefix}-q${i}-input`);
    const st = document.getElementById(`${prefix}-q${i}-status`);
    if (inp) {
      inp.classList.remove('fill-input-empty', 'fill-input-correct', 'fill-input-incorrect');
      inp.classList.add('EH-exercise-type2-fillblank-input'); // ensure base class is present
    }
    if (st) {
      st.textContent = '';
      st.className = `${prefix}-answer-status`;  // this one is fine, it's on a div
    }
  }

  for (const [question, correctEntry] of Object.entries(correctAnswers)) {
    const accepted = Array.isArray(correctEntry)
      ? correctEntry.map(a => a.toLowerCase().trim())
      : [correctEntry.toLowerCase().trim()];
    const inp = document.getElementById(`${question}-input`);
    const st = document.getElementById(`${question}-status`);
    if (!inp) continue;
    const userAnswer = inp.value.toLowerCase().trim();

    // Determine which state class to apply
    if (userAnswer === '') {
      inp.classList.add('fill-input-empty');
      if (st) {
        st.textContent = 'Not answered';
        st.className = `${prefix}-answer-status`;
      }
    } else if (accepted.includes(userAnswer)) {
      score++;
      inp.classList.add('fill-input-correct');
      if (st) {
        st.textContent = 'Correct!';
        st.className = `${prefix}-answer-status fill-correct-answer`;
      }
    } else {
      const display = Array.isArray(correctEntry) ? correctEntry[0] : correctEntry;
      inp.classList.add('fill-input-incorrect');
      if (st) {
        st.textContent = `Incorrect. Correct: ${display}`;
        st.className = `${prefix}-answer-status fill-incorrect-answer`;
      }
    }
  }
  return score;
}

function ExerciseType2FillBlankInit(correctAnswers, totalQuestions, prefix) {
  // No init needed; page sets up the button
}

/* -----------------------------------------------------------------
   SENTENCE‑ORDERING
   ----------------------------------------------------------------- */
function ExerciseType3SentenceOrderCheckAnswers(correctAnswers, totalQuestions, prefix = 'EH-exercise-type3-sentenceorder') {
  let score = 0;
  for (let i = 1; i <= totalQuestions; i++) {
    const container = document.getElementById(`${prefix}-q${i}-words`);
    const statusEl = document.getElementById(`${prefix}-q${i}-status`);
    if (container) {
      container.classList.remove(`${prefix}-correct`, `${prefix}-incorrect`);
      container.querySelectorAll('.order-word').forEach(w => {
        w.classList.remove(`${prefix}-correct`, `${prefix}-incorrect`);
      });
    }
    if (statusEl) {
      statusEl.textContent = '';
      statusEl.className = `${prefix}-answer-status`;
    }
  }

  for (const [question, correctSentence] of Object.entries(correctAnswers)) {
    const container = document.getElementById(`${question}-words`);
    const statusEl = document.getElementById(`${question}-status`);
    if (!container) continue;
    const words = container.querySelectorAll('.order-word');
    let userSentence = '';
    if (words.length) {
      userSentence = Array.from(words).map(w => w.textContent).join(' ').replace(/\s+/g, ' ').trim();
    }
    const normalizedUser = userSentence.toLowerCase();
    const normalizedCorrect = correctSentence.replace(/\s+/g, ' ').trim().toLowerCase();

    if (userSentence === '') {
      if (statusEl) {
        statusEl.textContent = 'Not answered';
        statusEl.className = `${prefix}-answer-status`;
      }
    } else if (normalizedUser === normalizedCorrect) {
      score++;
      container.classList.add(`${prefix}-correct`);
      if (statusEl) {
        statusEl.textContent = 'Correct!';
        statusEl.className = `${prefix}-answer-status ${prefix}-correct-answer`;
      }
    } else {
      container.classList.add(`${prefix}-incorrect`);
      if (statusEl) {
        statusEl.textContent = `Incorrect. Correct sentence: ${correctSentence}`;
        statusEl.className = `${prefix}-answer-status ${prefix}-incorrect-answer`;
      }
    }
  }
  return score;
}

/* -----------------------------------------------------------------
   DRAG‑AND‑DROP INIT (called by pages) + touch support
   ----------------------------------------------------------------- */
let _draggedItem = null, _touchItem = null, _touchClone = null;

function ExerciseType3SentenceOrderInit(correctAnswers, totalQuestions, prefix = 'EH-exercise-type3-sentenceorder') {
  for (let i = 1; i <= totalQuestions; i++) {
    const container = document.getElementById(`${prefix}-q${i}-words`);
    if (!container) continue;

    const words = container.querySelectorAll('.order-word');
    words.forEach(word => {
      word.setAttribute('draggable', 'true');
      word.removeEventListener('dragstart', _dragStart);
      word.removeEventListener('dragend', _dragEnd);
      word.addEventListener('dragstart', _dragStart);
      word.addEventListener('dragend', _dragEnd);

      word.removeEventListener('touchstart', _touchStart);
      word.removeEventListener('touchmove', _touchMove);
      word.removeEventListener('touchend', _touchEnd);
      word.addEventListener('touchstart', _touchStart, { passive: false });
      word.addEventListener('touchmove', _touchMove, { passive: false });
      word.addEventListener('touchend', _touchEnd);
    });

    container.removeEventListener('dragover', _dragOver);
    container.removeEventListener('drop', _drop);
    container.addEventListener('dragover', _dragOver);
    container.addEventListener('drop', _drop);
  }

  // Re‑bind the "Check All" button if the page hasn't already done so.
  const checkBtn = document.getElementById('check-all');
  if (checkBtn && typeof checkAllExercises === 'function') {
    checkBtn.removeEventListener('click', checkAllExercises);
    checkBtn.addEventListener('click', checkAllExercises);
  }
}

/* --- mouse handlers --- */
function _dragStart(e) {
  _draggedItem = this;
  this.classList.add('EH-exercise-type3-sentenceorder-dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', '');
}
function _dragEnd() {
  this.classList.remove('EH-exercise-type3-sentenceorder-dragging');
  _draggedItem = null;
}
function _dragOver(e) {
	e.preventDefault(); e.dataTransfer.dropEffect = 'move';
}
function _drop(e) {
  e.preventDefault();
  const container = e.currentTarget;
  const afterElement = _getDragAfterElement(
    container,
    e.clientX,
    e.clientY          // ← new
  );
  if (_draggedItem && container.contains(_draggedItem)) {
    if (afterElement) {
      container.insertBefore(_draggedItem, afterElement);
    } else {
      container.appendChild(_draggedItem);
    }
    _resetOrderStyles(container);
  }
}

/* --- touch handlers --- */
/* --- touch handlers (with cancelable check) --- */
function _touchStart(e) {
  _touchItem = this;
  const touch = e.touches[0];
  _touchClone = this.cloneNode(true);
  _touchClone.style.cssText = 'position:fixed; z-index:1000; opacity:0.8; pointer-events:none;';
  _touchClone.style.width = this.offsetWidth + 'px';
  document.body.appendChild(_touchClone);
  _moveClone(touch.clientX, touch.clientY);
  this.classList.add('EH-exercise-type3-sentenceorder-dragging');
  if (e.cancelable) e.preventDefault();   // <-- safe cancel
}

function _touchMove(e) {
  if (!_touchItem) return;
  _moveClone(e.touches[0].clientX, e.touches[0].clientY);
  if (e.cancelable) e.preventDefault();   // <-- safe cancel
}
function _touchEnd(e) {
  if (!_touchItem) return;
  _touchItem.classList.remove('EH-exercise-type3-sentenceorder-dragging');
  if (_touchClone) {
    document.body.removeChild(_touchClone);
    _touchClone = null;
  }

  const touch = e.changedTouches[0];
  const container = _touchItem.parentElement;

  // All siblings except the dragged item itself
  const words = [...container.querySelectorAll('.order-word')].filter(
    w => w !== _touchItem
  );

  let targetWord = null;
  let insertBefore = true;
  let minDistance = Infinity;

  words.forEach(word => {
    const box = word.getBoundingClientRect();
    const centerX = box.left + box.width / 2;
    const centerY = box.top + box.height / 2;
    const dx = touch.clientX - centerX;
    const dy = touch.clientY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < minDistance) {
      minDistance = distance;
      targetWord = word;
      insertBefore = dx < 0;
    }
  });

  if (targetWord) {
    if (insertBefore) {
      container.insertBefore(_touchItem, targetWord);
    } else {
      container.insertBefore(_touchItem, targetWord.nextSibling);
    }
  } else {
    container.appendChild(_touchItem);
  }

  _resetOrderStyles(container);
  _touchItem = null;
}
function _moveClone(x, y) {
  if (_touchClone) {
    _touchClone.style.left = (x - _touchClone.offsetWidth / 2) + 'px';
    _touchClone.style.top = (y - _touchClone.offsetHeight / 2) + 'px';
  }
}

function _getDragAfterElement(container, x, y) {
  const draggableElements = [
    ...container.querySelectorAll(
      '.order-word:not(.EH-exercise-type3-sentenceorder-dragging)'
    )
  ];
  if (draggableElements.length === 0) return null;

  let closestElement = null;
  let closestDistance = Infinity;
  let insertBefore = true;

  draggableElements.forEach(child => {
    const box = child.getBoundingClientRect();
    const centerX = box.left + box.width / 2;
    const centerY = box.top + box.height / 2;
    const dx = x - centerX;
    const dy = y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < closestDistance) {
      closestDistance = distance;
      closestElement = child;
      insertBefore = dx < 0;        // left of centre → insert before
    }
  });

  if (!closestElement) return null;
  return insertBefore
    ? closestElement
    : closestElement.nextSibling;   // null → append at end
}

function _resetOrderStyles(container) {
  container.querySelectorAll('.order-word').forEach(w => {
    w.classList.remove('EH-exercise-type3-sentenceorder-correct', 'EH-exercise-type3-sentenceorder-incorrect');
  });
  container.classList.remove('EH-exercise-type3-sentenceorder-correct', 'EH-exercise-type3-sentenceorder-incorrect');
}
/**
 * Builds multiple‑choice exercises from a config object.
 * Returns the ‘correctAnswers’ object that the existing check function needs.
 *
 * @param {Object} config
 * @param {string} config.containerId   – ID of the empty container div
 * @param {string} [config.prefix]      – prefix for names/IDs (default: "EH-exercise-type1-possibilities3")
 * @param {Array}  config.questions     – array of question objects
 * @param {string} config.questions[].questionTextKey – i18n key for the question
 * @param {Array}  config.questions[].options         – array of { value, labelKey }
 * @param {string} config.questions[].correctAnswer   – value of the correct radio
 */
function buildMultipleChoiceExercise(config) {
  const container = document.getElementById(config.containerId);
  if (!container) return {};

  const prefix = config.prefix || 'EH-exercise-type1-possibilities3';
  const questions = config.questions;
  container.innerHTML = '';

  questions.forEach((q, qIdx) => {
    const index = qIdx + 1;

    // Card
    const card = document.createElement('div');
    card.className = 'EH-exercise-card';

    // Number
    const number = document.createElement('div');
    number.className = 'EH-exercise-number';
    number.textContent = index;

    // Question text
    const text = document.createElement('p');
    text.className = 'EH-exercise-text';
    text.setAttribute('data-i18n', q.questionTextKey);

    // Options
    const optionsDiv = document.createElement('div');
    optionsDiv.className = 'EH-exercise-options';

    q.options.forEach(opt => {
      const optDiv = document.createElement('div');
      optDiv.className = 'EH-exercise-option EH-exercise-type1-possibilities3-option';

      const input = document.createElement('input');
      input.type = 'radio';
      input.id = `${prefix}-q${index}-${opt.value}`;
      input.name = `${prefix}-q${index}`;
      input.value = opt.value;

      const label = document.createElement('label');
      label.setAttribute('for', input.id);
      label.setAttribute('data-i18n', opt.labelKey);

      optDiv.appendChild(input);
      optDiv.appendChild(label);
      optionsDiv.appendChild(optDiv);
    });

    // Status
    const status = document.createElement('div');
    status.className = 'EH-exercise-type1-possibilities3-answer-status';
    status.id = `${prefix}-q${index}-status`;

    card.appendChild(number);
    card.appendChild(text);
    card.appendChild(optionsDiv);
    card.appendChild(status);
    container.appendChild(card);
  });

  // Build the correct‑answers object (exactly what the page expects)
  const correctAnswers = {};
  questions.forEach((q, qIdx) => {
    const index = qIdx + 1;
    correctAnswers[`${prefix}-q${index}`] = q.correctAnswer;
  });

  return correctAnswers;
}
/**
 * Builds fill‑in‑the‑blank exercises from a config object.
 * Returns the ‘correctAnswers’ object expected by ExerciseType2FillBlankCheckAnswers.
 *
 * @param {Object} config
 * @param {string} config.containerId   – ID of the empty container div
 * @param {string} [config.prefix]      – prefix for input/status IDs (default: "fill")
 * @param {Array}  config.questions     – array of question objects
 * @param {string} config.questions[].questionTextKey – i18n key for the question
 * @param {string|string[]} config.questions[].answers – accepted answer(s)
 */
function buildFillInTheBlankExercise(config) {
  const container = document.getElementById(config.containerId);
  if (!container) return {};

  const prefix = config.prefix || 'fill';
  const questions = config.questions;
  container.innerHTML = '';

  // This object will map e.g. 'fill-q1' -> [accepted answers]
  const correctAnswers = {};

  questions.forEach((q, qIdx) => {
    const index = qIdx + 1;
    const key = `${prefix}-q${index}`;

    // Store the answers (always as an array for the check function)
    correctAnswers[key] = Array.isArray(q.answers) ? q.answers : [q.answers];

    // --- Build card ---
    const card = document.createElement('div');
    card.className = 'EH-exercise-card';

    // Number
    const number = document.createElement('div');
    number.className = 'EH-exercise-number';
    number.textContent = index;   // Not localised; numbers are universal

    // Question text
    const text = document.createElement('p');
    text.className = 'EH-exercise-text';
    text.setAttribute('data-i18n', q.questionTextKey);

    // Input
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'EH-exercise-type2-fillblank-input';
    input.id = `${prefix}-q${index}-input`;
    input.placeholder = 'Type answer';   // placeholder can stay in English for now

    // Status div
    const status = document.createElement('div');
    status.className = 'EH-exercise-type2-fillblank-answer-status';
    status.id = `${prefix}-q${index}-status`;

    // Assemble card
    card.appendChild(number);
    card.appendChild(text);
    card.appendChild(input);
    card.appendChild(status);

    container.appendChild(card);
  });

  return correctAnswers;
}
/**
 * Builds sentence‑ordering exercises from a config object.
 * Returns the ‘correctAnswers’ object expected by ExerciseType3SentenceOrderCheckAnswers.
 *
 * @param {Object} config
 * @param {string} config.containerId   – ID of the empty container div
 * @param {string} [config.prefix]      – prefix for IDs (default: "order")
 * @param {Array}  config.questions     – array of question objects
 * @param {string} config.questions[].questionTextKey – i18n key for the question
 * @param {Array}  config.questions[].words           – initial order of word tokens
 * @param {string} config.questions[].correctSentence – well‑formed sentence (used for checking)
 */
function buildSentenceOrderingExercise(config) {
  const container = document.getElementById(config.containerId);
  if (!container) return {};

  const prefix = config.prefix || 'order';
  const questions = config.questions;
  container.innerHTML = '';

  const correctAnswers = {};

  questions.forEach((q, qIdx) => {
    const index = qIdx + 1;
    const key = `${prefix}-q${index}`;
    correctAnswers[key] = q.correctSentence;

    // ---------- Card ----------
    const card = document.createElement('div');
    card.className = 'EH-exercise-card';

    // Number
    const number = document.createElement('div');
    number.className = 'EH-exercise-number';
    number.textContent = index;   // numbers are universal

    // Question text (i18n key)
    const text = document.createElement('p');
    text.className = 'EH-exercise-text';
    text.setAttribute('data-i18n', q.questionTextKey);

    // Word container
    const wordContainer = document.createElement('div');
    wordContainer.className = 'EH-exercise-type3-sentenceorder-word-container';
    wordContainer.id = `${prefix}-q${index}-words`;

    // Word spans (with original order index)
    q.words.forEach((word, wIdx) => {
      const span = document.createElement('span');
      span.className = 'EH-exercise-type3-sentenceorder-word order-word';
      span.setAttribute('data-original-index', wIdx + 1);
      span.textContent = word;
      wordContainer.appendChild(span);
    });

    // Status
    const status = document.createElement('div');
    status.className = 'EH-exercise-type3-sentenceorder-answer-status';
    status.id = `${prefix}-q${index}-status`;

    card.appendChild(number);
    card.appendChild(text);
    card.appendChild(wordContainer);
    card.appendChild(status);
    container.appendChild(card);
  });

  return correctAnswers;
}

// Expose globally
// Make it globally accessible
window.buildMultipleChoiceExercise = buildMultipleChoiceExercise;
window.buildFillInTheBlankExercise = buildFillInTheBlankExercise;
window.buildSentenceOrderingExercise = buildSentenceOrderingExercise;
/* -----------------------------------------------------------------
   Auto‑init on page load (just ensures missing classes are added)
   ----------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', function() {
  _ensureConjugationOptionClasses();
});