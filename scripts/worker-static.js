export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/admin-session") {
      const email = request.headers.get("oai-authenticated-user-email")?.trim().toLowerCase() || "";
      return new Response(JSON.stringify({ isOwner: email === "amurbrindacchesterm@gmail.com" }), {
        headers: {
          "content-type": "application/json; charset=utf-8",
          "cache-control": "no-store, private",
        },
      });
    }
    if (url.pathname === "/") {
      url.pathname = "/index.html";
      return env.ASSETS.fetch(new Request(url, request));
    }
    return env.ASSETS.fetch(request);
  },
};
