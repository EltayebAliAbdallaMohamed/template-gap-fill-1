// script.js — loads data.json and handles UI logic
const choicesEl = document.getElementById('choices');
const stemEl = document.getElementById('stem');
const progressEl = document.getElementById('progress');
const feedbackEl = document.getElementById('feedback');
const checkBtn = document.getElementById('check');
const showBtn = document.getElementById('show');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const shuffleBtn = document.getElementById('shuffle');
const yearEl = document.getElementById('year');

let questions = [];
let options = [];
let index = 0;

yearEl.textContent = new Date().getFullYear();

async function loadData(){
  try{
    const res = await fetch('./data2.json', {cache: "no-store"});
    if(!res.ok) throw new Error('Failed to fetch data.json');
    const data = await res.json();
    questions = data.questions || [];
    options = data.options || [];
    // if there are no global options, derive from answers
    if(options.length === 0){
      const unique = Array.from(new Set(questions.map(q => q.answer)));
      options = unique;
    }
    index = 0;
    renderQuestion();
    nextBtn.disabled = false;
    prevBtn.disabled = false;
  }catch(err){
    stemEl.textContent = 'Error loading questions.';
    console.error(err);
  }
}

function populateOptions(shuffle = true){
  // Build option elements; keep a placeholder at top
  choicesEl.innerHTML = '';
  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = 'Select an answer';
  choicesEl.appendChild(placeholder);

  // make a copy so we can shuffle without affecting original order
  const arr = options.slice();
  if(shuffle) shuffleArray(arr);

  for(const opt of arr){
    const o = document.createElement('option');
    o.value = opt;
    o.textContent = opt;
    choicesEl.appendChild(o);
  }
}

function renderQuestion(){
  if(questions.length === 0){ stemEl.textContent = 'No questions.'; return; }
  const q = questions[index];
  stemEl.textContent = q.stem;
  progressEl.textContent = `${index+1} of ${questions.length}`;
  feedbackEl.textContent = '';
  populateOptions(true);
  choicesEl.value = '';
  checkBtn.disabled = true;
  // update prev/next button state
  prevBtn.disabled = (index === 0);
  nextBtn.disabled = (index === questions.length - 1);
}

function checkAnswer(){
  const selected = choicesEl.value;
  if(!selected) return;
  const correct = questions[index].answer;
  if(selected === correct){
    feedbackEl.textContent = 'Correct ✅';
    feedbackEl.style.color = 'var(--success)';
  }else{
    feedbackEl.textContent = `Not quite — try again or press "Show answer".`;
    feedbackEl.style.color = 'var(--danger)';
  }
}

function showAnswer(){
  const correct = questions[index].answer;
  feedbackEl.textContent = `Answer: ${correct}`;
  feedbackEl.style.color = '#0b1220';
  // set the select to the correct one if present
  for(const opt of Array.from(choicesEl.options)){
    if(opt.value === correct){ choicesEl.value = correct; break; }
  }
}

function shuffleArray(a){
  for(let i = a.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* Event listeners */
choicesEl.addEventListener('change', () => {
  checkBtn.disabled = (choicesEl.value === '');
  feedbackEl.textContent = '';
});

checkBtn.addEventListener('click', checkAnswer);
showBtn.addEventListener('click', showAnswer);

prevBtn.addEventListener('click', () => {
  if(index > 0){ index--; renderQuestion(); }
});
nextBtn.addEventListener('click', () => {
  if(index < questions.length - 1){ index++; renderQuestion(); }
});

shuffleBtn.addEventListener('click', () => {
  populateOptions(true);
  feedbackEl.textContent = 'Options shuffled.';
  feedbackEl.style.color = 'var(--muted)';
});

/* keyboard navigation: left/right arrows and Enter to check */
document.addEventListener('keydown', (e) => {
  if(e.key === 'ArrowLeft') prevBtn.click();
  if(e.key === 'ArrowRight') nextBtn.click();
  if(e.key === 'Enter' && document.activeElement === choicesEl) checkBtn.click();
});

/* Initialize */
loadData();