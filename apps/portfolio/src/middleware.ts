import { defineMiddleware } from "astro:middleware";

// Gate the knowledge admin UI + its API behind HTTP Basic Auth. Set
// ADMIN_PASSWORD (and optionally ADMIN_USER, default "admin") in the
// environment. With no ADMIN_PASSWORD the admin routes are disabled (503) so
// they can never be left open by accident.
const PROTECTED = /^\/(admin|api\/admin)(\/|$)/;

const REALM = 'Basic realm="Arkhe Admin", charset="UTF-8"';

// Constant-time string comparison to avoid leaking length/contents via timing.
const safeEqual = (a: string, b: string): boolean => {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
};

export const onRequest = defineMiddleware((context, next) => {
  if (!PROTECTED.test(context.url.pathname)) return next();

  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    return new Response("Admin is disabled (ADMIN_PASSWORD not set).", {
      status: 503,
    });
  }

  const user = process.env.ADMIN_USER ?? "admin";
  const expected = `Basic ${btoa(`${user}:${password}`)}`;
  const provided = context.request.headers.get("authorization") ?? "";

  if (!safeEqual(provided, expected)) {
    return new Response("Authentication required.", {
      status: 401,
      headers: { "www-authenticate": REALM },
    });
  }

  return next();
});
