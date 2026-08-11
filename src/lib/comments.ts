import { getArticleById, updateArticle } from './articles';
import { Comment } from '../types';

// Simple hash for password
function simpleHash(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(16);
}

export async function addComment(
  articleId: string, 
  nickname: string, 
  passwordRaw: string, 
  content: string
): Promise<Comment | null> {
  const article = await getArticleById(articleId);
  if (!article) return null;

  const newComment: Comment = {
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    nickname,
    passwordHash: simpleHash(passwordRaw),
    content,
    createdAt: new Date().toISOString()
  };

  article.comments.push(newComment);
  
  // We can just update the article with the new comments array
  await updateArticle(articleId, { comments: article.comments });
  
  return newComment;
}

export async function deleteComment(
  articleId: string, 
  commentId: string, 
  passwordRaw: string
): Promise<boolean> {
  const article = await getArticleById(articleId);
  if (!article) return false;

  const commentIndex = article.comments.findIndex(c => c.id === commentId);
  if (commentIndex === -1) return false;

  const comment = article.comments[commentIndex];
  if (comment.passwordHash !== simpleHash(passwordRaw)) {
    return false; // Password mismatch
  }

  article.comments.splice(commentIndex, 1);
  await updateArticle(articleId, { comments: article.comments });
  
  return true;
}
