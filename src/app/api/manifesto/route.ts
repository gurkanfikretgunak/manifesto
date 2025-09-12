import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const manifestoPath = path.join(process.cwd(), 'content', 'manifesto.md');
    const fileContents = fs.readFileSync(manifestoPath, 'utf8');
    
    // Parse frontmatter
    const { data, content } = matter(fileContents);
    
    // Convert markdown to HTML
    const processedContent = await remark()
      .use(html)
      .process(content);
    
    return NextResponse.json({
      frontmatter: data,
      content: processedContent.toString(),
    });
  } catch (error) {
    console.error('Error loading manifesto:', error);
    return NextResponse.json(
      { error: 'Failed to load manifesto content' },
      { status: 500 }
    );
  }
}
