import URIjs from "urijs";

export function BUILD_URL(path, query = {}) {
  return new URIjs(path).search(query).toString();
}

export function REDIRECT(path, query = {}) {
  window.location = BUILD_URL(path, query);
}

export function OPEN(path, query = {}) {
  window.open(BUILD_URL(path, query));
}
