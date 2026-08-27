import Image from "next/image";
import {
  ArrowDown,
  ArrowUpRight,
  BadgeCheck,
  ChevronRight,
  Menu,
  PackageCheck,
  ShieldCheck,
  Shirt,
  ShoppingBag,
  Sparkles,
  Target,
  Truck,
} from "lucide-react";
import HomeMotion from "./ui/home-motion";

const collections = [
  {
    type: "ACL-approved bags",
    title: "Built for your release.",
    copy: "Controlled, fast, or right down the middle. Find a bag that matches the way you throw.",
    image: "/images/bags-ice-blue.jpeg",
    className: "collection-card collection-card--bags",
    href: "#featured",
  },
  {
    type: "Custom boards",
    title: "Your setup. Fully dialed.",
    copy: "Tournament-ready builds finished with graphics that are unmistakably yours.",
    image: "/images/custom-boards.jpeg",
    className: "collection-card collection-card--boards",
    href: "#boards",
  },
];

const bagSeries = [
  { name: "Menace X", speed: "3 / 8", note: "Maximum control" },
  { name: "Hooligan", speed: "5 / 6", note: "Balanced play" },
  { name: "Phenom X", speed: "3 / 9", note: "Switch gears" },
];

export default function Home() {
  return (
    <main id="top">
      <HomeMotion />

      <div className="utility-bar">
        <p>Free U.S. shipping on bag orders over $100</p>
        <a href="#why-yg">Built by players, for players</a>
      </div>

      <header className="site-header">
        <a className="brand" href="#top" aria-label="YG Cornhole home">
          <span className="brand-mark" aria-hidden="true">
            <b>Y</b><b>G</b><b>B</b><b>C</b>
          </span>
          <span className="brand-name">YG CORNHOLE</span>
        </a>
        <nav className="desktop-nav" aria-label="Primary navigation">
          <a href="#shop">Bags</a>
          <a href="#boards">Boards</a>
          <a href="#apparel">Apparel</a>
          <a href="#why-yg">Our story</a>
        </nav>
        <div className="header-actions">
          <a className="shop-link" href="#shop">Shop all <ArrowUpRight size={16} /></a>
          <details className="mobile-menu">
            <summary className="icon-button" aria-label="Open navigation menu"><Menu size={21} /></summary>
            <nav className="mobile-nav" aria-label="Mobile navigation">
              <a href="#shop">Bags</a><a href="#boards">Boards</a><a href="#apparel">Apparel</a><a href="#why-yg">Our story</a>
            </nav>
          </details>
          <button className="icon-button" aria-label="Open shopping bag">
            <ShoppingBag size={20} />
            <span className="cart-count">0</span>
          </button>
        </div>
      </header>

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <div className="eyebrow hero-eyebrow"><span /> ACL approved · made in the USA</div>
          <h1 id="hero-title">
            <span className="hero-line">BAG</span>
            <span className="hero-line hero-line--outline">THE WIN.</span>
          </h1>
          <p className="hero-lede">
            Competition-grade bags, custom boards, and gear engineered for the throwers who play to leave a mark.
          </p>
          <div className="hero-actions">
            <a className="button button--primary" href="#shop">Shop bags <ArrowUpRight size={17} /></a>
            <a className="text-link" href="#throw-guide">Find your speed <ArrowDown size={16} /></a>
          </div>
        </div>

        <div className="hero-visual" aria-label="YG Cornhole ice blue competition bags">
          <div className="hero-ring" aria-hidden="true" />
          <div className="hero-image-wrap">
            <Image
              className="hero-product"
              src="/images/bags-ice-blue.jpeg"
              alt="A set of light blue and grey YG Cornhole competition bags"
              width={934}
              height={1245}
              priority
              sizes="(max-width: 760px) 92vw, 52vw"
            />
          </div>
          <div className="hero-product-tag">
            <span>Featured set</span>
            <strong>Hellion X</strong>
            <span>Speed 4 / 8</span>
          </div>
          <Image
            className="acl-badge"
            src="/images/acl-comp-2027.jpeg"
            alt="ACL Comp approved for 2027"
            width={300}
            height={139}
          />
        </div>

        <div className="hero-proof" aria-label="Brand highlights">
          <div><strong>06</strong><span>Years in the game</span></div>
          <div><strong>ACL</strong><span>Approved equipment</span></div>
          <div><strong>USA</strong><span>Made with intent</span></div>
        </div>
      </section>

      <div className="ticker" aria-label="Product qualities">
        <div className="ticker-track">
          <span>LOCK IN YOUR LINE</span><Target size={19} />
          <span>PRO-GRADE MATERIALS</span><Sparkles size={19} />
          <span>MADE TO BE THROWN</span><BadgeCheck size={19} />
          <span aria-hidden="true">LOCK IN YOUR LINE</span><Target size={19} aria-hidden="true" />
          <span aria-hidden="true">PRO-GRADE MATERIALS</span><Sparkles size={19} aria-hidden="true" />
          <span aria-hidden="true">MADE TO BE THROWN</span><BadgeCheck size={19} aria-hidden="true" />
        </div>
      </div>

      <section className="shop-section section-shell" id="shop" aria-labelledby="shop-title">
        <div className="section-heading reveal-up">
          <div>
            <p className="eyebrow"><span /> Pick your equipment</p>
            <h2 id="shop-title">Every throw starts here.</h2>
          </div>
          <a className="text-link" href="#featured">Explore all gear <ArrowUpRight size={16} /></a>
        </div>

        <div className="collection-grid">
          {collections.map((item) => (
            <a className={`${item.className} reveal-up`} href={item.href} key={item.title}>
              <Image src={item.image} alt="" fill sizes="(max-width: 820px) 100vw, 50vw" />
              <div className="collection-scrim" />
              <div className="collection-content">
                <span>{item.type}</span>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
                <b>Shop collection <ArrowUpRight size={16} /></b>
              </div>
            </a>
          ))}

          <a className="collection-card collection-card--apparel reveal-up" href="#apparel" id="apparel">
            <div className="apparel-pattern" aria-hidden="true" />
            <Shirt className="apparel-icon" aria-hidden="true" strokeWidth={1.2} />
            <div className="collection-content collection-content--dark">
              <span>Apparel</span>
              <h3>Wear the line.</h3>
              <p>Easy-wearing essentials for league night, travel days, and everywhere in between.</p>
              <b>Shop apparel <ArrowUpRight size={16} /></b>
            </div>
          </a>
        </div>
      </section>

      <section className="throw-guide" id="throw-guide" aria-labelledby="guide-title">
        <div className="guide-stage">
          <div className="guide-copy">
            <p className="eyebrow eyebrow--light"><span /> Find your feel</p>
            <h2 id="guide-title">One lane.<br />Your speed.</h2>
            <p>Scroll the runway to see how the right bag changes your game—from a controlled block to a fast, clean finish.</p>
          </div>
          <div className="throw-lane" aria-hidden="true">
            <div className="lane-lines"><i /><i /><i /></div>
            <div className="lane-hole" />
            <div className="flying-bag">
              <Image src="/images/bags-ice-blue.jpeg" alt="" width={934} height={1245} sizes="180px" />
            </div>
            <span className="lane-label lane-label--slow">Control<br /><b>01</b></span>
            <span className="lane-label lane-label--fast">Fast<br /><b>10</b></span>
          </div>
          <div className="guide-step">
            <span>Throw profile</span>
            <strong className="guide-word">CONTROL</strong>
          </div>
        </div>
      </section>

      <section className="featured-section section-shell" id="featured" aria-labelledby="featured-title">
        <div className="section-heading reveal-up">
          <div>
            <p className="eyebrow"><span /> The starting lineup</p>
            <h2 id="featured-title">Made for match point.</h2>
          </div>
          <p className="section-intro">Three distinct speed profiles. The same obsessive build quality.</p>
        </div>
        <div className="bag-grid">
          {bagSeries.map((bag, index) => (
            <article className="bag-card reveal-up" key={bag.name}>
              <div className={`bag-image bag-image--${index + 1}`}>
                <Image src="/images/bags-ice-blue.jpeg" alt={`${bag.name} cornhole bag set`} fill sizes="(max-width: 760px) 90vw, 30vw" />
                {index === 1 && <span className="bestseller">Player favorite</span>}
              </div>
              <div className="bag-card-copy">
                <div><span>{bag.note}</span><h3>{bag.name}</h3></div>
                <p>Speed <strong>{bag.speed}</strong></p>
              </div>
              <a href="#shop">View bag <ChevronRight size={17} /></a>
            </article>
          ))}
        </div>
      </section>

      <section className="board-story" id="boards" aria-labelledby="boards-title">
        <div className="board-image reveal-clip">
          <Image src="/images/custom-boards.jpeg" alt="A custom red, white, and blue YG Cornhole board set" fill sizes="(max-width: 900px) 100vw, 58vw" />
        </div>
        <div className="board-copy reveal-up">
          <p className="eyebrow"><span /> Built from the ground up</p>
          <h2 id="boards-title">Boards that hold the room.</h2>
          <p>From the frame to the final graphic, every custom set is built for true play and finished for a double take.</p>
          <ul>
            <li><ShieldCheck size={20} /> Regulation sizing and play</li>
            <li><Sparkles size={20} /> Custom artwork and finish</li>
            <li><PackageCheck size={20} /> Built, checked, and packed by hand</li>
          </ul>
          <a className="button button--dark" href="#contact">Start a custom set <ArrowUpRight size={17} /></a>
        </div>
      </section>

      <section className="why-section section-shell" id="why-yg" aria-labelledby="why-title">
        <div className="why-heading reveal-up">
          <p className="eyebrow"><span /> Why YG</p>
          <h2 id="why-title">We know the difference one throw makes.</h2>
        </div>
        <div className="why-grid">
          <article className="reveal-up"><span>01</span><BadgeCheck /><h3>Competition ready</h3><p>ACL-approved builds that meet the moment from league night to the big bracket.</p></article>
          <article className="reveal-up"><span>02</span><Target /><h3>Player tuned</h3><p>Clear speed profiles help you build a rotation around your actual throwing style.</p></article>
          <article className="reveal-up"><span>03</span><Truck /><h3>Small-shop care</h3><p>Six years of hands-on craft, responsive support, and gear we are proud to send out.</p></article>
        </div>
      </section>

      <section className="closing-cta" id="contact">
        <div className="closing-art" aria-hidden="true">
          <Image src="/images/yg-metallic-banner.jpeg" alt="" fill sizes="100vw" />
        </div>
        <div className="closing-content reveal-up">
          <p className="eyebrow eyebrow--light"><span /> Ready when you are</p>
          <h2>Make your next throw count.</h2>
          <div>
            <a className="button button--light" href="#shop">Shop the lineup <ArrowUpRight size={17} /></a>
            <a className="text-link text-link--light" href="mailto:hello@ygcornhole.com">Talk custom boards</a>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="footer-main">
          <div>
            <a className="brand brand--footer" href="#top" aria-label="YG Cornhole home">
              <span className="brand-mark" aria-hidden="true"><b>Y</b><b>G</b><b>B</b><b>C</b></span>
              <span className="brand-name">YG CORNHOLE</span>
            </a>
            <p>Competition gear with a point of view.</p>
          </div>
          <div className="footer-links"><h3>Shop</h3><a href="#shop">Bags</a><a href="#boards">Boards</a><a href="#apparel">Apparel</a></div>
          <div className="footer-links"><h3>Company</h3><a href="#why-yg">Our story</a><a href="mailto:hello@ygcornhole.com">Contact</a><a href="#top">FAQ</a></div>
          <form className="newsletter">
            <label htmlFor="email">Fresh drops. No filler.</label>
            <div><input id="email" type="email" placeholder="Email address" autoComplete="email" /><button type="submit" aria-label="Join the email list"><ArrowUpRight size={18} /></button></div>
          </form>
        </div>
        <div className="footer-bottom"><span>© 2026 YG Cornhole</span><span>Made for the cornhole community.</span></div>
      </footer>
    </main>
  );
}
