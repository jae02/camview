'use client';

import { useEffect, useState } from 'react';

interface Heading {
  id: string;
  text: string;
  level: number;
}

export default function TableOfContents({ source }: { source: string }) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // Extract H2 and H3 headings from the markdown source
    const headingRegex = /^(#{2,3})\s+(.+)$/gm;
    const extractedHeadings: Heading[] = [];
    let match;

    while ((match = headingRegex.exec(source)) !== null) {
      const level = match[1].length;
      const text = match[2].trim();
      // Simple ID generation matching common MDX plugins (like remark-slug)
      const id = text.toLowerCase().replace(/[^a-z0-9가-힣]+/g, '-').replace(/(^-|-$)/g, '');
      extractedHeadings.push({ id, text, level });
    }

    setHeadings(extractedHeadings);
  }, [source]);

  useEffect(() => {
    // Optional: IntersectionObserver to highlight active heading based on scroll
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '0% 0% -80% 0%' }
    );

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) {
    return <p className="text-sm text-gray-500">목차가 없습니다.</p>;
  }

  return (
    <ul className="space-y-2 text-sm">
      {headings.map((heading, index) => (
        <li
          key={index}
          style={{ paddingLeft: `${(heading.level - 2) * 1}rem` }}
        >
          <a
            href={`#${heading.id}`}
            className={`block hover:text-blue-600 transition-colors ${
              activeId === heading.id
                ? 'text-blue-600 font-bold'
                : 'text-gray-600 dark:text-gray-400'
            }`}
            onClick={(e) => {
              e.preventDefault();
              const element = document.getElementById(heading.id);
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
                // We also need to push the state so the URL updates
                window.history.pushState(null, '', `#${heading.id}`);
                setActiveId(heading.id);
              }
            }}
          >
            {heading.text}
          </a>
        </li>
      ))}
    </ul>
  );
}
