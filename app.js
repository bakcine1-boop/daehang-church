(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* hero video: 화면 폭에 맞는 파일 선택 */
  const hv = $('#heroVideo');
  if (hv) {
    if (reduce) { hv.remove(); }
    else {
      const small = innerWidth < 820 || (navigator.connection && navigator.connection.saveData);
      hv.src = small ? 'hero_m.mp4' : 'hero.mp4';
      hv.play().catch(() => {});
    }
  }

  /* nav */
  const nav = $('.nav'), hero = $('.hero');
  const onScroll = () => {
    nav.classList.toggle('solid', scrollY > (hero ? hero.offsetHeight - 80 : 10));
    $$('.band img').forEach(img => {
      const r = img.parentElement.getBoundingClientRect();
      if (r.bottom > 0 && r.top < innerHeight) img.style.transform = `translateY(${(r.top / innerHeight) * -40}px)`;
    });
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  $('.burger').addEventListener('click', () => document.body.classList.toggle('open'));
  $$('.drawer a').forEach(a => a.addEventListener('click', () => document.body.classList.remove('open')));

  /* active menu */
  const secs = $$('section[id]');
  const so = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) $$('.menu a').forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  secs.forEach(s => so.observe(s));

  /* reveal */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('shown'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  $$('.rv').forEach(el => io.observe(el));

  /* 고백: 스크롤에 따라 한 줄씩 밝히기 */
  const decl = $$('.decl li');
  const dio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) e.target.classList.add('lit'); }), { rootMargin: '-35% 0px -35% 0px' });
  decl.forEach(li => dio.observe(li));

  /* 선포 음성 */
  const au = $('#declAudio'), pb = $('#declPlay'), bar = $('#declBar');
  const ico = p => pb.innerHTML = p ? '<svg viewBox="0 0 24 24"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>' : '<svg viewBox="0 0 24 24"><path d="M7 4l13 8-13 8z"/></svg>';
  pb.addEventListener('click', () => { au.paused ? au.play() : au.pause(); });
  au.addEventListener('play', () => ico(true)); au.addEventListener('pause', () => ico(false));
  au.addEventListener('ended', () => { ico(false); bar.style.width = '0'; });
  au.addEventListener('timeupdate', () => {
    bar.style.width = (au.currentTime / au.duration * 100) + '%';
    const n = Math.min(decl.length, Math.floor(au.currentTime / au.duration * (decl.length + 0.4)));
    decl.forEach((li, i) => { if (i <= n) li.classList.add('lit'); });
  });

  /* rail */
  const rail = $('.rail');
  $$('.railnav button').forEach(b => b.addEventListener('click', () => rail.scrollBy({ left: (b.dataset.d === 'n' ? 1 : -1) * rail.clientWidth * 0.8, behavior: 'smooth' })));

  /* 모달 */
  const modal = $('#modal'), box = $('#modalBox');
  let lbList = [], lbIdx = 0;
  const close = () => { modal.classList.remove('on'); setTimeout(() => { box.innerHTML = ''; box.className = 'box'; }, 300); document.body.style.overflow = ''; };
  const openVid = (id, vertical) => {
    box.className = 'box' + (vertical ? ' v' : '');
    box.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen title="영상"></iframe>`;
    $$('.nv,.lbcap', modal).forEach(e => e.classList.add('hide'));
    modal.classList.add('on'); document.body.style.overflow = 'hidden';
  };
  const showLb = () => {
    const f = lbList[lbIdx], img = $('img', f);
    box.className = ''; box.innerHTML = `<img class="lbimg" src="${img.dataset.full || img.currentSrc || img.src}" alt="${img.alt}">`;
    const c = $('.lbcap', modal); c.textContent = img.alt; c.classList.remove('hide');
    $$('.nv', modal).forEach(e => e.classList.toggle('hide', lbList.length < 2));
  };
  $$('[data-yt]').forEach(el => el.addEventListener('click', () => openVid(el.dataset.yt, el.dataset.v === '1')));
  $$('.lb').forEach(f => f.addEventListener('click', () => {
    const grp = f.closest('[data-group]');
    lbList = grp ? $$('.lb', grp) : [f]; lbIdx = lbList.indexOf(f);
    showLb(); modal.classList.add('on'); document.body.style.overflow = 'hidden';
  }));
  $('.pv', modal).addEventListener('click', e => { e.stopPropagation(); lbIdx = (lbIdx - 1 + lbList.length) % lbList.length; showLb(); });
  $('.nx', modal).addEventListener('click', e => { e.stopPropagation(); lbIdx = (lbIdx + 1) % lbList.length; showLb(); });
  $('.x', modal).addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
  addEventListener('keydown', e => {
    if (!modal.classList.contains('on')) return;
    if (e.key === 'Escape') close();
    if (lbList.length > 1 && !$('iframe', modal)) {
      if (e.key === 'ArrowRight') $('.nx', modal).click();
      if (e.key === 'ArrowLeft') $('.pv', modal).click();
    }
  });

  /* 기념영상: 페이지 안에서 재생 */
  const film = $('#film');
  film.addEventListener('click', () => {
    if ($('iframe', film)) return;
    film.insertAdjacentHTML('beforeend', `<iframe src="https://www.youtube-nocookie.com/embed/${film.dataset.id}?autoplay=1&rel=0&playsinline=1" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen title="기념영상 선한 손"></iframe>`);
  });

  /* 아카이브 탭·필터 */
  $$('.tab').forEach(t => t.addEventListener('click', () => {
    $$('.tab').forEach(x => x.classList.toggle('on', x === t));
    $$('.pane').forEach(p => p.classList.toggle('hide', p.id !== t.dataset.pane));
  }));
  $$('.filters button').forEach(b => b.addEventListener('click', () => {
    $$('.filters button').forEach(x => x.classList.toggle('on', x === b));
    const c = b.dataset.f;
    $$('#paneChurch .vid').forEach(v => v.classList.toggle('hide', c !== 'all' && v.dataset.c !== c));
  }));
})();
