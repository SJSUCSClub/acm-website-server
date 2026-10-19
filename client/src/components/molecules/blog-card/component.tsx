import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/card';
import { Badge } from '@/components/ui/badge';
import { paths } from '@/types/schema.v1';
import { formatBlogDate } from '@/utils/blog';
import { Link } from '@tanstack/react-router';
import React from 'react';

type BlogPostSummary =
  paths['/v1/blog']['get']['responses']['200']['content']['application/json']['posts'][number];

export interface IBlogCardProps {
  post: BlogPostSummary;
  admin?: boolean;
}

const BlogCard: React.FC<IBlogCardProps> = ({ post, admin = false }) => {
  const date = formatBlogDate(post.publishedAt ?? post.createdAt);
  return (
    <Card className="overflow-hidden flex flex-col">
      {post.coverImageUrl && (
        <img src={post.coverImageUrl} alt="" loading="lazy" className="h-48 w-full object-cover" />
      )}
      <CardHeader>
        <Link
          to={admin ? '/admin/blog/$postId' : '/blog/$postId'}
          params={{ postId: post.id.toString() }}
        >
          <CardTitle>{post.title}</CardTitle>
        </Link>
        <CardDescription className="flex items-center gap-2">
          {admin && !post.published && <Badge variant="secondary">Draft</Badge>}
          <span>
            {post.author ? `${post.author.name} · ` : ''}
            {date}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>{post.excerpt}</CardContent>
    </Card>
  );
};

export { BlogCard };
