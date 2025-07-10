class OsmanlicaUygulamasi {
    constructor() {
        this.elements = {
            osmanlicaKelime: document.getElementById('osmanlicaKelime'),
            transliteration: document.getElementById('transliteration'),
            meaning: document.getElementById('meaning'),
            kelimeSayaci: document.querySelector('.counter-text'),
            oncekiKelimeBtn: document.getElementById('oncekiKelimeBtn'),
            sonrakiKelimeBtn: document.getElementById('sonrakiKelimeBtn'),
            rastgeleKelimeBtn: document.getElementById('rastgeleKelimeBtn'),
            bilmiyorumBtn: document.getElementById('bilmiyorumBtn'),
            biliyorumBtn: document.getElementById('biliyorumBtn'),
            listeButonlari: document.getElementById('listeButonlari'),
            yeniListeEkleBtn: document.getElementById('yeniListeEkleBtn'),
            listeyiSilBtn: document.getElementById('listeyiSilBtn'),
            jsonFileInput: document.getElementById('jsonFileInput'),
            mevcutListeyeEkleBtn: document.getElementById('mevcutListeyeEkleBtn'),
            yeniListeOlusturBtn: document.getElementById('yeniListeOlusturBtn'),
            themeButtons: document.querySelectorAll('.theme-btn'),
            premiumBtn: document.getElementById('premiumBtn'),
            premiumModal: document.getElementById('premiumModal') ? new bootstrap.Modal(document.getElementById('premiumModal')) : null,
            premiumPassword: document.getElementById('premiumPassword'),
            premiumLoginBtn: document.getElementById('premiumLoginBtn'),
            premiumLogoutBtn: document.getElementById('premiumLogoutBtn'),
            premiumLoginForm: document.getElementById('premiumLoginForm'),
            premiumInfo: document.getElementById('premiumInfo'),
            premiumBadge: document.getElementById('premiumBadge'),
            wordLimitAlert: document.getElementById('wordLimitAlert'),
            premiumStatusAlert: document.getElementById('premiumStatusAlert'),
            searchInput: document.getElementById('searchInput'),
            searchButton: document.getElementById('searchButton'),
            startQuizBtn: document.getElementById('startQuizBtn'),
            quizModal: document.getElementById('quizModal') ? new bootstrap.Modal(document.getElementById('quizModal')) : null,
            quizQuestion: document.getElementById('quizQuestion'),
            quizOptions: document.getElementById('quizOptions'),
            nextQuestionBtn: document.getElementById('nextQuestionBtn'),
            endQuizBtn: document.getElementById('endQuizBtn'),
            quizScore: document.getElementById('quizScore'),
            supportForm: document.getElementById('supportForm'),
            supportName: document.getElementById('supportName'),
            supportEmail: document.getElementById('supportEmail'),
            supportMessage: document.getElementById('supportMessage'),
            supportSubmitBtn: document.getElementById('supportSubmitBtn'),
            supportSubmitText: document.getElementById('supportSubmitText'),
            supportSpinner: document.getElementById('supportSpinner'),
            supportAlert: document.getElementById('supportAlert'),
            supportModal: document.getElementById('supportModal') ? new bootstrap.Modal(document.getElementById('supportModal')) : null
        };

        this.kelimeListeleri = {};
        this.aktifListeAdi = null;
        this.suankiKelimeIndex = 0;
        this.filteredKelimeler = [];
        this.premium = false;
        this.firebaseReadyCalled = false;
        this.quizWords = [];
        this.currentQuizIndex = 0;
        this.quizScore = 0;
        this.quizTotal = 0;

        this.config = {
            freeWordLimit: 100,
            emailJsServiceId: 'service_1avrv0q',
            emailJsTemplateId: 'template_pc99ct6',
            emailJsUserId: '8BdNp7u1PufddSEM8'
        };

        this.eventListeners = new Map();

        // Kritik elementleri kontrol et
        const requiredElements = ['osmanlicaKelime', 'transliteration', 'meaning', 'kelimeSayaci'];
        for (const el of requiredElements) {
            if (!this.elements[el]) {
                console.error(`Gerekli element ${el} DOM'da bulunamadı`);
                this.showAlert(`Uygulama başlatılamadı: ${el} elementi eksik.`, 'danger');
                return;
            }
        }

        this.init();
    }

    async init() {
        try {
            this.temaYukle();
            this.eventListenerlariAyarla();
            this.setupModalAccessibility();
            await this.firebaseReady();
            this.updatePremiumUI();
        } catch (error) {
            console.error('Başlatma hatası:', error);
            this.showAlert('Uygulama başlatılırken bir hata oluştu.', 'danger');
        }
    }

    setupModalAccessibility() {
        const modals = document.querySelectorAll('.modal');
        const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';

        modals.forEach(modal => {
            const modalId = modal.id;
            const closeButtons = modal.querySelectorAll('[data-bs-dismiss="modal"], .btn-close');
            const openButtons = document.querySelectorAll(`[data-bs-toggle="modal"][data-bs-target="#${modalId}"]`);

            // Modal başlangıç durumu
            if (!modal.classList.contains('show')) {
                modal.setAttribute('aria-hidden', 'true');
                modal.style.pointerEvents = 'none'; // inert yerine yedek çözüm
            }

            const shownHandler = () => {
                modal.setAttribute('aria-hidden', 'false');
                modal.style.pointerEvents = 'auto';
                const focusableElements = modal.querySelectorAll(focusableSelector);
                if (focusableElements.length > 0) {
                    focusableElements[0].focus();
                }
            };

            const hideHandler = () => {
                // Modal kapanmadan önce odak uygun bir elemente taşınır
                let focusTarget = openButtons.length > 0 ? openButtons[0] : document.body;
                openButtons.forEach(button => {
                    if (button.getAttribute('aria-expanded') === 'true') {
                        focusTarget = button;
                    }
                });
                focusTarget.focus();

                // Odak taşındıktan sonra aria-hidden uygulanır
                setTimeout(() => {
                    modal.setAttribute('aria-hidden', 'true');
                    modal.style.pointerEvents = 'none';
                    const keydownHandler = this.eventListeners.get(`modal-keydown-${modalId}`);
                    if (keydownHandler) {
                        modal.removeEventListener('keydown', keydownHandler);
                        this.eventListeners.delete(`modal-keydown-${modalId}`);
                    }
                }, 0);
            };

            const keydownHandler = (e) => {
                if (e.key === 'Tab') {
                    const focusableContent = modal.querySelectorAll(focusableSelector);
                    const first = focusableContent[0];
                    const last = focusableContent[focusableContent.length - 1];

                    if (e.shiftKey && document.activeElement === first) {
                        last.focus();
                        e.preventDefault();
                    } else if (!e.shiftKey && document.activeElement === last) {
                        first.focus();
                        e.preventDefault();
                    }
                } else if (e.key === 'Escape') {
                    const modalInstance = bootstrap.Modal.getInstance(modal);
                    if (modalInstance) modalInstance.hide();
                }
            };

            modal.addEventListener('shown.bs.modal', shownHandler);
            modal.addEventListener('hide.bs.modal', hideHandler);
            modal.addEventListener('keydown', keydownHandler);
            this.eventListeners.set(`modal-shown-${modalId}`, shownHandler);
            this.eventListeners.set(`modal-hide-${modalId}`, hideHandler);
            this.eventListeners.set(`modal-keydown-${modalId}`, keydownHandler);

            closeButtons.forEach((button, index) => {
                const clickHandler = () => {
                    const modalInstance = bootstrap.Modal.getInstance(modal);
                    if (modalInstance) modalInstance.hide();
                };
                button.addEventListener('click', clickHandler);
                this.eventListeners.set(`modal-close-${modalId}-${button.id || index}`, clickHandler);
            });
        });

        if (this.elements.premiumModal) {
            const premiumShownHandler = () => {
                if (this.elements.premiumPassword) {
                    this.elements.premiumPassword.focus();
                }
            };
            this.elements.premiumModal._element.addEventListener('shown.bs.modal', premiumShownHandler);
            this.eventListeners.set('premium-modal-shown', premiumShownHandler);
        }

        if (this.elements.supportModal) {
            const supportShownHandler = () => {
                if (this.elements.supportName) {
                    this.elements.supportName.focus();
                } else {
                    const closeButton = this.elements.supportModal._element.querySelector('.btn-close');
                    if (closeButton) closeButton.focus();
                }
            };
            this.elements.supportModal._element.addEventListener('shown.bs.modal', supportShownHandler);
            this.eventListeners.set('support-modal-shown', supportShownHandler);

            const supportHideHandler = () => {
                const focusTarget = document.querySelector('.support-btn') || document.body;
                focusTarget.focus();
                this.resetSupportForm();
            };
            this.elements.supportModal._element.addEventListener('hide.bs.modal', supportHideHandler);
            this.eventListeners.set('support-modal-hide', supportHideHandler);
        }

        if (this.elements.quizModal) {
            const quizShownHandler = () => {
                const firstOption = this.elements.quizModal._element.querySelector('.quiz-option');
                if (firstOption) {
                    firstOption.focus();
                } else {
                    const closeButton = this.elements.quizModal._element.querySelector('.btn-close');
                    if (closeButton) closeButton.focus();
                }
            };
            this.elements.quizModal._element.addEventListener('shown.bs.modal', quizShownHandler);
            this.eventListeners.set('quiz-modal-shown', quizShownHandler);

            const quizHideHandler = () => {
                this.resetQuiz();
                const focusTarget = this.elements.startQuizBtn || document.body;
                focusTarget.focus();
            };
            this.elements.quizModal._element.addEventListener('hide.bs.modal', quizHideHandler);
            this.eventListeners.set('quiz-modal-hide', quizHideHandler);
        }
    }

    resetSupportForm() {
        if (this.elements.supportForm) this.elements.supportForm.reset();
        if (this.elements.supportAlert) {
            this.elements.supportAlert.classList.add('d-none');
            this.elements.supportAlert.innerHTML = '';
        }
        if (this.elements.supportSubmitBtn) this.elements.supportSubmitBtn.disabled = false;
        if (this.elements.supportSpinner) this.elements.supportSpinner.classList.add('d-none');
        if (this.elements.supportSubmitText) this.elements.supportSubmitText.textContent = 'Gönder';
    }

    async firebaseReady() {
        if (!window.firebase || !window.firebase.auth) {
            console.error('Firebase başlatılamadı');
            this.showAlert('Firebase başlatılamadı. Lütfen bağlantınızı kontrol edin.', 'danger');
            return;
        }

        if (!window.currentUser) {
            this.kelimeListeleri = {};
            this.aktifListeAdi = null;
            this.listeButonlariniGuncelle();
            this.kelimeGoster();
            this.premium = false;
            return;
        }

        try {
            await this.loadUserPremium();
            await this.firestoreListeleriYukle();
        } catch (error) {
            console.error('Firebase başlatma hatası:', error);
            this.showAlert('Veriler yüklenirken bir hata oluştu.', 'danger');
        }
    }

    async loadUserPremium() {
        if (!window.currentUser || !window.firebase.firestore) return;
        try {
            const userDoc = await db.collection("users").doc(window.currentUser.uid).get();
            this.premium = userDoc.exists && userDoc.data().premium;
            this.updatePremiumUI();
        } catch (error) {
            console.error('Premium durum yükleme hatası:', error);
            this.showAlert('Premium durum kontrolü başarısız.', 'danger');
        }
    }

    updatePremiumUI() {
        if (this.elements.premiumBadge) {
            this.elements.premiumBadge.classList.toggle('d-none', !this.premium);
        }
        if (this.elements.premiumInfo) {
            this.elements.premiumInfo.classList.toggle('d-none', !this.premium);
        }
        if (this.elements.premiumStatusAlert) {
            this.elements.premiumStatusAlert.classList.toggle('d-none', this.premium);
        }
        if (this.elements.premiumLoginForm) {
            this.elements.premiumLoginForm.classList.toggle('d-none', this.premium);
        }
        if (this.elements.premiumLogoutBtn) {
            this.elements.premiumLogoutBtn.classList.toggle('d-none', !this.premium);
        }
    }

    async firestoreListeleriYukle() {
        const user = window.currentUser;
        if (!user || !window.firebase.firestore) return;
        try {
            const snapshot = await db.collection("users").doc(user.uid).collection("kelimeListeleri").get();
            this.kelimeListeleri = {};
            snapshot.forEach(doc => {
                this.kelimeListeleri[doc.id] = doc.data().kelimeler || [];
            });
            this.aktifListeAdi = Object.keys(this.kelimeListeleri)[0] || null;
            this.listeButonlariniGuncelle();
            this.kelimeGoster();
        } catch (error) {
            console.error('Kelime listeleri yükleme hatası:', error);
            this.showAlert('Kelime listeleri yüklenemedi.', 'danger');
        }
    }

    async firestoreListeKaydet(listeAdi) {
        const user = window.currentUser;
        if (!user || !window.firebase.firestore) return;
        try {
            const kelimeler = this.kelimeListeleri[listeAdi] || [];
            await db.collection("users").doc(user.uid).collection("kelimeListeleri").doc(listeAdi).set({ kelimeler });
        } catch (error) {
            console.error('Liste kaydetme hatası:', error);
            this.showAlert('Liste kaydedilemedi.', 'danger');
        }
    }

    async firestoreListeSil(listeAdi) {
        const user = window.currentUser;
        if (!user || !window.firebase.firestore) return;
        try {
            await db.collection("users").doc(user.uid).collection("kelimeListeleri").doc(listeAdi).delete();
        } catch (error) {
            console.error('Liste silme hatası:', error);
            this.showAlert('Liste silinemedi.', 'danger');
        }
    }

    temaYukle() {
        const savedTheme = localStorage.getItem('osmanlicaTheme') || 'light';
        this.temaDegistir(savedTheme);
    }

    temaDegistir(theme) {
        if (!document.body) return;
        document.body.className = `${theme}-theme`;
        localStorage.setItem('osmanlicaTheme', theme);
        this.elements.themeButtons.forEach(btn => {
            if (btn.dataset.theme) {
                btn.classList.toggle('active', btn.dataset.theme === theme);
            }
        });
    }

    listeButonlariniGuncelle() {
        if (!this.elements.listeButonlari) return;
        this.elements.listeButonlari.innerHTML = '';
        Object.keys(this.kelimeListeleri).forEach(listeAdi => {
            const btn = document.createElement('button');
            btn.className = `btn btn-sm ${listeAdi === this.aktifListeAdi ? 'btn-primary' : 'btn-outline-secondary'}`;
            btn.textContent = listeAdi;
            btn.setAttribute('aria-label', `${listeAdi} listesini seç`);
            const clickHandler = () => this.aktifListeDegistir(listeAdi);
            btn.addEventListener('click', clickHandler);
            btn.dataset.listeAdi = listeAdi;
            this.eventListeners.set(`liste-btn-${listeAdi}`, clickHandler);
            this.elements.listeButonlari.appendChild(btn);
        });
    }

    aktifListeDegistir(listeAdi) {
        this.aktifListeAdi = listeAdi;
        this.suankiKelimeIndex = 0;
        this.filteredKelimeler = [];
        this.listeButonlariniGuncelle();
        this.kelimeGoster();
    }

    aktifKelimeler() {
        return this.filteredKelimeler.length > 0 ? 
            this.filteredKelimeler : 
            (this.aktifListeAdi ? this.kelimeListeleri[this.aktifListeAdi] || [] : []);
    }

    kelimeGoster(isFiltered = false) {
        if (!this.elements.osmanlicaKelime || !this.elements.transliteration || !this.elements.meaning) return;

        const kelimeler = isFiltered ? this.filteredKelimeler : this.aktifKelimeler();

        if (kelimeler.length === 0) {
            this.elements.osmanlicaKelime.textContent = '---';
            this.elements.transliteration.textContent = '---';
            this.elements.meaning.textContent = isFiltered ? 'Sonuç bulunamadı' : (this.aktifListeAdi ? 'Liste boş' : 'Liste yükleyin');
            this.guncelleKelimeSayaci();
            return;
        }

        const kelime = kelimeler[this.suankiKelimeIndex];

        [this.elements.osmanlicaKelime, this.elements.transliteration, this.elements.meaning]
            .forEach(el => el.style.opacity = 0);

        setTimeout(() => {
            this.elements.osmanlicaKelime.textContent = kelime.word || '---';
            this.elements.transliteration.textContent = kelime.transliteration || '---';
            this.elements.meaning.textContent = kelime.meaning || '---';

            [this.elements.osmanlicaKelime, this.elements.transliteration, this.elements.meaning]
                .forEach(el => el.style.opacity = 1);

            this.guncelleKelimeSayaci();
        }, 200);
    }

    guncelleKelimeSayaci() {
        if (!this.elements.kelimeSayaci) return;
        const kelimeler = this.aktifKelimeler();
        this.elements.kelimeSayaci.textContent = 
            `${kelimeler.length ? this.suankiKelimeIndex + 1 : 0}/${kelimeler.length}`;
    }

    oncekiKelime() {
        const kelimeler = this.aktifKelimeler();
        if (!kelimeler.length) return;
        this.suankiKelimeIndex = (this.suankiKelimeIndex - 1 + kelimeler.length) % kelimeler.length;
        this.kelimeGoster(this.filteredKelimeler.length > 0);
    }

    sonrakiKelime() {
        const kelimeler = this.aktifKelimeler();
        if (!kelimeler.length) return;
        this.suankiKelimeIndex = (this.suankiKelimeIndex + 1) % kelimeler.length;
        this.kelimeGoster(this.filteredKelimeler.length > 0);
    }

    rastgeleKelime() {
        const kelimeler = this.aktifKelimeler();
        if (kelimeler.length < 2) return;

        let yeniIndex;
        do {
            yeniIndex = Math.floor(Math.random() * kelimeler.length);
        } while (yeniIndex === this.suankiKelimeIndex);

        this.suankiKelimeIndex = yeniIndex;
        this.kelimeGoster(this.filteredKelimeler.length > 0);
    }

    kelimeAra() {
        if (!this.elements.searchInput) return;
        const searchTerm = this.elements.searchInput.value.toLowerCase().trim();
        if (!searchTerm) {
            this.filteredKelimeler = [];
            this.suankiKelimeIndex = 0;
            this.kelimeGoster();
            return;
        }

        const kelimeler = this.aktifListeAdi ? this.kelimeListeleri[this.aktifListeAdi] || [] : [];
        this.filteredKelimeler = kelimeler.filter(kelime =>
            (kelime.word?.toLowerCase().includes(searchTerm)) ||
            (kelime.transliteration?.toLowerCase().includes(searchTerm)) ||
            (kelime.meaning?.toLowerCase().includes(searchTerm))
        );

        if (this.filteredKelimeler.length > 0) {
            this.suankiKelimeIndex = 0;
            this.kelimeGoster(true);
        } else {
            this.showAlert('Aranan kelime bulunamadı', 'warning');
        }
    }

    async jsonDosyasiniIsle(file, mevcutListeyeEkle) {
        if (!file || !this.elements.jsonFileInput) return;
        if (this.checkWordLimit()) {
            if (this.elements.premiumModal) this.elements.premiumModal.show();
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const yeniKelimeler = JSON.parse(e.target.result);
                if (!Array.isArray(yeniKelimeler)) throw new Error('Geçersiz JSON formatı');

                const gecerliKelimeler = yeniKelimeler.filter(k => k?.word && k?.meaning);
                if (!gecerliKelimeler.length) throw new Error('Geçerli kelime bulunamadı');

                let listeAdi = this.aktifListeAdi;
                if (!mevcutListeyeEkle || !listeAdi) {
                    listeAdi = file.name.replace('.json', '') || 'Yeni Liste';
                    this.kelimeListeleri[listeAdi] = gecerliKelimeler;
                    this.aktifListeAdi = listeAdi;
                } else {
                    this.kelimeListeleri[listeAdi] = [
                        ...(this.kelimeListeleri[listeAdi] || []),
                        ...gecerliKelimeler
                    ];
                }

                await this.firestoreListeKaydet(listeAdi);
                this.listeButonlariniGuncelle();
                this.kelimeGoster();

                this.showAlert(`${gecerliKelimeler.length} kelime başarıyla yüklendi!`, 'success');
            } catch (error) {
                console.error('JSON işleme hatası:', error);
                this.showAlert(`Hata: ${error.message}`, 'danger');
            }
        };
        reader.onerror = () => {
            this.showAlert('Dosya okunamadı.', 'danger');
        };
        reader.readAsText(file);
    }

    checkWordLimit() {
        if (this.premium) return false;
        const limitAsildi = this.getTotalWordCount() >= this.config.freeWordLimit;
        if (this.elements.wordLimitAlert) {
            this.elements.wordLimitAlert.classList.toggle('d-none', !limitAsildi);
        }
        return limitAsildi;
    }

    getTotalWordCount() {
        return Object.values(this.kelimeListeleri).reduce((sum, liste) => sum + liste.length, 0);
    }

    showAlert(message, type) {
        const container = document.querySelector('.container');
        if (!container) return;
        const alert = document.createElement('div');
        alert.className = `alert alert-${type} alert-dismissible fade show`;
        alert.setAttribute('role', 'alert');
        alert.innerHTML = `${message}<button class="btn-close" data-bs-dismiss="alert" aria-label="Kapat"></button>`;
        container.prepend(alert);
        setTimeout(() => alert.remove(), 5000);
    }

    startQuiz() {
        if (!this.elements.quizModal) return;
        const kelimeler = this.aktifKelimeler();
        if (!kelimeler || kelimeler.length < 4) {
            this.showAlert('Quiz için en az 4 kelime olmalı!', 'warning');
            return;
        }
        this.quizWords = this.shuffleArray([...kelimeler]);
        this.currentQuizIndex = 0;
        this.quizScore = 0;
        this.quizTotal = Math.min(this.quizWords.length, 10);
        this.elements.quizModal.show();
        this.showQuizQuestion();
    }

    showQuizQuestion() {
        if (!this.elements.quizModal || !this.elements.quizQuestion || !this.elements.quizOptions) return;

        if (this.currentQuizIndex >= this.quizTotal) {
            this.elements.quizQuestion.textContent = 'Quiz Bitti!';
            this.elements.quizOptions.innerHTML = '';
            this.elements.quizScore.textContent = `Doğru: ${this.quizScore}/${this.quizTotal}`;
            if (this.elements.endQuizBtn) this.elements.endQuizBtn.style.display = 'block';
            if (this.elements.nextQuestionBtn) this.elements.nextQuestionBtn.style.display = 'none';
            return;
        }

        const currentWord = this.quizWords[this.currentQuizIndex];
        const correct = currentWord.meaning;
        let options = [correct];
        while (options.length < 4) {
            const wrong = this.quizWords[Math.floor(Math.random() * this.quizWords.length)].meaning;
            if (!options.includes(wrong)) options.push(wrong);
        }
        options = this.shuffleArray(options);

        this.elements.quizQuestion.textContent = `"${currentWord.word}" (${currentWord.transliteration}) kelimesinin Türkçesi nedir?`;
        this.elements.quizOptions.innerHTML = options.map((opt, index) => 
            `<button class="quiz-option btn btn-outline-primary w-100 my-1" role="button" aria-label="Seçenek ${index + 1}: ${opt}">${opt}</button>`
        ).join('');

        const optionButtons = this.elements.quizOptions.querySelectorAll('.quiz-option');
        optionButtons.forEach((btn, index) => {
            const clickHandler = () => {
                if (btn.textContent === correct) {
                    this.quizScore++;
                    btn.classList.remove('btn-outline-primary');
                    btn.classList.add('btn-success');
                } else {
                    btn.classList.remove('btn-outline-primary');
                    btn.classList.add('btn-danger');
                }
                optionButtons.forEach(b => b.disabled = true);
                if (this.elements.nextQuestionBtn) this.elements.nextQuestionBtn.style.display = 'inline-block';
            };
            btn.addEventListener('click', clickHandler);
            this.eventListeners.set(`quiz-option-${this.currentQuizIndex}-${index}`, clickHandler);
        });

        if (this.elements.nextQuestionBtn) this.elements.nextQuestionBtn.style.display = 'none';
        if (this.elements.endQuizBtn) this.elements.endQuizBtn.style.display = 'none';
    }

    nextQuizQuestion() {
        this.currentQuizIndex++;
        this.showQuizQuestion();
    }

    endQuiz() {
        if (this.elements.quizModal) this.elements.quizModal.hide();
    }

    resetQuiz() {
        this.quizWords = [];
        this.currentQuizIndex = 0;
        this.quizScore = 0;
        this.quizTotal = 0;
        if (this.elements.quizQuestion) this.elements.quizQuestion.textContent = '';
        if (this.elements.quizOptions) this.elements.quizOptions.innerHTML = '';
        if (this.elements.quizScore) this.elements.quizScore.textContent = '';
        if (this.elements.nextQuestionBtn) this.elements.nextQuestionBtn.style.display = 'none';
        if (this.elements.endQuizBtn) this.elements.endQuizBtn.style.display = 'none';
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    async handleSupportForm(e) {
        e.preventDefault();
        if (!this.elements.supportForm || !this.elements.supportSubmitBtn || !this.elements.supportSubmitText || !this.elements.supportSpinner || !this.elements.supportAlert) return;

        this.elements.supportSubmitBtn.disabled = true;
        this.elements.supportSubmitText.textContent = 'Gönderiliyor...';
        this.elements.supportSpinner.classList.remove('d-none');
        this.elements.supportAlert.classList.add('d-none');

        try {
            if (!window.emailjs) throw new Error('EmailJS yüklenemedi.');
            const formData = {
                from_name: this.elements.supportName.value.trim(),
                from_email: this.elements.supportEmail.value.trim(),
                message: this.elements.supportMessage.value.trim(),
                app_name: 'Osmanlıca Öğren'
            };

            if (!formData.from_name || !formData.from_email || !formData.message) {
                throw new Error('Lütfen tüm alanları doldurunuz');
            }

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.from_email)) {
                throw new Error('Geçerli bir e-posta adresi giriniz');
            }

            await emailjs.send(
                this.config.emailJsServiceId,
                this.config.emailJsTemplateId,
                formData,
                this.config.emailJsUserId
            );

            this.elements.supportAlert.classList.remove('alert-danger');
            this.elements.supportAlert.classList.add('alert-success');
            this.elements.supportAlert.innerHTML = `
                <i class="bi bi-check-circle-fill"></i> 
                Mesajınız başarıyla gönderildi! Teşekkür ederiz.
            `;
            this.elements.supportAlert.classList.remove('d-none');

            this.elements.supportForm.reset();

            setTimeout(() => {
                if (this.elements.supportModal) this.elements.supportModal.hide();
            }, 3000);
        } catch (error) {
            console.error('Destek formu gönderim hatası:', error);
            this.elements.supportAlert.classList.remove('alert-success');
            this.elements.supportAlert.classList.add('alert-danger');
            this.elements.supportAlert.innerHTML = `
                <i class="bi bi-exclamation-triangle-fill"></i> 
                ${error.message || 'Gönderim hatası. Lütfen daha sonra tekrar deneyin.'}
            `;
            this.elements.supportAlert.classList.remove('d-none');
        } finally {
            this.elements.supportSubmitText.textContent = 'Gönder';
            this.elements.supportSpinner.classList.add('d-none');
            this.elements.supportSubmitBtn.disabled = false;
        }
    }

    eventListenerlariAyarla() {
        this.elements.themeButtons.forEach(btn => {
            if (!btn.dataset.theme) return;
            const clickHandler = () => this.temaDegistir(btn.dataset.theme);
            btn.addEventListener('click', clickHandler);
            this.eventListeners.set(`theme-btn-${btn.dataset.theme}`, clickHandler);
        });

        const buttonListeners = [
            { element: this.elements.oncekiKelimeBtn, handler: () => this.oncekiKelime(), id: 'oncekiKelimeBtn' },
            { element: this.elements.sonrakiKelimeBtn, handler: () => this.sonrakiKelime(), id: 'sonrakiKelimeBtn' },
            { element: this.elements.rastgeleKelimeBtn, handler: () => this.rastgeleKelime(), id: 'rastgeleKelimeBtn' },
            { element: this.elements.bilmiyorumBtn, handler: () => {
                this.showAlert('Bu kelimeyi tekrar gözden geçirelim!', 'info');
                this.sonrakiKelime();
            }, id: 'bilmiyorumBtn' },
            { element: this.elements.biliyorumBtn, handler: () => {
                this.showAlert('Harika! Bu kelimeyi biliyorsunuz 🎉', 'success');
                this.sonrakiKelime();
            }, id: 'biliyorumBtn' },
            { element: this.elements.yeniListeEkleBtn, handler: async () => {
                const listeAdi = prompt('Yeni liste adı girin:');
                if (!listeAdi) return;

                if (this.kelimeListeleri[listeAdi]) {
                    this.showAlert('Bu isimde liste zaten var!', 'warning');
                    return;
                }

                this.kelimeListeleri[listeAdi] = [];
                this.aktifListeAdi = listeAdi;
                await this.firestoreListeKaydet(listeAdi);
                this.listeButonlariniGuncelle();
                this.kelimeGoster();
            }, id: 'yeniListeEkleBtn' },
            { element: this.elements.listeyiSilBtn, handler: async () => {
                if (!this.aktifListeAdi) return;
                if (confirm(`"${this.aktifListeAdi}" listesini silmek istediğinize emin misiniz?`)) {
                    await this.firestoreListeSil(this.aktifListeAdi);
                    delete this.kelimeListeleri[this.aktifListeAdi];
                    this.aktifListeAdi = Object.keys(this.kelimeListeleri)[0] || null;
                    this.listeButonlariniGuncelle();
                    this.kelimeGoster();
                }
            }, id: 'listeyiSilBtn' },
            { element: this.elements.mevcutListeyeEkleBtn, handler: () => {
                if (!this.elements.jsonFileInput?.files[0]) {
                    this.showAlert('Lütfen JSON dosyası seçin!', 'warning');
                    return;
                }
                this.jsonDosyasiniIsle(this.elements.jsonFileInput.files[0], true);
            }, id: 'mevcutListeyeEkleBtn' },
            { element: this.elements.yeniListeOlusturBtn, handler: () => {
                if (!this.elements.jsonFileInput?.files[0]) {
                    this.showAlert('Lütfen JSON dosyası seçin!', 'warning');
                    return;
                }
                this.jsonDosyasiniIsle(this.elements.jsonFileInput.files[0], false);
            }, id: 'yeniListeOlusturBtn' },
            { element: this.elements.searchButton, handler: () => this.kelimeAra(), id: 'searchButton' },
            { element: this.elements.startQuizBtn, handler: () => this.startQuiz(), id: 'startQuizBtn' },
            { element: this.elements.nextQuestionBtn, handler: () => this.nextQuizQuestion(), id: 'nextQuestionBtn' },
            { element: this.elements.endQuizBtn, handler: () => this.endQuiz(), id: 'endQuizBtn' },
            { element: this.elements.supportSubmitBtn, handler: (e) => this.handleSupportForm(e), id: 'supportSubmitBtn' }
        ];

        buttonListeners.forEach(({ element, handler, id }) => {
            if (element) {
                element.addEventListener('click', handler);
                this.eventListeners.set(id, handler);
            }
        });

        if (this.elements.searchInput) {
            const keyupHandler = (e) => {
                if (e.key === 'Enter') this.kelimeAra();
            };
            this.elements.searchInput.addEventListener('keyup', keyupHandler);
            this.eventListeners.set('searchInput-keyup', keyupHandler);
        }

        document.querySelectorAll('[href="destek.html"], .support-btn').forEach(btn => {
            const clickHandler = (e) => {
                e.preventDefault();
                if (this.elements.supportModal) {
                    this.elements.supportModal.show();
                }
            };
            btn.addEventListener('click', clickHandler);
            this.eventListeners.set(`support-btn-${btn.id || Math.random()}`, clickHandler);
        });
    }

    cleanup() {
        this.eventListeners.forEach((handler, key) => {
            const [type, id] = key.split('-', 2);
            let element;
            if (type === 'modal') {
                element = document.getElementById(id);
            } else if (type === 'theme-btn') {
                element = document.querySelector(`.theme-btn[data-theme="${id}"]`);
            } else if (type === 'liste-btn') {
                element = this.elements.listeButonlari?.querySelector(`button[data-liste-adi="${id}"]`);
            } else if (type === 'quiz-option') {
                element = this.elements.quizOptions?.querySelector(`.quiz-option:nth-child(${parseInt(id.split('-').pop()) + 1})`);
            } else {
                element = document.getElementById(id);
            }
            if (element) {
                element.removeEventListener('click', handler);
                element.removeEventListener('keydown', handler);
                element.removeEventListener('keyup', handler);
            }
        });
        this.eventListeners.clear();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    try {
        window.osmanlicaApp = new OsmanlicaUygulamasi();
    } catch (error) {
        console.error('OsmanlicaUygulamasi başlatılamadı:', error);
        const container = document.querySelector('.container');
        if (container) {
            const alert = document.createElement('div');
            alert.className = 'alert alert-danger alert-dismissible fade show';
            alert.setAttribute('role', 'alert');
            alert.innerHTML = `Uygulama başlatılamadı: ${error.message}<button class="btn-close" data-bs-dismiss="alert" aria-label="Kapat"></button>`;
            container.prepend(alert);
        }
    }
});
