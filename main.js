// ===========================
//  أي آم سبيشل - main.js
// ===========================

/* ---------- Cursor & Touch Emojis ---------- */
const cursorEmoji = document.getElementById('cursorEmoji');
cursorEmoji.textContent = '🪄';
let rafCursor = null;
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  document.addEventListener('mousemove', e => {
    if (rafCursor) cancelAnimationFrame(rafCursor);
    rafCursor = requestAnimationFrame(() => {
      cursorEmoji.style.left = e.clientX + 'px';
      cursorEmoji.style.top  = e.clientY + 'px';
    });
  });
}

let currentEmojiIndex = 0;
document.addEventListener('pointerdown', e => {
  if (e.pointerType === 'mouse') return;
  const emojisToUse = ['🌸', '🦋'];
  let touchEl = document.createElement('div');
  touchEl.className = 'touch-emoji';
  touchEl.innerText = emojisToUse[currentEmojiIndex];
  touchEl.setAttribute('aria-hidden', 'true');
  currentEmojiIndex = (currentEmojiIndex + 1) % emojisToUse.length;
  touchEl.style.left = e.clientX + 'px';
  touchEl.style.top  = e.clientY + 'px';
  document.body.appendChild(touchEl);
  setTimeout(() => touchEl.remove(), 600);
});

/* ---------- Intersection Observer (fade-up) ---------- */
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      obs.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.fade-up').forEach(el => obs.observe(el));

/* ---------- Seasonal Rotator ---------- */
function initRotator() {
  const items = document.querySelectorAll('#seasonalRotator .rotator-item');
  if (items.length === 0) return;
  
  let currentIndex = 0;
  
  setInterval(() => {
    items[currentIndex].classList.remove('active');
    
    setTimeout(() => {
      currentIndex = (currentIndex + 1) % items.length;
      items[currentIndex].classList.add('active');
    }, 1000); 
  }, 3500); 
}

/* ---------- Branches Data ---------- */
const branchesData = [
  { name: "الرياض جاليري",  floor: "الدور الثاني",    lat: 24.7435, lon: 46.6575, img: "1.png", modalImg: "002.jpeg", alt: "ألعاب أطفال في الرياض جاليري" },
  { name: "ذا فيو مول",     floor: "بوابة 1",          lat: 24.7570, lon: 46.7323, img: "2.png", modalImg: "001.jpeg", alt: "حضانة أطفال ذا فيو مول الرياض" },
  { name: "مركز المملكة",   floor: "الطابق الارضي",   lat: 24.7114, lon: 46.6745, img: "3.png", modalImg: "005.webp", alt: "أنشطة أطفال مركز المملكة الرياض" },
  { name: "شرق بلازا",      floor: "الواجهة",          lat: 24.7533, lon: 46.8174, img: "4.png", modalImg: "006.png", alt: "مكان لعب أطفال شرق بلازا الرياض" },
  { name: "القصر مول",      floor: "الدور الثالث",     lat: 24.6030, lon: 46.6853, img: "5.png", modalImg: "003.jpeg", alt: "ألعاب أطفال القصر مول الرياض" },
  { name: "سلام مول",       floor: "الدور السفلي",     lat: 24.5828, lon: 46.6782, img: "6.png", modalImg: "004.webp", alt: "ضيافة أطفال سلام مول الرياض" }
];

/* ---------- Haversine Distance ---------- */
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

/* ---------- Render Main Branches ---------- */
function renderMainBranches() {
  const grid = document.getElementById('mainBranchesGrid');
  const frag = document.createDocumentFragment();
  branchesData.forEach(branch => {
    const card = document.createElement('a');
    card.className = 'branch-card';
    card.href = '#';
    card.setAttribute('role', 'listitem');
    card.style.backgroundImage = `url('${branch.img}')`;
    card.setAttribute('aria-label', branch.alt);
    card.innerHTML = `
      <div class="branch-overlay" aria-hidden="true"></div>
      <div class="branch-info">
        <div class="branch-name">${branch.name}</div>
        <span class="branch-dist" style="color:var(--yellow-light);">${branch.floor}</span>
      </div>`;
    frag.appendChild(card);
  });
  grid.appendChild(frag);
}

/* ---------- Render Modal Branches ---------- */
function renderModalBranches(hasLocation) {
  const grid = document.getElementById('modalBranchesGrid');
  const frag = document.createDocumentFragment();
  branchesData.forEach(branch => {
    let distText = hasLocation && branch.distance !== undefined
      ? `<span class="branch-dist">يبعد ${branch.distance.toFixed(1)} كم</span>`
      : `<span class="branch-dist" style="color:var(--yellow-light);">${branch.floor}</span>`;
    const card = document.createElement('a');
    card.className = 'branch-card';
    card.href = '#';
    card.style.backgroundImage = `url('${branch.modalImg}')`;
    card.setAttribute('aria-label', branch.alt);
    card.innerHTML = `
      <div class="modal-branch-overlay" aria-hidden="true"></div>
      <div class="branch-info">
        <div class="branch-name">${branch.name}</div>
        ${distText}
      </div>`;
    frag.appendChild(card);
  });
  grid.innerHTML = '';
  grid.appendChild(frag);
}

/* ---------- Directions / Location ---------- */
function handleDirectionsClick() {
  try {
    const cachedTime = localStorage.getItem('userLocTime');
    const now = new Date().getTime();
    if (cachedTime && (now - cachedTime < 15 * 60 * 1000)) {
      const userLat = parseFloat(localStorage.getItem('userLat'));
      const userLon = parseFloat(localStorage.getItem('userLon'));
      branchesData.forEach(b => { b.distance = getDistance(userLat, userLon, b.lat, b.lon); });
      branchesData.sort((a, b) => (a.distance||0) - (b.distance||0));
      renderModalBranches(true);
      openDirectionsModal();
      return;
    }
  } catch(e) {}

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude: uLat, longitude: uLon } = pos.coords;
        try {
          localStorage.setItem('userLocTime', Date.now());
          localStorage.setItem('userLat', uLat);
          localStorage.setItem('userLon', uLon);
        } catch(e) {}
        branchesData.forEach(b => { b.distance = getDistance(uLat, uLon, b.lat, b.lon); });
        branchesData.sort((a, b) => (a.distance||0) - (b.distance||0));
        renderModalBranches(true);
        openDirectionsModal();
      },
      () => { renderModalBranches(false); openDirectionsModal(); }
    );
  } else {
    renderModalBranches(false);
    openDirectionsModal();
  }
}

/* ---------- Modal Controls ---------- */
function openDirectionsModal()  { document.getElementById('directionsModal').classList.add('active'); document.body.style.overflow = 'hidden'; }
function closeDirectionsModal() { document.getElementById('directionsModal').classList.remove('active'); document.body.style.overflow = ''; }
function openBusinessModal()    { document.getElementById('businessModal').classList.add('active'); document.body.style.overflow = 'hidden'; }
function closeBusinessModal()   { document.getElementById('businessModal').classList.remove('active'); document.body.style.overflow = ''; }

window.onclick = e => {
  if (e.target.id === 'directionsModal') closeDirectionsModal();
  if (e.target.id === 'galleryModal')    closeGalleryModal();
  if (e.target.id === 'businessModal')   closeBusinessModal();
};

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeDirectionsModal();
    closeGalleryModal();
    closeBusinessModal();
  }
});

/* ---------- Gallery Modal ---------- */
function openGalleryModal() {
  const gal = document.getElementById('galleryModal');
  gal.style.display = 'flex';
  requestAnimationFrame(() => { gal.style.opacity = '1'; });
  document.body.style.overflow = 'hidden';
}

function closeGalleryModal() {
  const gal = document.getElementById('galleryModal');
  gal.style.opacity = '0';
  setTimeout(() => { gal.style.display = 'none'; document.body.style.overflow = ''; }, 300);
}

function nextGalleryImage(e) {
  e.stopPropagation();
  document.getElementById('galleryTrack').scrollBy({ left: window.innerWidth, behavior: 'smooth' });
}

function initGallery() {
  const track = document.getElementById('galleryTrack');
  const items = [
    { src: '001.jpeg', alt: 'أطفال يلعبون في منطقة الأنشطة الترفيهية بفرع ذا فيو مول' },
    { src: '002.jpeg', alt: 'فعاليات الأطفال الممتعة في فرع الرياض جاليري' },
    { src: '003.jpeg', alt: 'أنشطة ترفيهية وتعليمية للأطفال في القصر مول' },
    { src: '004.webp', alt: 'منطقة لعب الأطفال الآمنة في سلام مول' },
    { src: '005.webp', alt: 'ألعاب تنمية المهارات في فرع مركز المملكة' }
  ];
  
  const frag = document.createDocumentFragment();
  items.forEach((item) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'img-gallery-item';
    wrapper.onclick = closeGalleryModal;
    wrapper.innerHTML = `<img src="${item.src}" alt="${item.alt}" onclick="nextGalleryImage(event)" loading="lazy">`;
    frag.appendChild(wrapper);
  });
  track.appendChild(frag);
}

/* ---------- Testimonials ---------- */
function initTestimonials() {
  const track = document.getElementById('testimonialsTrack');
  const reviews = [
    { stars: 5, text: "افضل مكان اترك عيالي وانا مرتاحه موظفات عسولات ومتعاونات والمكان فيه فعاليات والعاب حركيه بصراحه ماجربت غيرهم ابداً والسعر ممتاز جداً", name: "سارا", role: "مركز المملكة", color: "#4285F4" },
    { stars: 5, text: "افضل مكان اخذ له اطفالي و انا مرتاحة و نظام الوقت مفتوح يلعب الطفل إلى أن يشبع و ميزتهم كل أركانهم العاب حركية لا يوجد العاب الكترونية نهائيًا ، و عند خروج الطفل يعطونه لعبة هدية 😍", name: "أثير", role: "مركز المملكة", color: "#EA4335" },
    { stars: 5, text: "الصدق مكان جمييييل ومررررتب دائماً اتعامل معهم وبنتي تطلع مبسوطه من عندهم الله يسعدهم ويوفقهم الموظفات ودودات ومتعاونات وعلى خلق عالي والصدق حريصات ..♥️", name: "هند القحطاني", role: "ذا فيو مول", color: "#34A853" },
    { stars: 5, text: "اول تجربة لطفلي ، كان مايحب الالعاب المغلقه ، بس عندهم حب المكان مره الموظفات عسولات وحنونات ومتعاونات جدا حدا بدون استثناء", name: "خيرية الشهري", role: "ذا فيو مول", color: "#c8a000" },
    { stars: 5, text: "المكان مره جميل للاطفال وامان لهم والموظفات ما شاءالله عليهم متعونات تحطين عيالك عندهم وتتسويقين وانتي مرتاحه وعندهم مواهب وشغلات تنمى الاطفال والله كفو عليهم كثر من خمس نجوم يستاهلون", name: "ندى حافظي", role: "الرياض جاليري", color: "#8A2BE2" },
    { stars: 5, text: "صراحه من امتع الامكان الي احط عيالي فيها واتسوق وحبيت حرصهم على تنظيف المكان والعاب الاطفال اتسوق وانا متطمنه عليهم مررا حبيت حرصهم على الأطفال والموظفات صراحه كلهم عسولات ومحترمات وعندهم فعاليات للاطفال صراحه عيالي انبسطوا فيه شكرا اي ام سبيشل 👌🏻", name: "لطيفة خالد", role: "الرياض جاليري", color: "#FF1493" },
    { stars: 5, text: "الله يعطيكم العافيه المكان جميل مرتب مناسب جدا للاطفال كل الشكر و الامتنان لطاقم الموظفات على حسن تعاملهم واستقبالهم ( اطفالنا بٱيدي آمينه ) دخلت طفلي أول تجربة كانت جدا جميلة و انبسط", name: "محمد مشعل", role: "القصر مول", color: "#20B2AA" },
    { stars: 5, text: "صراحه المكان جدا جدا جدا جميل والاهم تعامل الموظفات مع الأطفال حنونات ولطيفات بشكل والله إني أحط طفلي وانا مرتاحه كانهم بيتي الثاني", name: "تغريد الشمري", role: "القصر مول", color: "#FF4500" },
    { stars: 5, text: "اول تجربه ليا وان شاءالله تتكرر المكان رائع ونظيفه وجلسات محترمه، الموظفات محترمات في منتهي الرقي ، المكان فيه درجة امان عاليه جدا جدا اكتر مكان شوفته كدا صراحه", name: "اماني ابراهيم", role: "شرق بلازا", color: "#4285F4" },
    { stars: 5, text: "الموظفين محترمين ، امكانية ترك الاطفال والمغادرة ، اذا احتاجو الاطفال للاتصال بك الموظفين مايقصرون معهم", name: "نواف الزهراني", role: "شرق بلازا", color: "#EA4335" },
    { stars: 5, text: "التجربه روعه وانا اتعامل معهم بأطفالي من اكثر من ٣ سنوات تعامل راقي جدا واهتمام بالاطفال ونظافة المكان والطاقم الجميل المتدربين بطريقة التعامل مع الاطفال", name: "فهدر المرشد", role: "سلام مول", color: "#34A853" },
    { stars: 5, text: "مررره حنونين على الأطفال والألعاب الجماعية مره حلوه بنتي جلست ثلاث ساعات ورفضت تطلع وأول مره أخليها بلحالها و شكرا ً للموظفات العسولات", name: "حفصة", role: "سلام مول", color: "#c8a000" }
  ];
  
  const frag = document.createDocumentFragment();
  reviews.forEach(rev => {
    const card = document.createElement('div');
    card.className = 'gm-review-card fade-up';
    card.setAttribute('role', 'listitem');
    card.setAttribute('itemscope', '');
    card.setAttribute('itemtype', 'https://schema.org/Review');
    card.innerHTML = `
      <div class="gm-reviewer">
        <div class="gm-avatar" style="background:${rev.color}" aria-hidden="true">${rev.name.charAt(0)}</div>
        <div class="gm-name-col" itemprop="author" itemscope itemtype="https://schema.org/Person">
          <span class="gm-name" itemprop="name">${rev.name}</span>
          <span class="gm-meta">${rev.role} · مرشد محلي</span>
        </div>
      </div>
      <div class="gm-rating" itemprop="reviewRating" itemscope itemtype="https://schema.org/Rating" aria-label="تقييم ${rev.stars} من 5">
        <meta itemprop="ratingValue" content="${rev.stars}">
        <meta itemprop="bestRating" content="5">
        ${'<span aria-hidden="true">★</span>'.repeat(rev.stars)}
      </div>
      <div class="gm-text" itemprop="reviewBody">${rev.text}</div>
      <div itemprop="itemReviewed" itemscope itemtype="https://schema.org/LocalBusiness" style="display:none;">
        <span itemprop="name">أي آم سبيشل</span>
      </div>`;
    frag.appendChild(card);
  });
  track.appendChild(frag);
  track.querySelectorAll('.fade-up').forEach(el => obs.observe(el));
}

/* ---------- Background Emojis ---------- */
function initBackgroundEmojis() {
  const bgContainer = document.getElementById('bgShapes');
  let bgHtml = `<img src="SpeSvg.svg" alt="خلفية شعار مؤسسة أي آم سبيشل" aria-hidden="true" style="position:absolute;width:180px;opacity:0.4;filter:blur(28px);top:20%;left:10%;">`;
  bgContainer.innerHTML = bgHtml;
}

/* ---------- On Load ---------- */
window.addEventListener('load', () => {
  initBackgroundEmojis();
  renderMainBranches();
  initRotator();

  const idle = window.requestIdleCallback || (cb => setTimeout(cb, 100));
  idle(() => {
    initTestimonials();
    initGallery();
  });
});
