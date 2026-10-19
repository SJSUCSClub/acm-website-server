import Btn from '@/components/atoms/btn';
import Spinner from '@/components/atoms/spinner';
import BlogCard from '@/components/molecules/blog-card';
import FetchError from '@/components/molecules/fetch-error';
import { useQuery } from '@/hooks/useFetch';
import { Link } from '@tanstack/react-router';
import React, { useState } from 'react';

export interface IBlogListProps {
  admin?: boolean;
}

const PAGE_SIZE = 9;

const BlogList: React.FC<IBlogListProps> = ({ admin = false }) => {
  const [page, setPage] = useState(1);
  const query = { page, limit: PAGE_SIZE };
  const publicPosts = useQuery('get', '/v1/blog', { params: { query } }, { enabled: !admin });
  const adminPosts = useQuery('get', '/v1/blog/admin', { params: { query } }, { enabled: admin });
  const { data, error } = admin ? adminPosts : publicPosts;

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  return (
    <div className="space-y-5">
      <h1 className="text-4xl font-bold">Blog</h1>
      {admin && (
        <div className="flex items-center justify-end">
          <Link to="/admin/blog/create">
            <Btn>Create Post</Btn>
          </Link>
        </div>
      )}
      <FetchError isError={!!error}>
        {data ? (
          data.posts.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.posts.map((post) => (
                <BlogCard key={post.id} post={post} admin={admin} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No posts yet.</p>
          )
        ) : (
          <Spinner />
        )}
      </FetchError>
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Btn variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Previous
          </Btn>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Btn variant="outline" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            Next
          </Btn>
        </div>
      )}
    </div>
  );
};

export { BlogList };
