(() => {
  const widgets = [...document.querySelectorAll("[data-reader-contact]")];
  if (!widgets.length) return;

  const endpoint = "/api/contact/";
  const messages = {
    configuration: "The reader desk is preparing. Please use email for now.",
    verification: "Verification expired. Please complete it again.",
    rate: "This desk accepts one submission every ten minutes. Please try again shortly.",
    server: "The reader desk could not receive this message. Please use email."
  };

  const loadTurnstile = () => new Promise((resolve, reject) => {
    if (window.turnstile) return resolve(window.turnstile);
    const existing = document.querySelector("script[data-galok-turnstile]");
    if (existing) {
      existing.addEventListener("load", () => resolve(window.turnstile), { once: true });
      existing.addEventListener("error", reject, { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.dataset.galokTurnstile = "true";
    script.onload = () => resolve(window.turnstile);
    script.onerror = reject;
    document.head.append(script);
  });

  const setStatus = (root, value, state = "") => {
    const node = root.querySelector("[data-reader-contact-status]");
    if (!node) return;
    node.textContent = value;
    node.className = `reader-contact-status${state ? ` is-${state}` : ""}`;
  };

  function buildForm(root, config) {
    const body = root.querySelector("[data-reader-contact-body]");
    const context = root.dataset.readerContactContext || "Galok";
    body.innerHTML = `
      <p class="reader-contact-note">A source, an error, a contradiction or a proposal belongs in the record. Fields marked optional may be left empty.</p>
      <form class="reader-contact-form" data-reader-contact-form novalidate>
        <label><span>Name / optional</span><input name="name" maxlength="120" autocomplete="name"></label>
        <label><span>Email / optional</span><input name="email" type="email" maxlength="254" autocomplete="email"></label>
        <label class="is-wide"><span>Type</span><select name="type"><option value="correction">Correction</option><option value="source">Source / evidence</option><option value="note">General note</option><option value="collaboration">Collaboration</option></select></label>
        <label class="is-wide reader-contact-message"><span>Message</span><textarea name="message" required minlength="12" maxlength="6000" placeholder="What should Galok look at?"></textarea></label>
        <label><span>Related Galok URL</span><input name="relatedUrl" type="url" maxlength="2048" placeholder="https://www.galok.me/..." inputmode="url"></label>
        <label><span>Source URL / optional</span><input name="sourceUrl" type="url" maxlength="2048" placeholder="https://..." inputmode="url"></label>
        <div class="is-wide" data-reader-turnstile></div>
        <div class="reader-contact-actions"><button class="reader-contact-submit" type="submit">Send to the desk ↗</button><span class="reader-contact-status" data-reader-contact-status aria-live="polite"></span></div>
      </form>
      <p class="reader-contact-fallback">For private material, email <a href="mailto:galokview@outlook.com">galokview@outlook.com</a>.</p>`;

    const form = body.querySelector("[data-reader-contact-form]");
    let turnstileToken = "";
    let widgetId;
    loadTurnstile().then((turnstile) => {
      widgetId = turnstile.render(body.querySelector("[data-reader-turnstile]"), {
        sitekey: config.turnstileSiteKey,
        theme: "light",
        callback: (token) => { turnstileToken = token; setStatus(root, ""); },
        "expired-callback": () => { turnstileToken = ""; setStatus(root, messages.verification, "error"); },
        "error-callback": () => { turnstileToken = ""; setStatus(root, messages.verification, "error"); }
      });
    }).catch(() => setStatus(root, messages.configuration, "error"));

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      if (!turnstileToken) { setStatus(root, messages.verification, "error"); return; }
      const submit = form.querySelector("button[type=submit]");
      submit.disabled = true;
      setStatus(root, "Sending record…");
      const fields = new FormData(form);
      const payload = Object.fromEntries(fields.entries());
      payload.context = context;
      payload.turnstileToken = turnstileToken;
      try {
        const response = await fetch(config.endpoint || endpoint, {
          method: "POST",
          headers: { "content-type": "application/json", accept: "application/json" },
          body: JSON.stringify(payload)
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
          const error = response.status === 429 ? messages.rate : response.status === 400 || response.status === 403 ? messages.verification : messages.server;
          throw new Error(result.code || error);
        }
        form.reset();
        turnstileToken = "";
        if (widgetId !== undefined) window.turnstile?.reset(widgetId);
        setStatus(root, "Received. Thank you for putting it on the record.", "success");
      } catch (error) {
        setStatus(root, error.message === "rate_limited" ? messages.rate : messages.server, "error");
      } finally {
        submit.disabled = false;
      }
    });
  }

  async function initialize(root) {
    try {
      const response = await fetch(`${endpoint}config`, { cache: "no-store" });
      if (!response.ok) throw new Error("config");
      const config = await response.json();
      if (!config.turnstileSiteKey) throw new Error("sitekey");
      buildForm(root, config);
    } catch {
      const body = root.querySelector("[data-reader-contact-body]");
      body.innerHTML = `<p class="reader-contact-note">${messages.configuration}</p><p class="reader-contact-fallback">Email <a href="mailto:galokview@outlook.com">galokview@outlook.com</a> for corrections, sources or collaboration.</p>`;
    }
  }

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (!entry.isIntersecting || entry.target.dataset.readerContactLoaded) return;
      entry.target.dataset.readerContactLoaded = "true";
      initialize(entry.target);
      observer.unobserve(entry.target);
    }), { rootMargin: "280px 0px" });
    widgets.forEach((widget) => observer.observe(widget));
  } else {
    widgets.forEach(initialize);
  }
})();
