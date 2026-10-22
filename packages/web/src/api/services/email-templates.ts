export const escapeHtml = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
export function emailTemplate(
  title: string,
  message: string,
  url?: string,
  action = "Open dashboard",
) {
  return `<!doctype html><html><body style="margin:0;background:#d4e1ff;font-family:Arial,sans-serif;color:#131313"><div style="max-width:580px;margin:32px auto;background:#fff;border:3px solid #131313"><div style="background:#3b74ff;padding:24px;border-bottom:3px solid #131313;font-weight:900;font-size:24px">1 CLICK BUSINESS</div><div style="padding:28px"><h1 style="font-size:28px">${escapeHtml(title)}</h1><p style="line-height:1.7;white-space:pre-line">${escapeHtml(message)}</p>${url ? `<a href="${escapeHtml(url)}" style="display:inline-block;padding:16px 24px;background:#131313;color:#fff;font-weight:bold;text-decoration:none">${escapeHtml(action)}</a>` : ""}</div><div style="padding:20px;border-top:3px solid #131313;font-size:12px">AI Service Hub LLC · Minnesota, USA<br>Questions? ${escapeHtml(process.env.SUPPORT_EMAIL ?? "mr.danielbjorke@gmail.com")}</div></div></body></html>`;
}
