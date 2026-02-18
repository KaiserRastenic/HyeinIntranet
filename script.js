const supportsFinePointer = window.matchMedia('(pointer:fine)').matches;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function initLightTrail() {
  const canvas = document.querySelector('.cursor-trail');
  if (!canvas) return;

  const context = canvas.getContext('2d');
  if (!context) return;

  let width = 0;
  let height = 0;
  let dpr = 1;
  let lastX = 0;
  let lastY = 0;
  let hasLastPoint = false;
  const particles = [];
  const maxParticles = 180;
  const palette = [
    [77, 168, 255],
    [255, 144, 186],
    [155, 247, 210]
  ];

  function resizeCanvas() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function createParticle(x, y, energy) {
    const color = palette[Math.floor(Math.random() * palette.length)];
    const jitter = 2.5 + energy * 0.2;

    particles.push({
      x: x + (Math.random() - 0.5) * jitter,
      y: y + (Math.random() - 0.5) * jitter,
      vx: (Math.random() - 0.5) * (0.26 + energy * 0.01),
      vy: (Math.random() - 0.5) * (0.26 + energy * 0.01),
      radius: 4.8 + Math.random() * 5.2 + energy * 0.045,
      life: 1,
      decay: 0.028 + Math.random() * 0.02,
      color
    });
  }

  function emitTrail(x, y) {
    if (!hasLastPoint) {
      hasLastPoint = true;
      lastX = x;
      lastY = y;
      createParticle(x, y, 2);
      return;
    }

    const deltaX = x - lastX;
    const deltaY = y - lastY;
    const distance = Math.hypot(deltaX, deltaY);
    const steps = Math.max(1, Math.min(9, Math.floor(distance / 7)));
    const energy = Math.min(distance * 1.25, 34);

    for (let i = 1; i <= steps; i += 1) {
      const progress = i / steps;
      const spawnX = lastX + deltaX * progress;
      const spawnY = lastY + deltaY * progress;
      createParticle(spawnX, spawnY, energy);
      if (energy > 16 && i % 2 === 0) {
        createParticle(spawnX, spawnY, energy * 0.7);
      }
    }

    while (particles.length > maxParticles) {
      particles.shift();
    }

    lastX = x;
    lastY = y;
  }

  function drawParticle(particle) {
    const [r, g, b] = particle.color;
    const alpha = Math.max(particle.life, 0);
    const gradient = context.createRadialGradient(
      particle.x,
      particle.y,
      0,
      particle.x,
      particle.y,
      particle.radius
    );

    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha * 0.42})`);
    gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${alpha * 0.2})`);
    gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

    context.fillStyle = gradient;
    context.beginPath();
    context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    context.fill();
  }

  function renderTrail() {
    context.clearRect(0, 0, width, height);
    context.globalCompositeOperation = 'lighter';

    for (let i = particles.length - 1; i >= 0; i -= 1) {
      const particle = particles[i];
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.radius *= 0.985;
      particle.life -= particle.decay;

      if (particle.life <= 0.04 || particle.radius <= 0.8) {
        particles.splice(i, 1);
        continue;
      }

      drawParticle(particle);
    }

    requestAnimationFrame(renderTrail);
  }

  window.addEventListener('mousemove', (event) => {
    emitTrail(event.clientX, event.clientY);
  });

  window.addEventListener('mousedown', (event) => {
    for (let i = 0; i < 6; i += 1) {
      createParticle(event.clientX, event.clientY, 24);
    }
  });

  window.addEventListener('mouseleave', () => {
    hasLastPoint = false;
  });

  window.addEventListener('resize', resizeCanvas);

  resizeCanvas();
  renderTrail();
}

if (supportsFinePointer && !prefersReducedMotion) {
  initLightTrail();
}

const buttons = document.querySelectorAll('button, .cta-btn, .menu a');
buttons.forEach((btn) => {
  btn.addEventListener('click', () => {
    btn.animate(
      [
        { transform: 'translateY(0) scale(1)' },
        { transform: 'translateY(-2px) scale(1.04)' },
        { transform: 'translateY(0) scale(1)' }
      ],
      {
        duration: 260,
        easing: 'cubic-bezier(.2,.8,.2,1)'
      }
    );
  });
});

const calendarTitle = document.querySelector('#calendarTitle');
const calendarGrid = document.querySelector('#calendarGrid');
const calendarNavButtons = document.querySelectorAll('[data-cal-nav]');

if (calendarTitle && calendarGrid) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let viewDate = new Date(today.getFullYear(), today.getMonth(), 1);
  let selectedDateKey = '';
  let selectedTime = '';
  let currentStep = 1;

  const bookingDatePreview = document.querySelector('#bookingDatePreview');
  const bookingResult = document.querySelector('#bookingResult');
  const bookingForm = document.querySelector('#bookingForm');
  const bookingPanels = document.querySelectorAll('[data-step-panel]');
  const stepIndicators = document.querySelectorAll('[data-step-indicator]');
  const nextButtons = document.querySelectorAll('[data-booking-next]');
  const backButtons = document.querySelectorAll('[data-booking-back]');
  const timeSlots = document.querySelectorAll('[data-time-slot]');
  const bookingType = document.querySelector('#bookingType');
  const bookingName = document.querySelector('#bookingName');
  const bookingEmail = document.querySelector('#bookingEmail');

  function makeDateKey(date) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  function formatDateLabel(dateKey) {
    if (!dateKey) return '';
    const [yyyy, mm, dd] = dateKey.split('-');
    return `${yyyy}년 ${Number(mm)}월 ${Number(dd)}일`;
  }

  function setStep(step) {
    currentStep = Math.min(3, Math.max(1, step));

    bookingPanels.forEach((panel) => {
      const panelStep = Number(panel.dataset.stepPanel);
      panel.classList.toggle('is-hidden', panelStep !== currentStep);
    });

    stepIndicators.forEach((dot) => {
      const dotStep = Number(dot.dataset.stepIndicator);
      dot.classList.toggle('is-active', dotStep === currentStep);
    });
  }

  function showBookingMessage(message, isError) {
    if (!bookingResult) return;
    bookingResult.classList.remove('is-hidden');
    bookingResult.textContent = message;
    bookingResult.style.borderColor = isError
      ? 'rgba(255, 132, 182, 0.6)'
      : 'rgba(118, 210, 185, 0.45)';
    bookingResult.style.background = isError
      ? 'rgba(255, 132, 182, 0.16)'
      : 'rgba(155, 247, 210, 0.18)';
  }

  function syncDatePreview() {
    if (!bookingDatePreview) return;
    if (!selectedDateKey) {
      bookingDatePreview.textContent = '달력에서 날짜를 선택해주세요.';
      return;
    }
    bookingDatePreview.textContent = `선택일: ${formatDateLabel(selectedDateKey)}`;
  }

  function renderCalendar() {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    calendarTitle.textContent = `${year}\uB144 ${month + 1}\uC6D4`;
    calendarGrid.innerHTML = '';

    for (let cell = 0; cell < 42; cell += 1) {
      const dayButton = document.createElement('button');
      dayButton.type = 'button';
      dayButton.className = 'cal-day clickable';

      let cellDate;
      if (cell < firstWeekday) {
        const day = prevMonthDays - firstWeekday + cell + 1;
        cellDate = new Date(year, month - 1, day);
        dayButton.classList.add('is-other');
      } else if (cell >= firstWeekday + daysInMonth) {
        const day = cell - firstWeekday - daysInMonth + 1;
        cellDate = new Date(year, month + 1, day);
        dayButton.classList.add('is-other');
      } else {
        const day = cell - firstWeekday + 1;
        cellDate = new Date(year, month, day);
      }

      const weekday = cellDate.getDay();
      if (weekday === 0 || weekday === 6) {
        dayButton.classList.add('is-weekend');
      }

      const cellKey = makeDateKey(cellDate);
      dayButton.dataset.date = cellKey;
      dayButton.innerHTML = `<span class="num">${cellDate.getDate()}</span>`;

      if (cellKey === makeDateKey(today)) {
        dayButton.classList.add('is-today');
      }

      if (cellKey === selectedDateKey) {
        dayButton.classList.add('is-selected');
      }

      dayButton.addEventListener('click', () => {
        selectedDateKey = cellKey;
        if (cellDate.getMonth() !== month) {
          viewDate = new Date(cellDate.getFullYear(), cellDate.getMonth(), 1);
        }
        if (bookingResult) {
          bookingResult.classList.add('is-hidden');
        }
        syncDatePreview();
        renderCalendar();
      });

      calendarGrid.appendChild(dayButton);
    }
  }

  calendarNavButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const delta = Number(button.dataset.calNav) || 0;
      viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + delta, 1);
      renderCalendar();
    });
  });

  timeSlots.forEach((slot) => {
    slot.addEventListener('click', () => {
      selectedTime = slot.dataset.timeSlot || '';
      timeSlots.forEach((target) => target.classList.remove('is-selected'));
      slot.classList.add('is-selected');
      if (bookingResult) {
        bookingResult.classList.add('is-hidden');
      }
    });
  });

  nextButtons.forEach((button) => {
    button.addEventListener('click', () => {
      if (currentStep === 1 && !selectedDateKey) {
        showBookingMessage('먼저 날짜를 선택해주세요.', true);
        return;
      }
      if (currentStep === 2 && !selectedTime) {
        showBookingMessage('상담 시간을 선택해주세요.', true);
        return;
      }
      setStep(currentStep + 1);
      if (bookingResult) {
        bookingResult.classList.add('is-hidden');
      }
    });
  });

  backButtons.forEach((button) => {
    button.addEventListener('click', () => {
      setStep(currentStep - 1);
      if (bookingResult) {
        bookingResult.classList.add('is-hidden');
      }
    });
  });

  if (bookingForm) {
    bookingForm.addEventListener('submit', (event) => {
      event.preventDefault();

      if (!selectedDateKey || !selectedTime) {
        showBookingMessage('날짜와 시간을 모두 선택해주세요.', true);
        return;
      }

      if (!bookingType?.value || !bookingName?.value.trim() || !bookingEmail?.value.trim()) {
        showBookingMessage('상담 유형, 이름, 이메일을 모두 입력해주세요.', true);
        return;
      }

      const summary =
        `예약 요청이 접수되었습니다. ` +
        `${formatDateLabel(selectedDateKey)} ${selectedTime}, ` +
        `${bookingType.value} / ${bookingName.value.trim()} (${bookingEmail.value.trim()})`;

      showBookingMessage(summary, false);
      bookingForm.reset();
      selectedTime = '';
      timeSlots.forEach((slot) => slot.classList.remove('is-selected'));
      setStep(1);
      syncDatePreview();
    });
  }

  selectedDateKey = makeDateKey(today);
  syncDatePreview();
  setStep(1);
  renderCalendar();
}
