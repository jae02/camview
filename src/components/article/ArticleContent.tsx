'use client';

import { useMemo } from 'react';

// Very basic and simplified markdown parser for client side rendering
function parseMarkdown(md: string): string {
  if (!md) return '';
  
  let html = md;
  
  // Replace HTML tags to prevent XSS
  html = html.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  
  // Code blocks
  html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
  
  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');
  
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  
  // Headings
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  
  // Bold
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  
  // Italic
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  
  // Blockquotes
  html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');
  
  // Horizontal rules
  html = html.replace(/^---$/gim, '<hr />');
  
  // Paragraphs and Lists (Very naive implementation)
  const lines = html.split('\n');
  let inList = false;
  let inOList = false;
  
  const parsedLines = lines.map(line => {
    // Skip already wrapped elements
    if (line.match(/^<(h|p|pre|blockquote)/) || line.trim() === '') {
      return line;
    }
    
    // Unordered List
    if (line.match(/^- (.*$)/)) {
      const content = line.replace(/^- (.*$)/, '$1');
      let res = '';
      if (!inList) {
        inList = true;
        res += '<ul>';
      }
      res += `<li>${content}</li>`;
      return res;
    } else if (inList) {
      inList = false;
      line = '</ul>' + line;
    }
    
    // Ordered List
    if (line.match(/^\d+\. (.*$)/)) {
      const content = line.replace(/^\d+\. (.*$)/, '$1');
      let res = '';
      if (!inOList) {
        inOList = true;
        res += '<ol>';
      }
      res += `<li>${content}</li>`;
      return res;
    } else if (inOList) {
      inOList = false;
      line = '</ol>' + line;
    }
    
    // Paragraph
    if (!line.match(/^</)) {
      return `<p>${line}</p>`;
    }
    
    return line;
  });
  
  html = parsedLines.join('\n');
  
  // Clean up empty paragraphs
  html = html.replace(/<p><\/p>/g, '');
  
  return html;
}

export default function ArticleContent({ content }: { content: string }) {
  const htmlContent = useMemo(() => parseMarkdown(content), [content]);

  return (
    <div 
      className="article-content"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}
