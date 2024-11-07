import { Components } from "react-markdown";

export const markdownOverrides: Partial<Components> = {
  h1: ({ children, ...props }) => (
    <h1
      className="mb-4 mt-4 text-3xl font-bold text-gray-900 sm:mt-8"
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2 className="mb-3 mt-6 text-2xl font-semibold text-gray-800" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 className="mb-2 mt-5 text-xl font-semibold text-gray-800" {...props}>
      {children}
    </h3>
  ),
  h4: ({ children, ...props }) => (
    <h4 className="mb-2 mt-4 text-lg font-semibold text-gray-800" {...props}>
      {children}
    </h4>
  ),
  p: ({ children, ...props }) => (
    <p className="mb-5 text-base leading-7 text-gray-800" {...props}>
      {children}
    </p>
  ),
  a: ({ children, ...props }) => (
    <a className="text-blue-600 hover:underline" {...props}>
      {children}
    </a>
  ),
  ul: ({ children, ...props }) => (
    <ul className="mb-4 ml-6 list-disc text-gray-800" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="mb-4 ml-6 list-decimal text-gray-800" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li className="mb-1" {...props}>
      {children}
    </li>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote
      className="mb-4 border-l-4 border-gray-300 bg-gray-50 pl-4 italic text-gray-600"
      {...props}
    >
      {children}
    </blockquote>
  ),
  img: ({ alt, ...props }) => (
    <img
      className="mb-4 h-auto max-w-full rounded-md border border-gray-200"
      alt={alt}
      {...props}
    />
  ),
  table: ({ children, ...props }) => (
    <div className="mb-4 overflow-x-auto">
      <table
        className="w-full border-collapse border border-gray-300"
        {...props}
      >
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }) => (
    <thead className="border-b border-gray-300 bg-gray-100" {...props}>
      {children}
    </thead>
  ),
  tbody: ({ children, ...props }) => <tbody {...props}>{children}</tbody>,
  th: ({ children, ...props }) => (
    <th
      className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-800"
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td className="border border-gray-300 px-4 py-2 text-gray-800" {...props}>
      {children}
    </td>
  ),
  hr: ({ ...props }) => (
    <hr className="my-8 border-t border-gray-300" {...props} />
  ),
};
