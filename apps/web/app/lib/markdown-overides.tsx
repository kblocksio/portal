export const markdownOverrides = {
  h1: ({ ...props }) => (
    <h1
      className="text-4xl font-bold mb-6 mt-4 text-gray-900 dark:text-gray-100"
      {...props}
    />
  ),
  h2: ({ ...props }) => (
    <h2
      className="text-3xl font-semibold mb-4 mt-4 text-gray-800 dark:text-gray-200"
      {...props}
    />
  ),
  h3: ({ ...props }) => (
    <h3
      className="text-2xl font-medium mb-3 mt-3 text-gray-700 dark:text-gray-300"
      {...props}
    />
  ),
  h4: ({ ...props }) => (
    <h4
      className="text-xl font-medium mb-3 mt-2 text-gray-700 dark:text-gray-300"
      {...props}
    />
  ),
  p: ({ ...props }) => (
    <p
      className="text-base leading-relaxed mb-4 text-gray-700 dark:text-gray-300"
      {...props}
    />
  ),
  a: ({ ...props }) => (
    <a
      className="text-blue-600 hover:underline dark:text-blue-400"
      {...props}
    />
  ),
  ul: ({ ...props }) => (
    <ul
      className="list-disc list-inside mb-4 text-gray-700 dark:text-gray-300"
      {...props}
    />
  ),
  ol: ({ ...props }) => (
    <ol
      className="list-decimal list-inside mb-4 text-gray-700 dark:text-gray-300"
      {...props}
    />
  ),
  li: ({ ...props }) => <li className="mb-2" {...props} />,
  blockquote: ({ ...props }) => (
    <blockquote
      className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic mb-4 text-gray-600 dark:text-gray-400"
      {...props}
    />
  ),
  img: ({ ...props }) => (
    <img className="max-w-full h-auto rounded-lg mb-4" {...props} />
  ),
  table: ({ ...props }) => (
    <table className="min-w-full border-collapse block overflow-x-auto mb-4">
      <thead className="bg-gray-100 dark:bg-gray-800">{props.children}</thead>
      <tbody>{props.children}</tbody>
    </table>
  ),
  th: ({ ...props }) => (
    <th
      className="px-4 py-2 border text-left bg-gray-200 dark:bg-gray-700 font-semibold text-gray-700 dark:text-gray-300"
      {...props}
    />
  ),
  td: ({ ...props }) => (
    <td
      className="px-4 py-2 border text-gray-700 dark:text-gray-300"
      {...props}
    />
  ),
  hr: ({ ...props }) => (
    <hr className="my-8 border-gray-300 dark:border-gray-600" {...props} />
  ),
};
