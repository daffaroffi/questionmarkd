import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  return (
    <div className={`prose dark:prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mt-6 mb-3 text-gray-900 dark:text-white" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-xl font-semibold mt-5 mb-2 text-gray-800 dark:text-gray-100" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-lg font-medium mt-4 mb-2 text-gray-800 dark:text-gray-200" {...props} />,
          p: ({ node, ...props }) => <p className="mb-3 leading-relaxed text-gray-700 dark:text-gray-300" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-3 space-y-1 text-gray-700 dark:text-gray-300" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-3 space-y-1 text-gray-700 dark:text-gray-300" {...props} />,
          li: ({ node, ...props }) => <li className="pl-1" {...props} />,
          a: ({ node, ...props }) => <a className="text-violet-600 dark:text-violet-400 hover:underline font-medium" target="_blank" rel="noopener noreferrer" {...props} />,
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-violet-500 pl-4 py-1 my-3 bg-gray-50 dark:bg-gray-800/40 rounded-r italic text-gray-600 dark:text-gray-400" {...props} />
          ),
          code({ node, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match;
            return isInline ? (
              <code className="bg-gray-100 dark:bg-gray-800 text-rose-600 dark:text-rose-400 px-1.5 py-0.5 rounded font-mono text-sm" {...props}>
                {children}
              </code>
            ) : (
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-sm my-3 border border-gray-800">
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            );
          },
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-4 rounded-lg border border-gray-200 dark:border-gray-800">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800 text-left" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => <thead className="bg-gray-50 dark:bg-gray-800/80" {...props} />,
          tbody: ({ node, ...props }) => <tbody className="divide-y divide-gray-200 dark:divide-gray-800" {...props} />,
          tr: ({ node, ...props }) => <tr {...props} />,
          th: ({ node, ...props }) => <th className="px-4 py-3 font-semibold text-sm text-gray-700 dark:text-gray-300" {...props} />,
          td: ({ node, ...props }) => <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
