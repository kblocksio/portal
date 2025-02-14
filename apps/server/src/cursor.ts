export interface Cursor {
  page: number;
  offset: number;
}

/**
 * Get the latest cursor for a given total number of items and limit (aka page size).
 *
 * The latest cursor holds a page and an offset, which is used to make sure that the
 * latest page returned is full of items (given that the total number of items is bigger
 * than the page size).
 */
export const getLatestCursor = (options: {
  total: number;
  pageSize: number;
}): Cursor => {
  const totalPages = Math.ceil(options.total / options.pageSize);
  const page = totalPages;
  const offset = options.pageSize - (options.total % options.pageSize);
  return { page, offset };
};

export interface Position {
  start: number;
  end: number;
}

/**
 * Get the start index and end index of a page from a cursor.
 *
 * These indexes are meant to be used in Redis.
 */
export const getPositionFromCursor = (
  cursor: Cursor,
  options: { pageSize: number },
): Position => {
  const start = (cursor.page - 1) * options.pageSize - cursor.offset;
  const end = start + options.pageSize - 1;
  return {
    start: Math.max(0, start),
    end,
  };
};
