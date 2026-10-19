import Btn from '@/components/atoms/btn';
import FieldErrorMessage from '@/components/atoms/field-error-message';
import Markdown from '@/components/atoms/markdown';
import FetchError from '@/components/molecules/fetch-error';
import FileUpload from '@/components/molecules/file-upload';
import Loading from '@/components/molecules/loading';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useMutation, useQuery } from '@/hooks/useFetch';
import { paths } from '@/types/schema.v1';
import { presignedUrlFetch } from '@/utils/presignedUrlFetch';
import { useForm } from '@tanstack/react-form';
import { useNavigate } from '@tanstack/react-router';
import React, { useRef } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';

type BlogPost =
  paths['/v1/blog/{postID}']['get']['responses']['200']['content']['application/json']['post'];

const formSchema = z.object({
  title: z.string().trim().min(1, { message: 'Title is required' }),
  content: z.string().min(1, { message: 'Content is required' }),
  published: z.boolean()
});

export interface IBlogFormProps {
  postId?: string;
}

const BlogForm: React.FC<IBlogFormProps> = ({ postId }) => {
  const {
    data,
    isLoading,
    error,
    refetch: refetchPost
  } = useQuery(
    'get',
    '/v1/blog/{postID}',
    { params: { path: { postID: postId || '' } } },
    { enabled: !!postId }
  );

  return (
    <Loading isLoading={!!postId && isLoading}>
      <FetchError isError={!!error}>
        <div>
          <h1 className="text-4xl font-bold mb-5">{postId ? 'Edit Post' : 'Create Post'}</h1>
          {/* Mounted only once the post is loaded so the form starts with real values. */}
          <BlogFormFields key={data?.post.id ?? 'new'} post={data?.post} onChange={refetchPost} />
        </div>
      </FetchError>
    </Loading>
  );
};

interface IBlogFormFieldsProps {
  post?: BlogPost;
  onChange: () => void;
}

const BlogFormFields: React.FC<IBlogFormFieldsProps> = ({ post, onChange }) => {
  const navigate = useNavigate();
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const { mutate: createPost } = useMutation('post', '/v1/blog');
  const { mutate: updatePost } = useMutation('put', '/v1/blog/{postID}');
  const { mutateAsync: requestCoverUpload } = useMutation('post', '/v1/blog/{postID}/cover');
  const { mutate: deleteCover } = useMutation('delete', '/v1/blog/{postID}/cover');
  const { mutateAsync: requestImageUpload } = useMutation(
    'post',
    '/v1/blog/{postID}/images/{filename}'
  );

  const form = useForm({
    defaultValues: {
      title: post?.title ?? '',
      content: post?.content ?? '',
      published: post?.published ?? false
    },
    validators: {
      onChange: formSchema as any // eslint-disable-line @typescript-eslint/no-explicit-any
    },
    onSubmit: ({ value }) => {
      if (post) {
        updatePost(
          { params: { path: { postID: post.id.toString() } }, body: value },
          {
            onSuccess() {
              navigate({ to: '/admin/blog/$postId', params: { postId: post.id.toString() } });
            },
            onError() {
              toast.error('Failed to update post');
            }
          }
        );
      } else {
        createPost(
          { body: value },
          {
            onSuccess(data) {
              toast.success('Post created. You can now add a cover image and inline images.');
              navigate({
                to: '/admin/blog/$postId/edit',
                params: { postId: data.post.id.toString() }
              });
            },
            onError() {
              toast.error('Failed to create post');
            }
          }
        );
      }
    }
  });

  const insertAtCursor = (text: string) => {
    const current = form.getFieldValue('content');
    const el = contentRef.current;
    const start = el?.selectionStart ?? current.length;
    const end = el?.selectionEnd ?? current.length;
    form.setFieldValue('content', `${current.slice(0, start)}${text}${current.slice(end)}`);
  };

  const handleCoverUpload = async (files: File[]) => {
    if (!post || !files[0]) return;
    try {
      const { presigned_url } = await requestCoverUpload({
        params: { path: { postID: post.id.toString() } }
      });
      await presignedUrlFetch(presigned_url, files[0]);
      toast.success('Cover image uploaded');
      onChange();
    } catch {
      toast.error('Failed to upload cover image');
    }
  };

  const handleCoverDelete = () => {
    if (!post) return;
    deleteCover(
      { params: { path: { postID: post.id.toString() } } },
      {
        onSuccess() {
          toast.success('Cover image removed');
          onChange();
        },
        onError() {
          toast.error('Failed to remove cover image');
        }
      }
    );
  };

  const handleImagesUpload = async (files: File[]) => {
    if (!post) return;
    for (const file of files) {
      try {
        const { presigned_url, url } = await requestImageUpload({
          params: { path: { postID: post.id.toString(), filename: file.name } }
        });
        await presignedUrlFetch(presigned_url, file);
        insertAtCursor(`\n![${file.name}](${url})\n`);
      } catch {
        toast.error(`Failed to upload image: ${file.name}`);
      }
    }
  };

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <form.Field
        name="title"
        children={(field) => (
          <div>
            <Label htmlFor={field.name} className="text-lg">
              Title
            </Label>
            <Input
              id={field.name}
              placeholder="Enter post title"
              name={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              type="text"
              className="w-full"
            />
            <FieldErrorMessage field={field} />
          </div>
        )}
      />

      <div className="space-y-2">
        <Label className="text-lg">Cover image</Label>
        {post ? (
          <div className="flex items-center gap-4">
            {post.coverImageUrl ? (
              <>
                {/* cache-bust: replacing the cover reuses the same S3 key */}
                <img
                  src={`${post.coverImageUrl}?v=${encodeURIComponent(post.updatedAt)}`}
                  alt="Cover"
                  className="h-24 w-40 rounded-md object-cover"
                />
                <FileUpload onUpload={handleCoverUpload} maxFiles={1}>
                  <Btn type="button" variant="outline" size="sm">
                    Replace
                  </Btn>
                </FileUpload>
                <Btn type="button" variant="destructive" size="sm" onClick={handleCoverDelete}>
                  Remove
                </Btn>
              </>
            ) : (
              <FileUpload onUpload={handleCoverUpload} maxFiles={1}>
                <Btn type="button" variant="outline" size="sm">
                  Upload cover
                </Btn>
              </FileUpload>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Create the post first, then you can add a cover image and inline images.
          </p>
        )}
      </div>

      <form.Field
        name="content"
        children={(field) => (
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor={field.name} className="text-lg">
                Content (Markdown)
              </Label>
              {post && (
                <FileUpload onUpload={handleImagesUpload}>
                  <Btn type="button" variant="outline" size="sm">
                    Insert image
                  </Btn>
                </FileUpload>
              )}
            </div>
            <Tabs defaultValue="write">
              <TabsList>
                <TabsTrigger value="write">Write</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
              <TabsContent value="write">
                <Textarea
                  id={field.name}
                  ref={contentRef}
                  placeholder="Write your post in Markdown"
                  className="min-h-[360px] w-full font-mono"
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </TabsContent>
              <TabsContent value="preview">
                <div className="min-h-[360px] rounded-md border p-4">
                  {field.state.value ? (
                    <Markdown>{field.state.value}</Markdown>
                  ) : (
                    <p className="text-muted-foreground">Nothing to preview.</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
            <FieldErrorMessage field={field} />
          </div>
        )}
      />

      <form.Field
        name="published"
        children={(field) => (
          <div className="flex items-center gap-3">
            <Switch
              id={field.name}
              checked={field.state.value}
              onCheckedChange={(checked) => field.handleChange(checked)}
            />
            <Label htmlFor={field.name} className="text-lg">
              {field.state.value ? 'Published' : 'Draft'}
            </Label>
          </div>
        )}
      />

      <Btn type="submit" variant="outline">
        {post ? 'Update' : 'Create'}
      </Btn>
    </form>
  );
};

export { BlogForm };
