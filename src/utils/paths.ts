export const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, "");

export const withBase = (path = "/") => {
  if (
    /^(https?:)?\/\//.test(path) ||
    path.startsWith("#") ||
    path.startsWith("mailto:")
  ) {
    return path;
  }
  return `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
};
