import Link from "next/link";
import { ArrowRight, CircleUserRound, Menu, Search } from "lucide-react";
import CartLink from "./cart-link";

export default function SiteHeader() {
  return (
    <>
      <div className="announcement">
        <span>Free U.S. shipping on bag orders over $100</span>
        <Link href="/shop?category=cornhole-bags">Shop ACL-style bags <ArrowRight size={14} /></Link>
      </div>
      <header className="site-header">
        <div className="header-row">
          <Link className="brand" href="/" aria-label="YG Cornhole home">
            <span className="brand-mark" aria-hidden="true"><b>Y</b><b>G</b><b>B</b><b>C</b></span>
            <span><strong>YG</strong> CORNHOLE</span>
          </Link>

          <nav className="primary-nav" aria-label="Primary navigation">
            <Link href="/shop?category=cornhole-bags">Cornhole bags</Link>
            <Link href="/shop?category=custom-boards">Custom boards</Link>
            <Link href="/shop?category=t-shirts">Apparel</Link>
            <Link href="/about">About YG</Link>
            <Link href="/contact">Contact</Link>
          </nav>

          <div className="header-tools">
            <Link className="header-icon-link" href="/shop" aria-label="Search products"><Search size={20} /></Link>
            <Link className="header-icon-link" href="/shop" aria-label="Account"><CircleUserRound size={20} /></Link>
            <CartLink />
            <details className="mobile-menu">
              <summary aria-label="Open menu"><Menu size={22} /></summary>
              <nav aria-label="Mobile navigation">
                <Link href="/shop">Shop all</Link>
                <Link href="/shop?category=cornhole-bags">Cornhole bags</Link>
                <Link href="/shop?category=t-shirts">T-shirts</Link>
                <Link href="/shop?category=performance-jerseys">Jerseys</Link>
                <Link href="/shop?category=custom-boards">Custom boards</Link>
                <Link href="/about">About YG</Link>
                <Link href="/contact">Contact</Link>
              </nav>
            </details>
          </div>
        </div>
      </header>
    </>
  );
}
