import Btn from '@/components/atoms/btn';
import Markdown from '@/components/atoms/markdown';
import Spinner from '@/components/atoms/spinner';
import DeleteAlert from '@/components/molecules/delete-alert';
import FetchError from '@/components/molecules/fetch-error';
import { Badge } from '@/components/ui/badge';
import { useMutation, useQuery } from '@/hooks/useFetch';
import { formatBlogDate } from '@/utils/blog';
import { Link, useNavigate } from '@tanstack/react-router';
import React from 'react';
import { toast } from 'sonner';

export interface IBlogPostProps {
  postId: string;
  admin?: boolean;
}

const BlogPost: React.FC<IBlogPostProps> = ({ postId, admin = false }) => {
  const navigate = useNavigate();
  const { data, error } = useQuery('get', '/v1/blog/{postID}', {
    params: { path: { postID: postId } }
  });
  const { mutate: deletePost } = useMutation('delete', '/v1/blog/{postID}');

  const handleDelete = () => {
    deletePost(
      { params: { path: { postID: postId } } },
      {
        onSuccess() {
          toast.success('Post deleted successfully');
          navigate({ to: '/admin/blog' });
        },
        onError() {
          toast.error('Failed to delete post');
        }
      }
    );
  };

  const post = data?.post;
  return (
    <FetchError isError={!!error}>
      {post ? (
        <article className="mx-auto max-w-3xl space-y-6">
          {post.coverImageUrl && (
            <img
              src={post.coverImageUrl}
              alt=""
              className="w-full max-h-96 rounded-xl object-cover"
            />
          )}
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-4xl font-bold">{post.title}</h1>
              {admin && (
                <div className="flex items-center gap-2 shrink-0">
                  <Link to="/admin/blog/$postId/edit" params={{ postId }}>
                    <Btn>Edit</Btn>
                  </Link>
                  <DeleteAlert onDelete={handleDelete}>
                    <Btn variant="destructive">Delete</Btn>
                  </DeleteAlert>
                </div>
              )}
            </div>
            <p className="flex items-center gap-2 text-muted-foreground">
              {!post.published && <Badge variant="secondary">Draft</Badge>}
              <span>
                {post.author ? `${post.author.name} · ` : ''}
                {formatBlogDate(post.publishedAt ?? post.createdAt)}
              </span>
            </p>
          </div>
          <Markdown>{post.content}</Markdown>
        </article>
      ) : (
        !error && <Spinner />
      )}
    </FetchError>
  );
};

export { BlogPost };
