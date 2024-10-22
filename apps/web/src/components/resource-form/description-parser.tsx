import React from "react";

export const parseDescription = (description: string): React.ReactNode[] => {
  const regex = /\[([^\]]*)\]\(([^)]+)\)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(description)) !== null) {
    const [fullMatch, linkText, url] = match;

    // Add text before the link
    if (match.index > lastIndex) {
      parts.push(description.substring(lastIndex, match.index));
    }

    // Use URL as text if linkText is empty
    const text = linkText || url;

    parts.push(
      <a
        href={url}
        className="text-sky-500 hover:underline"
        target="_blank"
        rel="noopener noreferrer"
        key={lastIndex}
      >
        {text}
      </a>,
    );

    lastIndex = match.index + fullMatch.length;
  }

  // Add remaining text after the last link
  if (lastIndex < description.length) {
    parts.push(description.substring(lastIndex));
  }

  return parts;
};

/**
 * Remove all doctags from the description (lines that start with @)
 */
export const sanitizeDescription = (description: string | undefined) => {
  if (!description) {
    return "";
  }

  return description
    .split("\n")
    .filter((s) => !s.startsWith("@"))
    .join("\n")
    .trim();
};
