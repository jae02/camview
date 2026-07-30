import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const articlesDir = path.join(process.cwd(), 'data/articles');

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q');
  if (!query || query.trim().length < 2) {
    return NextResponse.json({ results: [] });
  }

  if (!fs.existsSync(articlesDir)) {
    return NextResponse.json({ results: [] });
  }

  const searchTerm = query.toLowerCase();
  const files = fs.readdirSync(articlesDir).filter(f => f.endsWith('.mdx'));
  
  const results = files
    .map(file => {
      const filePath = path.join(articlesDir, file);
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const { data, content } = matter(fileContents);
      
      // Skip drafts
      if (data.draft === true) return null;
      
      const titleMatch = data.title?.toLowerCase().includes(searchTerm);
      const contentMatch = content.toLowerCase().includes(searchTerm);
      const excerptMatch = data.excerpt?.toLowerCase().includes(searchTerm);
      
      if (titleMatch || contentMatch || excerptMatch) {
        return {
          slug: file.replace(/\.mdx$/, ''),
          title: data.title,
          category: data.category || '카메라',
          excerpt: data.excerpt || '',
          createdAt: data.createdAt || new Date().toISOString(),
        };
      }
      return null;
    })
    .filter(Boolean)
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return NextResponse.json({ results });
}
