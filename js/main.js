(function(){
  var root=document.documentElement;
  var unhide=function(){root.classList.remove('js-anim')};
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* header: solid on scroll, hide on scroll down */
  var hdr=document.querySelector('.hdr'),lastY=0,mbar=document.querySelector('.mbar');
  function onScroll(){
    var y=window.scrollY;
    if(hdr){
      hdr.classList.toggle('is-solid',y>20);
      if(!document.body.classList.contains('menu-open')) hdr.classList.toggle('is-hidden',y>lastY&&y>420);
    }
    if(mbar) mbar.classList.toggle('on',y>window.innerHeight*.6);
    lastY=y;
  }
  window.addEventListener('scroll',onScroll,{passive:true});onScroll();

  /* mobile menu */
  var burger=document.querySelector('.burger');
  if(burger){
    burger.addEventListener('click',function(){
      var open=document.body.classList.toggle('menu-open');
      burger.setAttribute('aria-expanded',open);
      document.querySelector('.mnav').setAttribute('aria-hidden',!open);
      if(open) hdr.classList.remove('is-hidden');
    });
    document.querySelectorAll('.mnav a').forEach(function(a){a.addEventListener('click',function(){document.body.classList.remove('menu-open');burger.setAttribute('aria-expanded','false')})});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&document.body.classList.contains('menu-open')) burger.click()});
  }

  /* reveal on scroll */
  var rvs=document.querySelectorAll('.rv');
  if('IntersectionObserver' in window&&!reduce){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{rootMargin:'0px 0px -8% 0px',threshold:.08});
    rvs.forEach(function(el){io.observe(el)});
  } else rvs.forEach(function(el){el.classList.add('in')});

  /* drag-to-scroll strips (mouse); touch uses native swipe */
  document.querySelectorAll('.strip').forEach(function(s){
    var down=false,sx=0,sl=0,moved=0;
    s.addEventListener('pointerdown',function(e){if(e.pointerType!=='mouse')return;down=true;moved=0;sx=e.clientX;sl=s.scrollLeft;});
    window.addEventListener('pointermove',function(e){if(!down)return;var dx=e.clientX-sx;moved=Math.max(moved,Math.abs(dx));if(moved>4){s.classList.add('dragging');s.scrollLeft=sl-dx;}});
    window.addEventListener('pointerup',function(){if(!down)return;down=false;setTimeout(function(){s.classList.remove('dragging')},0)});
    s.addEventListener('dragstart',function(e){e.preventDefault()});
    var nav=document.querySelector('[data-strip="'+s.id+'"]');
    if(nav){
      var step=function(d){var it=s.querySelector('li');var w=it?it.getBoundingClientRect().width+20:320;s.scrollBy({left:d*w,behavior:reduce?'auto':'smooth'})};
      nav.querySelector('.prev').addEventListener('click',function(){step(-1)});
      nav.querySelector('.next').addEventListener('click',function(){step(1)});
    }
  });

  /* service index hover preview (desktop) */
  var peek=document.querySelector('.svc-peek');
  if(peek&&window.matchMedia('(hover:hover) and (pointer:fine)').matches){
    var imgs=peek.querySelectorAll('img'),px=0,py=0,cx=0,cy=0,raf;
    var loop=function(){cx+=(px-cx)*.16;cy+=(py-cy)*.16;peek.style.left=cx+'px';peek.style.top=cy+'px';raf=requestAnimationFrame(loop)};
    document.querySelectorAll('.svc').forEach(function(li,i){
      li.addEventListener('mouseenter',function(e){px=cx=e.clientX+150;py=cy=e.clientY;imgs.forEach(function(im,j){im.classList.toggle('on',j===i)});peek.classList.add('on');cancelAnimationFrame(raf);loop()});
      li.addEventListener('mousemove',function(e){px=e.clientX+150;py=e.clientY});
      li.addEventListener('mouseleave',function(){peek.classList.remove('on');setTimeout(function(){cancelAnimationFrame(raf)},400)});
    });
  }

  /* gallery filter + lightbox */
  var chips=document.querySelectorAll('[data-filter]'),items=document.querySelectorAll('.gal__it');
  chips.forEach(function(c){c.addEventListener('click',function(){
    var f=c.getAttribute('data-filter');
    chips.forEach(function(x){x.setAttribute('aria-pressed',x===c)});
    items.forEach(function(it){it.classList.toggle('is-hidden',f!=='all'&&it.getAttribute('data-cat')!==f)});
  })});
  var lb=document.querySelector('.lb');
  if(lb){
    var lbImg=lb.querySelector('img'),cur=0,vis=[];
    var show=function(i){vis=[].filter.call(items,function(x){return !x.classList.contains('is-hidden')});cur=(i+vis.length)%vis.length;var im=vis[cur].querySelector('img');lbImg.src=im.getAttribute('data-full')||im.src;lbImg.alt=im.alt;};
    items.forEach(function(it){it.addEventListener('click',function(){show([].filter.call(items,function(x){return !x.classList.contains('is-hidden')}).indexOf(it));lb.classList.add('on');lb.setAttribute('aria-hidden','false');lb.querySelector('.lb__x').focus()});
      it.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();it.click()}})});
    var close=function(){lb.classList.remove('on');lb.setAttribute('aria-hidden','true')};
    lb.querySelector('.lb__x').addEventListener('click',close);
    lb.querySelector('.lb__p').addEventListener('click',function(){show(cur-1)});
    lb.querySelector('.lb__n').addEventListener('click',function(){show(cur+1)});
    lb.addEventListener('click',function(e){if(e.target===lb)close()});
    document.addEventListener('keydown',function(e){if(!lb.classList.contains('on'))return;if(e.key==='Escape')close();if(e.key==='ArrowLeft')show(cur-1);if(e.key==='ArrowRight')show(cur+1)});
  }

  /* year */
  document.querySelectorAll('[data-year]').forEach(function(el){el.textContent=new Date().getFullYear()});

  /* ---------- GSAP ---------- */
  if(!window.gsap){unhide();return;}
  if(window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  if(window.ScrollTrigger) ScrollTrigger.config({ignoreMobileResize:true});

  var mm=gsap.matchMedia();
  mm.add({all:'all',wide:'(min-width: 900px)',reduce:'(prefers-reduced-motion: reduce)'},function(ctx){
    var c=ctx.conditions;
    if(c.reduce){unhide();return;}

    /* home hero */
    if(document.querySelector('.hero')){
      gsap.set('.hero h1 .ln > span',{y:0,yPercent:125});
      gsap.set('.hero__lead,.hero__cta,.hero__note',{opacity:0,y:18});
      gsap.set('.hero__tag',{opacity:0,y:16});
      gsap.set('.hero__frame',{clipPath:'inset(100% 0% 0% 0% round 240px 240px 26px 26px)'});
      gsap.set('.hero .swash',{clipPath:'inset(0% 100% 0% 0%)'});
      unhide();
      gsap.timeline({defaults:{ease:'power3.out'}})
        .to('.hero__frame',{clipPath:'inset(0% 0% 0% 0% round 240px 240px 26px 26px)',duration:1.4,ease:'power4.inOut'},0)
        .to('.hero h1 .ln > span',{yPercent:0,duration:1.15,stagger:.11},.15)
        .to('.hero .swash',{clipPath:'inset(0% 0% 0% 0%)',duration:2.2,ease:'power2.inOut'},.35)
        .to('.hero__lead,.hero__cta,.hero__note',{opacity:1,y:0,duration:.9,stagger:.08},.7)
        .to('.hero__tag',{opacity:1,y:0,duration:.8},1.1)
        .set('.hero__frame,.hero .swash',{clearProps:'clipPath'});
      if(c.wide){
        gsap.to('.hero__frame img',{yPercent:8,scale:1.06,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
      }
    }
    /* inner page hero */
    if(document.querySelector('.phero')){
      gsap.set('.phero h1 .ln > span',{y:0,yPercent:125});
      gsap.set('.phero__lead',{opacity:0,y:16});
      gsap.set('.phero .swash',{clipPath:'inset(0% 100% 0% 0%)'});
      unhide();
      gsap.timeline({defaults:{ease:'power3.out'}})
        .to('.phero h1 .ln > span',{yPercent:0,duration:1.1,stagger:.1},.05)
        .to('.phero__lead',{opacity:1,y:0,duration:.9},.45)
        .to('.phero .swash',{clipPath:'inset(0% 0% 0% 0%)',duration:2,ease:'power2.inOut'},.3)
        .set('.phero .swash',{clearProps:'clipPath'});
    }
    unhide();

    /* brow geometry: lines draw with scroll */
    var geo=document.querySelector('.geo__art');
    if(geo&&window.ScrollTrigger){
      var lines=geo.querySelectorAll('.g-line');
      lines.forEach(function(l){var len=l.getTotalLength();gsap.set(l,{strokeDasharray:len,strokeDashoffset:len})});
      gsap.set(geo.querySelectorAll('.g-dot,.g-lab'),{opacity:0,scale:.4,transformOrigin:'50% 50%'});
      gsap.set(geo.querySelector('.g-brow'),{opacity:0,y:10});
      var tl=gsap.timeline({scrollTrigger:{trigger:geo,start:'top 78%',end:'center 42%',scrub:c.wide?0.8:false,toggleActions:'play none none none'}});
      if(!c.wide) tl.timeScale(1.8);
      tl.to(lines,{strokeDashoffset:0,duration:1,stagger:.35,ease:'none'})
        .to(geo.querySelectorAll('.g-dot,.g-lab'),{opacity:1,scale:1,duration:.3,stagger:.12,ease:'back.out(2)'},'-=.6')
        .to(geo.querySelector('.g-brow'),{opacity:1,y:0,duration:.6,ease:'power2.out'},'-=.3');
      gsap.utils.toArray('.geo__steps li').forEach(function(li,i){
        gsap.from(li,{opacity:0,x:24,duration:.8,ease:'power3.out',scrollTrigger:{trigger:li,start:'top 88%'}});
      });
    }

    /* soft parallax on studio pictures */
    if(c.wide&&window.ScrollTrigger){
      gsap.utils.toArray('[data-par]').forEach(function(el){
        gsap.fromTo(el,{yPercent:parseFloat(el.dataset.par)},{yPercent:-parseFloat(el.dataset.par),ease:'none',scrollTrigger:{trigger:el,start:'top bottom',end:'bottom top',scrub:true}});
      });
      var mark=document.querySelector('.book__mark');
      if(mark) gsap.fromTo(mark,{rotate:-8,y:40},{rotate:4,y:-30,ease:'none',scrollTrigger:{trigger:'.book',start:'top bottom',end:'bottom top',scrub:true}});
    }
  });
  setTimeout(unhide,3000);
})();
