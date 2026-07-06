"use client";

import Link from "next/link";
import { Camera, Globe, MessageCircle, Rss, Mail } from "lucide-react";

/**
 * Premium site footer with:
 * - Multi-column link layout
 * - Brand section with tagline
 * - Social media icons
 * - Subtle gradient border at top
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: "둘러보기",
      links: [
        { label: "카메라 도감", href: "/cameras" },
        { label: "모델 비교", href: "/compare" },
        { label: "개인정보처리방침", href: "/privacy" },
        { label: "이용약관", href: "/terms" },
      ],
    },
    {
      title: "브랜드별 탐색",
      links: [
        { label: "소니 (Sony)", href: "/cameras?brand=sony" },
        { label: "캐논 (Canon)", href: "/cameras?brand=canon" },
        { label: "니콘 (Nikon)", href: "/cameras?brand=nikon" },
        { label: "후지필름 (Fujifilm)", href: "/cameras?brand=fujifilm" },
      ],
    },
    {
      title: "카메라 유형",
      links: [
        { label: "풀프레임 미러리스", href: "/cameras?sensor=full_frame" },
        { label: "APS-C 미러리스", href: "/cameras?sensor=aps_c" },
        { label: "중형 포맷", href: "/cameras?sensor=medium_format" },
        { label: "컴팩트 / 액션캠", href: "/cameras?body=compact" },
      ],
    },
  ];

  const socialLinks = [
    { icon: Globe, href: "#", label: "웹사이트" },
    { icon: MessageCircle, href: "#", label: "커뮤니티" },
    { icon: Rss, href: "#", label: "RSS 피드" },
    { icon: Mail, href: "#", label: "이메일" },
  ];

  return (
    <footer
      id="site-footer"
      className="relative"
      style={{ background: "var(--bg-primary)", borderTop: "1px solid var(--border-subtle)" }}
    >
      {/* Gradient border at top */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "var(--gradient-brand)", opacity: 0.3 }}
      />

      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* ── Brand Column ──────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-5">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div
                className="flex items-center justify-center w-9 h-9 rounded-lg"
                style={{ background: "var(--gradient-brand)" }}
              >
                <Camera className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col -space-y-0.5">
                <span
                  className="text-sm font-bold tracking-tight"
                  style={{ color: "var(--text-primary)" }}
                >
                  카메라 백과
                </span>
                <span
                  className="text-[10px] font-medium tracking-widest uppercase"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  ENCYCLOPEDIA
                </span>
              </div>
            </Link>

            <p
              className="text-sm leading-relaxed max-w-sm"
              style={{ color: "var(--text-tertiary)" }}
            >
              역대 디지털 카메라의 상세 제원과 스펙을 총망라한
              온라인 백과사전입니다. 브랜드별, 센서별로 검색하고
              모델 간 사양을 비교해 보세요.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="flex items-center justify-center w-9 h-9 rounded-lg"
                  style={{
                    color: "var(--text-tertiary)",
                    border: "1px solid var(--border-subtle)",
                    transition: "var(--transition-fast)",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.color = "var(--text-primary)";
                    el.style.borderColor = "var(--border-accent)";
                    el.style.background = "var(--bg-tertiary)";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.color = "var(--text-tertiary)";
                    el.style.borderColor = "var(--border-subtle)";
                    el.style.background = "transparent";
                  }}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* ── Link Columns ──────────────────────────────────────────── */}
          {footerSections.map((section) => (
            <div key={section.title} className="space-y-4">
              <h4
                className="text-xs font-semibold tracking-widest uppercase"
                style={{ color: "var(--text-tertiary)" }}
              >
                {section.title}
              </h4>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm"
                      style={{
                        color: "var(--text-secondary)",
                        transition: "var(--transition-fast)",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.color =
                          "var(--text-accent)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.color =
                          "var(--text-secondary)";
                      }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Bottom Bar ───────────────────────────────────────────────── */}
        <div
          className="mt-14 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop: "1px solid var(--border-subtle)" }}
        >
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            © {currentYear} 카메라 백과사전. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {[
              { label: "사이트 소개", href: "/about" },
              { label: "개인정보처리방침", href: "/privacy" },
              { label: "이용약관", href: "/terms" },
            ].map(
              (item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-xs"
                  style={{
                    color: "var(--text-muted)",
                    transition: "var(--transition-fast)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.color =
                      "var(--text-secondary)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.color =
                      "var(--text-muted)";
                  }}
                >
                  {item.label}
                </Link>
              )
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
