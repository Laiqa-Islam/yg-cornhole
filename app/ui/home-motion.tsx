"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function HomeMotion() {
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) return;

    gsap.registerPlugin(ScrollTrigger);
    const lenis = new Lenis({ duration: 1.05, smoothWheel: true, wheelMultiplier: 0.9, touchMultiplier: 1.1 });

    lenis.on("scroll", ScrollTrigger.update);
    const update = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    const ctx = gsap.context(() => {
      gsap.timeline({ defaults: { ease: "power3.out" } })
        .from(".site-header", { y: -24, opacity: 0, duration: 0.7 })
        .from(".hero-eyebrow", { y: 16, opacity: 0, duration: 0.5 }, "-=0.25")
        .from(".hero-line", { yPercent: 105, rotate: 2, opacity: 0, duration: 0.85, stagger: 0.12 }, "-=0.25")
        .from(".hero-lede, .hero-actions", { y: 20, opacity: 0, duration: 0.6, stagger: 0.08 }, "-=0.45")
        .from(".hero-image-wrap", { scale: 0.88, y: 30, opacity: 0, duration: 1 }, "-=0.95")
        .from(".hero-product-tag, .acl-badge", { y: 15, opacity: 0, duration: 0.5, stagger: 0.08 }, "-=0.45");

      gsap.to(".hero-product", {
        yPercent: -7,
        ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.7 },
      });

      ScrollTrigger.batch(".reveal-up", {
        start: "top 88%",
        once: true,
        onEnter: (elements) => gsap.from(elements, { y: 38, opacity: 0, duration: 0.7, stagger: 0.08, ease: "power3.out", overwrite: true }),
      });

      gsap.from(".reveal-clip img", {
        scale: 1.13,
        duration: 1.25,
        ease: "power3.out",
        scrollTrigger: { trigger: ".reveal-clip", start: "top 82%", once: true },
      });

      const guideTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: ".throw-guide",
          start: "top top",
          end: "+=140%",
          scrub: 0.8,
          pin: ".guide-stage",
          anticipatePin: 1,
        },
      });

      guideTimeline
        .fromTo(".flying-bag", { xPercent: -30, yPercent: 50, rotate: -15, scale: 0.72 }, { xPercent: 355, yPercent: -85, rotate: 340, scale: 0.42, ease: "none" })
        .to(".guide-word", { opacity: 0, y: -12, duration: 0.08 }, 0.38)
        .set(".guide-word", { textContent: "BALANCE", y: 12 }, 0.46)
        .to(".guide-word", { opacity: 1, y: 0, duration: 0.08 }, 0.48)
        .to(".guide-word", { opacity: 0, y: -12, duration: 0.08 }, 0.72)
        .set(".guide-word", { textContent: "FINISH", y: 12 }, 0.8)
        .to(".guide-word", { opacity: 1, y: 0, duration: 0.08 }, 0.82)
        .to(".lane-hole", { scale: 1.08, boxShadow: "0 0 0 12px rgba(0, 201, 183, 0.14)", duration: 0.12 }, 0.86);

      ScrollTrigger.refresh();
    });

    return () => {
      ctx.revert();
      gsap.ticker.remove(update);
      lenis.destroy();
    };
  }, []);

  return null;
}
