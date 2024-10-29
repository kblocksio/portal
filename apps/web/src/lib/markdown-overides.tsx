export const markdownOverrides = {
  h1: ({ ...props }) => (
    <h1 className="mb-4 mt-8 text-3xl font-bold text-gray-900" {...props} />
  ),
  h2: ({ ...props }) => (
    <h2 className="mb-3 mt-6 text-2xl font-semibold text-gray-800" {...props} />
  ),
  h3: ({ ...props }) => (
    <h3 className="mb-2 mt-5 text-xl font-semibold text-gray-800" {...props} />
  ),
  h4: ({ ...props }) => (
    <h4 className="mb-2 mt-4 text-lg font-semibold text-gray-800" {...props} />
  ),
  p: ({ ...props }) => (
    <p className="mb-5 text-base leading-7 text-gray-800" {...props} />
  ),
  a: ({ ...props }) => (
    <a className="text-blue-600 hover:underline" {...props} />
  ),
  ul: ({ ...props }) => (
    <ul className="mb-4 ml-6 list-disc text-gray-800" {...props} />
  ),
  ol: ({ ...props }) => (
    <ol className="mb-4 ml-6 list-decimal text-gray-800" {...props} />
  ),
  li: ({ ...props }) => <li className="mb-1" {...props} />,
  blockquote: ({ ...props }) => (
    <blockquote
      className="mb-4 border-l-4 border-gray-300 bg-gray-50 pl-4 italic text-gray-600"
      {...props}
    />
  ),
  img: ({ ...props }) => (
    <img
      className="mb-4 h-auto max-w-full rounded-md border border-gray-200"
      {...props}
    />
  ),
  table: ({ ...props }) => (
    <div className="mb-4 overflow-x-auto">
      <table className="w-full border-collapse border border-gray-300">
        {props.children}
      </table>
    </div>
  ),
  thead: ({ ...props }) => (
    <thead className="border-b border-gray-300 bg-gray-100">
      {props.children}
    </thead>
  ),
  tbody: ({ ...props }) => <tbody>{props.children}</tbody>,
  th: ({ ...props }) => (
    <th
      className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-800"
      {...props}
    />
  ),
  td: ({ ...props }) => (
    <td className="border border-gray-300 px-4 py-2 text-gray-800" {...props} />
  ),
  hr: ({ ...props }) => (
    <hr className="my-8 border-t border-gray-300" {...props} />
  ),
};
