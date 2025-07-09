let quizWords = [];
let currentQuizIndex = 0;
let quizScore = 0;
let quizTotal = 0;

document.getElementById('startQuizBtn').onclick = async function() {
  // Giriş yapan kullanıcıyı al
  const user = window.currentUser;
  if (!user) return alert('Önce giriş yapmalısın!');
  
  // Kullanıcının kelimelerini Firestore'dan çek
  const snapshot = await db.collection('users').doc(user.uid).collection('words').get();
  quizWords = snapshot.docs.map(doc => doc.data());

  if (quizWords.length < 4) return alert('Quiz için en az 4 kelime eklemelisin!');
  quizWords = shuffleArray(quizWords); // Karıştır
  currentQuizIndex = 0;
  quizScore = 0;
  quizTotal = Math.min(quizWords.length, 10); // Maksimum 10 soru
  showQuizModal();
  showQuizQuestion();
};

function showQuizModal() {
  document.getElementById('quizModal').style.display = 'block';
  document.getElementById('nextQuestionBtn').style.display = 'none';
  document.getElementById('endQuizBtn').style.display = 'none';
  document.getElementById('quizScore').innerText = '';
}

function showQuizQuestion() {
  if (currentQuizIndex >= quizTotal) {
    document.getElementById('quizQuestion').innerText = "Quiz Bitti!";
    document.getElementById('quizOptions').innerHTML = "";
    document.getElementById('quizScore').innerText = "Doğru: " + quizScore + "/" + quizTotal;
    document.getElementById('endQuizBtn').style.display = 'block';
    return;
  }

  const currentWord = quizWords[currentQuizIndex];
  const correct = currentWord.meaning;
  // Yanlış cevaplar için rastgele farklı anlamlar seç
  let options = [correct];
  while (options.length < 4) {
    const wrong = quizWords[Math.floor(Math.random() * quizWords.length)].meaning;
    if (!options.includes(wrong)) options.push(wrong);
  }
  options = shuffleArray(options);

  document.getElementById('quizQuestion').innerText = `"${currentWord.word}" (${currentWord.transliteration}) kelimesinin Türkçesi nedir?`;
  document.getElementById('quizOptions').innerHTML = options.map(opt =>
    `<button class="quiz-option" style="margin:8px 0; display:block; width:100%;">${opt}</button>`
  ).join('');

  Array.from(document.getElementsByClassName('quiz-option')).forEach(btn => {
    btn.onclick = function() {
      if (btn.innerText === correct) {
        quizScore++;
        btn.style.backgroundColor = 'green';
      } else {
        btn.style.backgroundColor = 'red';
      }
      // Diğer butonları pasifleştir
      Array.from(document.getElementsByClassName('quiz-option')).forEach(b => b.disabled = true);
      document.getElementById('nextQuestionBtn').style.display = 'inline-block';
    }
  });
  document.getElementById('nextQuestionBtn').onclick = function() {
    currentQuizIndex++;
    showQuizQuestion();
    this.style.display = 'none';
  };
}

document.getElementById('endQuizBtn').onclick = function() {
  document.getElementById('quizModal').style.display = 'none';
};

// Basit karıştırma fonksiyonu
function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}