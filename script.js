/* ===== Configuration ===== */
const CONFIG = {
    googleScriptUrl: 'https://script.google.com/macros/s/AKfycbyYG30xSpbDLpo9UzqVnp_53zkBEaw3hEeaMOQ7REYZ25ScwKyHKiMcbO6cOdASjN-JgQ/exec',
    modalCloseDelay: 2000,
    scrollThreshold: 0.15,
    scrollRootMargin: '0px 0px -40px 0px',
};

/* ===== DOM Elements ===== */
const elements = {
    modalOverlay: document.getElementById('modalOverlay'),
    modal: document.getElementById('modal'),
    openBtn: document.getElementById('openModal'),
    closeBtn: document.getElementById('modalClose'),
    form: document.getElementById('rsvpForm'),
    submitBtn: document.getElementById('submitBtn'),
    formStatus: document.getElementById('formStatus'),
    attendance: document.getElementById('attendance'),
};

/* ===== Modal ===== */
function toggleModal(show) {
    elements.modalOverlay.classList.toggle('active', show);
    document.body.style.overflow = show ? 'hidden' : '';
}

elements.openBtn.addEventListener('click', () => toggleModal(true));
elements.closeBtn.addEventListener('click', () => toggleModal(false));

elements.modalOverlay.addEventListener('click', (e) => {
    if (e.target === elements.modalOverlay) toggleModal(false);
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') toggleModal(false);
});

/* ===== Form Validation ===== */
function validateField(input) {
    const value = input.value.trim();
    const isInvalid = (input.required && !value) ||
                      (input.minLength > 0 && value.length < input.minLength);
    input.classList.toggle('invalid', isInvalid);
    return !isInvalid;
}

elements.form.querySelectorAll('input').forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
        if (input.classList.contains('invalid')) validateField(input);
    });
});

/* ===== Form Status Helper ===== */
function setFormStatus(type, message) {
    elements.formStatus.className = type ? `form-status ${type}` : 'form-status';
    elements.formStatus.textContent = message || '';
}

function setSubmitState(disabled, text) {
    elements.submitBtn.disabled = disabled;
    elements.submitBtn.textContent = text;
}

/* ===== Form Submit ===== */
elements.form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const inputs = elements.form.querySelectorAll('input[required]');
    let isValid = true;
    inputs.forEach(input => {
        if (!validateField(input)) isValid = false;
    });

    if (!elements.attendance.value) isValid = false;
    if (!isValid) return;

    const data = {
        fullName: document.getElementById('fullName').value.trim(),
        contact: document.getElementById('contact').value.trim(),
        attendance: elements.attendance.value,
        guestCount: document.getElementById('guestCount').value,
        speech: document.getElementById('speech').value,
    };

    setSubmitState(true, 'Отправка...');
    setFormStatus(null);

    try {
        await fetch(CONFIG.googleScriptUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(data).toString(),
        });

        setFormStatus('success', 'Спасибо! Ваш ответ принят ✓');
        elements.form.reset();

        setTimeout(() => {
            toggleModal(false);
            setFormStatus(null);
            setSubmitState(false, 'Отправить');
        }, CONFIG.modalCloseDelay);

    } catch {
        setFormStatus('error', 'Произошла ошибка. Попробуйте ещё раз.');
        setSubmitState(false, 'Отправить');
    }
});

/* ===== Scroll Animations ===== */
const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            scrollObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: CONFIG.scrollThreshold,
    rootMargin: CONFIG.scrollRootMargin,
});

document.querySelectorAll('.animate-on-scroll').forEach(el => {
    scrollObserver.observe(el);
});

/* ===== Swiper Photo Slider ===== */
document.addEventListener('DOMContentLoaded', () => {
    new Swiper('#photoSlider', {
        slidesPerView: 3,
        centeredSlides: true,
        loop: true,
        speed: 600,
        autoplay: {
            delay: 3000,
            disableOnInteraction: false,
        },
        navigation: {
            prevEl: '.swiper-button-prev',
            nextEl: '.swiper-button-next',
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        breakpoints: {
            0: { slidesPerView: 1, spaceBetween: 24 },
            481: { slidesPerView: 1, spaceBetween: 40 },
            769: { slidesPerView: 3, spaceBetween: 16 },
        },
    });
});
