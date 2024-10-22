export const markdownOverrides = {
  h1: ({ ...props }) => (
    <h1
      className="mb-6 mt-4 text-4xl font-bold text-gray-900 dark:text-gray-100"
      {...props}
    />
  ),
  h2: ({ ...props }) => (
    <h2
      className="mb-4 mt-4 text-3xl font-semibold text-gray-800 dark:text-gray-200"
      {...props}
    />
  ),
  h3: ({ ...props }) => (
    <h3
      className="mb-3 mt-3 text-2xl font-medium text-gray-700 dark:text-gray-300"
      {...props}
    />
  ),
  h4: ({ ...props }) => (
    <h4
      className="mb-3 mt-2 text-xl font-medium text-gray-700 dark:text-gray-300"
      {...props}
    />
  ),
  p: ({ ...props }) => (
    <p
      className="mb-4 text-base leading-relaxed text-gray-700 dark:text-gray-300"
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
      className="mb-4 list-inside list-disc text-gray-700 dark:text-gray-300"
      {...props}
    />
  ),
  ol: ({ ...props }) => (
    <ol
      className="mb-4 list-inside list-decimal text-gray-700 dark:text-gray-300"
      {...props}
    />
  ),
  li: ({ ...props }) => <li className="mb-2" {...props} />,
  blockquote: ({ ...props }) => (
    <blockquote
      className="mb-4 border-l-4 border-gray-300 pl-4 italic text-gray-600 dark:border-gray-600 dark:text-gray-400"
      {...props}
    />
  ),
  img: ({ ...props }) => (
    <img className="mb-4 h-auto max-w-full rounded-lg" {...props} />
  ),
  table: ({ ...props }) => (
    <table className="mb-4 block min-w-full border-collapse overflow-x-auto">
      <thead className="bg-gray-100 dark:bg-gray-800">{props.children}</thead>
      <tbody>{props.children}</tbody>
    </table>
  ),
  th: ({ ...props }) => (
    <th
      className="border bg-gray-200 px-4 py-2 text-left font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-300"
      {...props}
    />
  ),
  td: ({ ...props }) => (
    <td
      className="border px-4 py-2 text-gray-700 dark:text-gray-300"
      {...props}
    />
  ),
  hr: ({ ...props }) => (
    <hr className="my-8 border-gray-300 dark:border-gray-600" {...props} />
  ),
};
