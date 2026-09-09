"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import "@/styles/jk.css";
import { motion, useInView, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUpLeft,
  ChevronLeft,
  Clock3,
  Flame,
    MapPin,
  Menu,
  Minus,
  Plus,
  Sparkles,
  Star,
  Utensils,
  X,
  Zap,
} from "lucide-react";

type Product = {
  name: string;
  nameEn: string;
  description: string;
  price: string;
  currency?: string;
  tag: string;
  tone: "orange" | "red" | "gold" | "violet";
  image: string;
};

const assets = {
  hero: "/im/3.png",
  burger: "/im/2.png",
  wings: "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=900&q=80",
};

const products: Product[] = [
  {
    name: "ريزو ميكس",
    nameEn: "MAX REZO",
    description: "أرز، قطع دجاج وصوص خاص.",
    price: "7,500",
    currency: "د.ع",
    tag: "الأكثر طلبا",
    tone: "orange",
    image: "/im/2.png",
  },
  {
    name: "جكن برجر",
    nameEn: "CHICKEN BURGER",
    description: "قطعة دجاج، جبنة، خس، طماطم، بطاطا مقلية وبيبسي.",
    price: "6,000",
    currency: "د.ع",
    tag: "الكل تحبه",
    tone: "red",
    image: "/im/5.png",
  },
  {
    name: "سندويتش مطافي",
    nameEn: "MATAFI SANDWICH",
    description: "دجاج مقرمش، صوص من اختيارك، خس، قطع هالبينو، بطاطا مقلية وبيبسي.",
    price: "6,000",
    currency: "د.ع",
    tag: "حار جداً",
    tone: "gold",
    image: "/im/6.png",
  },
];

const navItems = [
  { label: "الأصناف", href: "#menu" },
  { label: "ليش جكن؟", href: "#why" },
  { label: "تجربتنا", href: "#story" },
];

function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const duration = 1500;
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(value * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, value]);

  return <span ref={ref}>{count.toLocaleString("ar-EG")}{suffix}</span>;
}

function TiltCard({ product, index }: { product: Product; index: number }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-160, 160], [8, -8]), { stiffness: 220, damping: 22 });
  const rotateY = useSpring(useTransform(x, [-160, 160], [-8, 8]), { stiffness: 220, damping: 22 });

  const handleMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    x.set(event.clientX - rect.left - rect.width / 2);
    y.set(event.clientY - rect.top - rect.height / 2);
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.article
      className={`product-card tone-${product.tone}`}
      initial={{ opacity: 0, y: 34, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.23, 1, 0.32, 1] }}
      style={{ rotateX, rotateY, transformPerspective: 1000 }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      <div className="product-card__shine" />
      <div className="product-card__topline">
        <span className="product-card__tag">{product.tag}</span>
        <span className="product-card__index">0{index + 1}</span>
      </div>
      <div className="product-card__image-wrap">
        <motion.img
          src={product.image}
          alt={product.name}
          className="product-card__image"
          whileHover={{ scale: 1.07, rotate: -2 }}
          transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
        />
      </div>
      <div className="product-card__content">
        <div>
          <p className="eyebrow">{product.nameEn}</p>
          <h3>{product.name}</h3>
          <p className="product-card__description">{product.description}</p>
        </div>
        <div className="product-card__bottom">
          <span className="price"><strong>{product.price}</strong><small> {product.currency || "د.ع"}</small></span>
          <Link href="/menu" className="round-arrow" aria-label={`اطلب ${product.name}`}>
            <Plus size={18} strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

function ParticleField() {
  const particles = useMemo(() => Array.from({ length: 18 }, (_, index) => ({
    left: `${(index * 37) % 100}%`,
    top: `${(index * 61) % 100}%`,
    size: 2 + (index % 3),
    delay: (index % 7) * 0.45,
    duration: 5 + (index % 5),
  })), []);

  return (
    <div className="particle-field" aria-hidden="true">
      {particles.map((particle, index) => (
        <motion.span
          key={index}
          className="particle"
          style={{ left: particle.left, top: particle.top, width: particle.size, height: particle.size }}
          animate={{ y: [0, -18, 0], x: [0, index % 2 ? 8 : -8, 0], opacity: [0.18, 0.8, 0.18] }}
          transition={{ duration: particle.duration, delay: particle.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main dir="rtl" className="site-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="noise-overlay" />

      <header className="site-header">
        <a href="#top" className="brand-mark" aria-label="جكن اكسبريس - الصفحة الرئيسية">
          <span className="brand-mark__icon"><Flame size={16} fill="currentColor" /></span>
          <span>جكن <b>اكسبريس</b></span>
        </a>
        <nav className={`desktop-nav ${menuOpen ? "is-open" : ""}`}>
          {navItems.map((item) => <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>{item.label}</a>)}
        </nav>
        <div className="header-actions">
          <span className="open-status"><i /> مفتوح الآن</span>
          <Link className="header-order" href="/menu">اطلب الآن <ArrowLeft size={16} /></Link>
          <button className="menu-toggle" aria-label="فتح القائمة" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="hero__grid" />
        <div className="hero__content">
          <motion.div className="hero-kicker" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }}>
            <span className="kicker-line" /> <span>دجاج على كيفك — منذ ٢٠١٨</span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.25, ease: [0.23, 1, 0.32, 1] }}>
            جكن<br /><em>اكسبريس</em>
          </motion.h1>
          <motion.p className="hero__subtitle" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.45 }}>
            طعم يخليك تنطر الدور<span>،</span><br />
            وقرمشة تحجي بيها الجيران.
          </motion.p>
          <motion.div className="hero__actions" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }}>
            <Link href="/menu" className="primary-button">اطلب الآن <ArrowLeft size={19} /></Link>
            <a href="#story" className="ghost-button">ليش جكن؟ <ArrowUpLeft size={17} /></a>
          </motion.div>
          <motion.div className="hero__meta" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.9 }}>
            <span><Clock3 size={15} /> توصيل خلال ٣٥ دقيقة</span>
            <span className="meta-divider" />
            <span><MapPin size={15} /> الرياض — كل الأحياء</span>
          </motion.div>
        </div>

        <div className="hero__visual">
          <motion.div className="hero-orbit orbit-one" animate={{ rotate: 360 }} transition={{ duration: 32, repeat: Infinity, ease: "linear" }} />
          <motion.div className="hero-orbit orbit-two" animate={{ rotate: -360 }} transition={{ duration: 24, repeat: Infinity, ease: "linear" }} />
          <motion.div className="hero__image-glow" animate={{ scale: [0.96, 1.04, 0.96], opacity: [0.55, 0.8, 0.55] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} />
          <motion.img
            src={assets.hero}
            alt="دجاج جكن اكسبريس المقرمش"
            className="hero__image"
            initial={{ opacity: 0, scale: 0.88, y: 30, rotate: 4 }}
            animate={{ opacity: 1, scale: 1, y: [0, -12, 0], rotate: [4, 1, 4] }}
            transition={{ opacity: { duration: 1 }, scale: { duration: 1, ease: [0.23, 1, 0.32, 1] }, y: { duration: 5.2, repeat: Infinity, ease: "easeInOut" }, rotate: { duration: 5.2, repeat: Infinity, ease: "easeInOut" } }}
          />
          <div className="hero__floating-label label-top"><Sparkles size={14} /> قرمشة على أصولها</div>
          <div className="hero__floating-label label-bottom"><span className="mini-flame"><Flame size={15} fill="currentColor" /></span> حار، طازج، يومياً</div>
          <motion.div className="hero__shadow" animate={{ scaleX: [1, 0.82, 1], opacity: [0.35, 0.16, 0.35] }} transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }} />
        </div>
        <div className="hero__side-index">01 <span>/</span> 04</div>
        <a href="#menu" className="scroll-cue"><span>مرر للأسفل</span><ArrowDown size={18} /></a>
      </section>

      <section className="marquee-strip" aria-label="مميزات جكن اكسبريس">
        <div className="marquee-track">
          {["قرمشة حقيقية", "دجاج طازج يومياً", "صوصات سرّية", "سهرات ألذ", "قرمشة حقيقية", "دجاج طازج يومياً", "صوصات سرّية", "سهرات ألذ"].map((item, index) => (
            <span key={index}>{item} <i>✦</i></span>
          ))}
        </div>
      </section>

      <section className="menu-section section-pad" id="menu">
        <div className="section-heading">
          <div>
            <p className="eyebrow accent-eyebrow"><span /> اختياراتنا</p>
            <h2>الموضوع <em>يبدأ</em><br />من أول قضمة.</h2>
          </div>
          <div className="section-heading__side">
            <p>ما نكثرها عليك. اختر مزاجك، والباقي علينا.</p>
            <Link href="/menu" className="text-link">شوف كل الأصناف <ChevronLeft size={16} /></Link>
          </div>
        </div>
        <div className="products-grid">
          {products.map((product, index) => <TiltCard key={product.name} product={product} index={index} />)}
          <motion.div className="menu-note" initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.35 }}>
            <span className="menu-note__number">+١٢</span>
            <p>صنف ثاني ينتظرك<br />في الفرع.</p>
            <Link href="/menu" aria-label="استكشف المزيد"><ArrowUpLeft size={24} /></Link>
          </motion.div>
        </div>
      </section>

      <section className="spotlight section-pad" id="story">
        <ParticleField />
        <div className="spotlight__backdrop">01</div>
        <div className="spotlight__content">
          <motion.div className="spotlight__copy" initial={{ opacity: 0, filter: "blur(12px)", x: 40 }} whileInView={{ opacity: 1, filter: "blur(0px)", x: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.9 }}>
            <p className="eyebrow accent-eyebrow"><span /> الصنف رقم واحد</p>
            <h2>مو دجاج.<br /><em>هذا مزاج.</em></h2>
            <p className="spotlight__description">نختار قطع الدجاج بعناية، ننقعها بتتبيلة جكن الخاصة، ونقليها وقت الطلب. النتيجة؟ قرمشة تكسر الصمت.</p>
            <div className="spotlight__facts">
              <span><b>24</b><small>ساعة تتبيل</small></span>
              <span><b>100%</b><small>دجاج طازج</small></span>
              <span><b>0%</b><small>ملل</small></span>
            </div>
            <Link href="/menu" className="text-link light-link">جرّب الكرانشي <ArrowLeft size={16} /></Link>
          </motion.div>
          <motion.div className="spotlight__visual" initial={{ opacity: 0, scale: 0.86, rotate: 5 }} whileInView={{ opacity: 1, scale: 1, rotate: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}>
            <div className="spotlight__ring ring-one" />
            <div className="spotlight__ring ring-two" />
            <motion.img src={assets.burger} alt="جكن برجر المميز" animate={{ y: [0, -14, 0], rotate: [-3, 1, -3] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} />
            <span className="rotating-stamp">JKN EXPRESS · MADE FOR LATE NIGHTS · </span>
          </motion.div>
        </div>
      </section>

      <section className="stats-section section-pad" id="why">
        <div className="section-heading stats-heading">
          <div>
            <p className="eyebrow accent-eyebrow"><span /> أرقام تتكلم</p>
            <h2>الحب من أول<br /><em>قرمشة.</em></h2>
          </div>
          <p className="section-intro">كل رقم هنا وراه ليلة حلوة، طلب متكرر، وعميل صار من أهل البيت.</p>
        </div>
        <div className="stats-grid">
          <div className="stat-item"><div className="stat-icon"><Star size={21} fill="currentColor" /></div><strong><CountUp value={4.9} suffix="" /></strong><span>تقييم عملائنا</span></div>
          <div className="stat-item"><div className="stat-icon"><Utensils size={21} /></div><strong><CountUp value={180} suffix="K" /></strong><span>وجبة انباعت</span></div>
          <div className="stat-item"><div className="stat-icon"><Flame size={21} fill="currentColor" /></div><strong><CountUp value={7} suffix="" /></strong><span>سنوات من الشغف</span></div>
          <div className="stat-item"><div className="stat-icon"><Zap size={21} fill="currentColor" /></div><strong><CountUp value={35} suffix="د" /></strong><span>متوسط التوصيل</span></div>
        </div>
      </section>

      <section className="final-cta section-pad" id="order">
        <div className="cta-grid" />
        <motion.div className="cta-streak streak-one" animate={{ x: [0, 80, 0], opacity: [0, 0.5, 0] }} transition={{ duration: 5, repeat: Infinity, delay: 1 }} />
        <motion.div className="cta-streak streak-two" animate={{ x: [0, -120, 0], opacity: [0, 0.4, 0] }} transition={{ duration: 6, repeat: Infinity, delay: 2 }} />
        <div className="cta-content">
          <h2>جاهز تكسر<br /><em>الروتين؟</em></h2>
          <p>اطلبها حارة، توصل لبابك، وخلك أنت الحكم.</p>
          <Link href="/menu" className="whatsapp-button" style={{ background: "linear-gradient(135deg, #ff6a22, #f02924)", color: "#fff", marginBottom: "0.75rem" }}>
            <span className="whatsapp-button__icon">✦</span> المنيو <ArrowLeft size={19} />
          </Link>
          <small className="cta-microcopy">متاح يومياً من ١١ صباحاً حتى ٣ فجراً</small>
        </div>
        <div className="cta-side-note"><span>JKN</span><span>EXPRESS</span></div>
      </section>

      <footer className="site-footer">
        <div className="footer-brand"><span className="brand-mark__icon"><Flame size={16} fill="currentColor" /></span><span>جكن <b>اكسبريس</b></span></div>
        <div className="footer-social">
          <a href="https://www.instagram.com/chicken_express_iraq/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
          </a>
          <a href="https://www.bing.com/maps/search?name=%D9%85%D8%B7%D8%B9%D9%85+%D8%AC%D9%83%D9%86+%D8%A7%D9%83%D8%B3%D8%A8%D8%B1%D9%8A%D8%B3&trfc=&mepi=0%7E%7EEmbedded%7ELargeMapLink&FORM=MPSRPL&style=r&ss=id.ypid%3AYNBA189C5F93AFD41&q=%D9%85%D8%B7%D8%B9%D9%85+%D8%AC%D9%83%D9%86+%D8%A7%D9%83%D8%B3%D8%A8%D8%B1%D9%8A%D8%B3&ppois=33.39543533325195_44.382293701171875_%D9%85%D8%B7%D8%B9%D9%85+%D8%AC%D9%83%D9%86+%D8%A7%D9%83%D8%B3%D8%A8%D8%B1%D9%8A%D8%B3&cp=33.395435%7E44.382294&lvl=15" target="_blank" rel="noopener noreferrer" aria-label="الموقع">
            <MapPin size={18} />
          </a>
        </div>
        <span className="footer-copy">© ٢٠٢٦ جكن اكسبريس</span>
      </footer>
    </main>
  );
}
