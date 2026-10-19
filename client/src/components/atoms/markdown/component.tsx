import clsx from 'clsx';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';

export interface IMarkdownProps {
  children: string;
  className?: string;
}

// Raw HTML in the source is escaped and the output is sanitized, so post
// content can't inject scripts even though it is admin-authored.
const Markdown: React.FC<IMarkdownProps> = ({ children, className }) => {
  return (
    <div className={clsx('prose prose-neutral max-w-none break-words', className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
        {children}
      </ReactMarkdown>
    </div>
  );
};

export { Markdown };
