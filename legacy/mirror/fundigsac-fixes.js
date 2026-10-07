(() => {
  window.__fundigsacMirrorFixes = "loaded";
  const known = new Set(["/", "/shop/", "/nosotros/", "/contactanos/", "/libro-de-reclamos/", "/product-category/valvulas-hierro-ductil/", "/hola-mundo/", "/product/valvula-check-flex/", "/product/valvula-check-swing/", "/product/valvula-compuerta-acerrojada/", "/product/valvula-compuerta-bridada/", "/product/valvula-de-alivio-bridada/", "/product/valvula-embone-tipo-luflex/", "/product/valvula-flotadora-bridada/", "/product/valvula-guillotina/", "/product/valvula-mariposa-excentrica/", "/product/valvula-reductora-de-presion/"]);
  const normalizePath = value => { try { return new URL(value, location.href).pathname.replace(/\/?$/, "/"); } catch { return ""; } };
  document.querySelectorAll(".ekit_navsearch-button").forEach(el => { el.setAttribute("aria-label", "Buscar productos"); el.title = "Buscar productos"; el.setAttribute("href", "#ekit_modal-popup-5b93b55c"); });
  document.querySelectorAll('input[placeholder*="email" i],input[name*="email" i],input[type="email"]').forEach(el => { if (el.id !== "form-field-field_77c1063" && !/asunto/i.test(el.placeholder || "")) el.setAttribute("type", "email"); });
  const subject = document.querySelector("#form-field-field_77c1063");
  if (subject) subject.setAttribute("type", "text");
  document.querySelectorAll("input,select,textarea").forEach(el => {
    if (el.type === "hidden" || el.labels?.length || el.getAttribute("aria-label") || el.getAttribute("aria-labelledby")) return;
    const label = (el.placeholder || el.name || el.id || "").replace(/^form-field-/, "").replace(/[_-]+/g, " ").trim();
    if (label && el.id !== "g-recaptcha-response") el.setAttribute("aria-label", label.charAt(0).toUpperCase() + label.slice(1));
    if (el.id === "g-recaptcha-response") { el.setAttribute("aria-hidden", "true"); el.setAttribute("tabindex", "-1"); }
  });
  const repairLinks = () => document.querySelectorAll('a[href="/"],a[href="/"]').forEach(a => {
    if (a.matches(".ekit_navsearch-button")) return;
    const label = (a.innerText || a.getAttribute("aria-label") || a.title || "").trim().toLowerCase();
    if (/cotizar|quote|solicitar/.test(label)) a.setAttribute("href", "/contactanos/");
    else if (/productos|catálogo|catalog|shop|tuberías|valvulas|válvulas|marcos y tapas/.test(label)) a.setAttribute("href", "/shop/");
    else if (/nosotros|about/.test(label)) a.setAttribute("href", "/nosotros/");
    else if (/contact/.test(label)) a.setAttribute("href", "/contactanos/");
  });
  repairLinks();
  [200, 800, 1600].forEach(delay => setTimeout(repairLinks, delay));
  const footerDestinations = new Map([
    ["válvulas hierro dúctil", "/product-category/valvulas-hierro-ductil/"],
    ["marcos y tapas de buzón", "/shop/"],
    ["marcos y tapas hd", "/shop/"],
    ["tuberías hd", "/shop/"],
    ["nosotros", "/nosotros/"],
    ["productos", "/shop/"],
    ["libro de reclamos", "/libro-de-reclamos/"],
    ["all products", "/shop/"],
    ["brands", "/shop/"],
    ["special offers", "/shop/"],
    ["about us", "/nosotros/"],
    ["contact", "/contactanos/"],
  ]);
  const repairFooterLinks = () => document.querySelectorAll(".elementor-location-footer a[href]").forEach(a => {
    const label = (a.innerText || a.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();
    const destination = footerDestinations.get(label);
    if (destination) a.setAttribute("href", destination);
    else if (a.querySelector("img") && !label) a.setAttribute("href", "/");
  });
  repairFooterLinks();
  [200, 800, 1600].forEach(delay => setTimeout(repairFooterLinks, delay));
  document.querySelectorAll("a[href]").forEach(a => {
    try { const u = new URL(a.getAttribute("href"), location.href); if ((u.hostname === "fundigsac.com" || u.hostname === "www.fundigsac.com") && known.has(normalizePath(u.pathname))) a.setAttribute("href", u.pathname + u.search + u.hash); } catch { /* non-url href */ }
  });
  document.querySelectorAll("form").forEach(form => {
    form.setAttribute("action", "#"); form.setAttribute("method", "get"); form.dataset.mirrorForm = "true";
    form.addEventListener("submit", event => {
      event.preventDefault();
      let note = form.querySelector("[data-mirror-notice]");
      if (!note) { note = document.createElement("p"); note.dataset.mirrorNotice = "true"; note.setAttribute("role", "status"); note.textContent = "Esta copia local es solo de referencia y no envía formularios."; form.append(note); }
      note.scrollIntoView({ block: "nearest", behavior: "smooth" });
    });
  });
  document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;
    const toggle = document.querySelector('[aria-label="Menu Toggle"]');
    const expanded = toggle?.getAttribute("aria-expanded") === "true";
    if (expanded) { toggle.click(); toggle.focus(); }
  });
  document.querySelectorAll(".elementor-nav-menu--dropdown a").forEach(link => link.addEventListener("click", () => {
    const toggle = document.querySelector('[aria-label="Menu Toggle"]');
    if (toggle?.getAttribute("aria-expanded") === "true") toggle.click();
  }));
  document.querySelectorAll(".elementor-location-header .elementor-menu-cart__toggle_button").forEach(a => a.setAttribute("aria-label", "Carrito no disponible en la copia local"));
  // Keep cloned counters/content exactly as captured, including values of zero.
  document.querySelectorAll("footer").forEach(el => { el.innerHTML = el.innerHTML.replace(/©\s*2025/g, "© " + new Date().getFullYear()); });
  const route = location.pathname.replace(/\/?$/, "/");
  const labels = { "/nosotros/": "Nosotros", "/shop/": "Productos", "/contactanos/": "Contáctanos", "/libro-de-reclamos/": "Libro de reclamaciones", "/product-category/valvulas-hierro-ductil/": "Válvulas de hierro dúctil" };
  const pageRoot = document.querySelector("main") || [...document.body.children].find(el => el.classList?.contains("elementor") && !el.matches(".elementor-location-header,.elementor-location-footer")) || document.querySelector(".elementor-location-single,.elementor-location-archive");
  const badHeaderTitle = document.querySelector(".elementor-location-header h1.mirror-accessible-title");
  const pageH1 = pageRoot?.querySelector("h1");
  if (badHeaderTitle && pageRoot) {
    const title = badHeaderTitle.textContent?.trim() || "";
    const normalize = value => (value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/gi, " ").trim().toLowerCase();
    const matchingHeading = [...pageRoot.querySelectorAll("h2")].find(h => normalize(h.textContent) === normalize(title));
    if (matchingHeading) {
      const replacement = document.createElement("h1");
      replacement.className = matchingHeading.className;
      replacement.innerHTML = matchingHeading.innerHTML;
      matchingHeading.replaceWith(replacement);
    } else if (!pageH1) {
      pageRoot.prepend(badHeaderTitle);
      badHeaderTitle.classList.add("mirror-accessible-title--sr-only");
    } else {
      badHeaderTitle.remove();
    }
    if (badHeaderTitle.isConnected && !badHeaderTitle.classList.contains("mirror-accessible-title--sr-only")) badHeaderTitle.remove();
  } else if (!pageH1) {
    const name = pageRoot?.querySelector(".product_title")?.textContent?.trim() || labels[route];
    if (name && pageRoot) { const h1 = document.createElement("h1"); h1.className = "mirror-accessible-title mirror-accessible-title--sr-only"; h1.textContent = name; pageRoot.prepend(h1); }
  }
})();
