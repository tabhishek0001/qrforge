(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const state = { type: "url", payload: "", canvas: null, matrix: null, valid: false, debounce: null, logo: null };
  const storageKey = "qrforge.saved.v1";
  const typeNames = { url: "Website URL", text: "Plain text", wifi: "Wi-Fi", whatsapp: "WhatsApp", email: "Email", phone: "Phone", sms: "SMS", vcard: "Contact card", location: "Location", event: "Event", upi: "UPI payment" };
  const iconNames = { url: "fa-link", text: "fa-align-left", wifi: "fa-wifi", whatsapp: "fa-whatsapp", email: "fa-envelope", phone: "fa-phone", sms: "fa-message", vcard: "fa-address-card", location: "fa-location-dot", event: "fa-calendar", upi: "fa-indian-rupee-sign" };
  const fields = {
    url: [
      { id: "url", label: "Website URL", placeholder: "https://example.com", type: "url", full: true, help: "Include a website address. If you omit https://, QRForge adds it." }
    ],
    text: [
      { id: "text", label: "Your message", placeholder: "Write the text you want to share…", textarea: true, full: true }
    ],
    wifi: [
      { id: "ssid", label: "Network name (SSID)", placeholder: "e.g. Studio Wi-Fi", full: true },
      { id: "password", label: "Password", placeholder: "Enter Wi-Fi password", type: "text", help: "Anyone scanning this code may be able to use these network credentials." },
      { id: "security", label: "Security", select: [{ value: "WPA", label: "WPA / WPA2 / WPA3" }, { value: "WEP", label: "WEP" }, { value: "nopass", label: "No password" }] },
      { id: "hidden", label: "Hidden network", checkbox: true }
    ],
    whatsapp: [
      { id: "waPhone", label: "WhatsApp number", placeholder: "91 98765 43210", full: true, help: "Enter country code and number. Do not include the + sign." },
      { id: "waMessage", label: "Pre-filled message (optional)", placeholder: "Hello! I would like to know more…", textarea: true, full: true }
    ],
    email: [
      { id: "emailTo", label: "Email address", placeholder: "hello@example.com", type: "email", full: true },
      { id: "emailSubject", label: "Subject", placeholder: "Hello" },
      { id: "emailBody", label: "Message (optional)", placeholder: "Write a message…", textarea: true, full: true }
    ],
    phone: [{ id: "phone", label: "Phone number", placeholder: "+91 98765 43210", type: "tel", full: true }],
    sms: [
      { id: "smsPhone", label: "Phone number", placeholder: "+91 98765 43210", type: "tel", full: true },
      { id: "smsMessage", label: "Message (optional)", placeholder: "Write a text message…", textarea: true, full: true }
    ],
    vcard: [
      { id: "firstName", label: "First name", placeholder: "Aarav" },
      { id: "lastName", label: "Last name", placeholder: "Sharma" },
      { id: "org", label: "Company", placeholder: "Company name" },
      { id: "title", label: "Job title", placeholder: "Product Designer" },
      { id: "mobile", label: "Phone", placeholder: "+91 98765 43210", type: "tel" },
      { id: "workEmail", label: "Email", placeholder: "hello@example.com", type: "email" },
      { id: "website", label: "Website", placeholder: "https://example.com", full: true }
    ],
    location: [
      { id: "latitude", label: "Latitude", placeholder: "28.6139", type: "number" },
      { id: "longitude", label: "Longitude", placeholder: "77.2090", type: "number" },
      { id: "placeName", label: "Place name (optional)", placeholder: "India Gate", full: true }
    ],
    event: [
      { id: "eventTitle", label: "Event title", placeholder: "Product launch", full: true },
      { id: "eventLocation", label: "Location", placeholder: "Venue or address", full: true },
      { id: "eventStart", label: "Starts", type: "datetime-local" },
      { id: "eventEnd", label: "Ends", type: "datetime-local" },
      { id: "eventDescription", label: "Description (optional)", placeholder: "Add event details…", textarea: true, full: true }
    ],
    upi: [
      { id: "upiId", label: "UPI ID / VPA", placeholder: "yourname@bank", full: true, help: "Use the exact UPI ID provided by your bank or payment app." },
      { id: "upiName", label: "Payee name", placeholder: "Business or recipient name", full: true },
      { id: "upiAmount", label: "Amount in ₹ (optional)", placeholder: "250.00", type: "number" },
      { id: "upiNote", label: "Payment note (optional)", placeholder: "Invoice or order reference" }
    ]
  };

  function fieldMarkup(field) {
    const id = field.id;
    let control = "";
    if (field.select) {
      control = '<select class="form-select" id="' + id + '">' + field.select.map(o => '<option value="' + o.value + '">' + o.label + '</option>').join("") + '</select>';
    } else if (field.checkbox) {
      control = '<label class="switch-row" for="' + id + '"><input type="checkbox" id="' + id + '"><span class="switch-track"></span><span class="switch-copy">Yes, this network is hidden</span></label>';
    } else if (field.textarea) {
      control = '<textarea class="form-control" id="' + id + '" placeholder="' + (field.placeholder || "") + '"></textarea>';
    } else {
      control = '<input class="form-control" id="' + id + '" type="' + (field.type || "text") + '" placeholder="' + (field.placeholder || "") + '" autocomplete="off">';
    }
    return '<div class="field-wrap' + (field.full ? ' full' : '') + '"><label for="' + id + '">' + field.label + '</label>' + control + (field.help ? '<div class="field-help">' + field.help + '</div>' : '') + '</div>';
  }

  function renderFields() {
    $("#dynamicFields").innerHTML = fields[state.type].map(fieldMarkup).join("");
    updateQR();
  }

  function value(id) {
    const el = $("#" + id);
    return el ? (el.type === "checkbox" ? el.checked : el.value.trim()) : "";
  }
  function required(value, label) {
    if (!value) throw new Error("Please enter " + label.toLowerCase() + ".");
    return value;
  }
  function escapeWifi(value) {
    return String(value).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/:/g, "\\:").replace(/"/g, '\\"');
  }
  function vcardEscape(value) {
    return String(value || "").replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/;/g, "\\;").replace(/,/g, "\\,");
  }
  function cleanPhone(value, label) {
    const cleaned = String(value || "").replace(/[^+0-9]/g, "");
    if (!/^\+?[0-9]{6,15}$/.test(cleaned)) throw new Error("Enter a valid " + label.toLowerCase() + " with country code.");
    return cleaned;
  }
  function safeUrl(raw) {
    const candidate = /^https?:\/\//i.test(raw) ? raw : "https://" + raw;
    let parsed;
    try { parsed = new URL(candidate); } catch (_) { throw new Error("Enter a valid website URL."); }
    if (!["http:", "https:"].includes(parsed.protocol) || !parsed.hostname.includes(".")) throw new Error("Only valid http:// and https:// website addresses are supported.");
    return parsed.href;
  }
  function dateStamp(raw) {
    if (!raw) return "";
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) throw new Error("Enter a valid event date and time.");
    const pad = n => String(n).padStart(2, "0");
    return date.getUTCFullYear() + pad(date.getUTCMonth() + 1) + pad(date.getUTCDate()) + "T" + pad(date.getUTCHours()) + pad(date.getUTCMinutes()) + "00Z";
  }

  function buildPayload() {
    switch (state.type) {
      case "url": return safeUrl(required(value("url"), "a website URL"));
      case "text": return required(value("text"), "your message");
      case "wifi": {
        const ssid = required(value("ssid"), "the network name");
        const security = value("security");
        const password = value("password");
        if (security !== "nopass" && !password) throw new Error("Enter the Wi-Fi password or choose No password.");
        return "WIFI:T:" + security + ";S:" + escapeWifi(ssid) + ";P:" + (security === "nopass" ? "" : escapeWifi(password)) + ";H:" + (value("hidden") ? "true" : "false") + ";;";
      }
      case "whatsapp": {
        const phone = cleanPhone(required(value("waPhone"), "a WhatsApp number"), "WhatsApp number").replace(/^\+/, "");
        const message = value("waMessage");
        return "https://wa.me/" + phone + (message ? "?text=" + encodeURIComponent(message) : "");
      }
      case "email": {
        const email = required(value("emailTo"), "an email address");
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a valid email address.");
        const params = new URLSearchParams();
        if (value("emailSubject")) params.set("subject", value("emailSubject"));
        if (value("emailBody")) params.set("body", value("emailBody"));
        return "mailto:" + email + (params.toString() ? "?" + params.toString() : "");
      }
      case "phone": return "tel:" + cleanPhone(required(value("phone"), "a phone number"), "phone number");
      case "sms": {
        const phone = cleanPhone(required(value("smsPhone"), "a phone number"), "phone number");
        return "SMSTO:" + phone + ":" + value("smsMessage");
      }
      case "vcard": {
        const first = value("firstName"), last = value("lastName");
        if (!first && !last) throw new Error("Enter at least a first name or last name.");
        const lines = ["BEGIN:VCARD", "VERSION:3.0", "N:" + vcardEscape(last) + ";" + vcardEscape(first) + ";;;", "FN:" + vcardEscape((first + " " + last).trim())];
        if (value("org")) lines.push("ORG:" + vcardEscape(value("org")));
        if (value("title")) lines.push("TITLE:" + vcardEscape(value("title")));
        if (value("mobile")) lines.push("TEL;TYPE=CELL:" + vcardEscape(value("mobile")));
        if (value("workEmail")) lines.push("EMAIL:" + vcardEscape(value("workEmail")));
        if (value("website")) lines.push("URL:" + vcardEscape(value("website")));
        lines.push("END:VCARD");
        return lines.join("\r\n");
      }
      case "location": {
        const lat = Number(value("latitude")), lon = Number(value("longitude"));
        if (value("latitude") === "" || value("longitude") === "" || !Number.isFinite(lat) || !Number.isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) throw new Error("Enter valid latitude (−90 to 90) and longitude (−180 to 180).");
        const label = value("placeName");
        return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(lat + "," + lon + (label ? " (" + label + ")" : ""));
      }
      case "upi": {
        const upiId = required(value("upiId"), "a UPI ID");
        if (!/^[a-zA-Z0-9._-]{2,256}@[a-zA-Z0-9]{2,64}$/.test(upiId)) throw new Error("Enter a valid UPI ID, for example name@bank.");
        const params = new URLSearchParams({ pa: upiId, cu: "INR" });
        if (value("upiName")) params.set("pn", value("upiName"));
        if (value("upiAmount")) {
          const amount = Number(value("upiAmount"));
          if (!Number.isFinite(amount) || amount <= 0 || !/^\\d+(?:\\.\\d{1,2})?$/.test(value("upiAmount"))) throw new Error("Enter a valid payment amount with up to two decimal places.");
          params.set("am", amount.toFixed(2));
        }
        if (value("upiNote")) params.set("tn", value("upiNote"));
        return "upi://pay?" + params.toString();
      }
      case "event": {
        const title = required(value("eventTitle"), "an event title");
        const start = dateStamp(value("eventStart"));
        const end = dateStamp(value("eventEnd"));
        if (!start || !end) throw new Error("Choose both event start and end times.");
        if (new Date(value("eventEnd")) <= new Date(value("eventStart"))) throw new Error("Event end must be after its start.");
        const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//QRForge//QRForge Calendar//EN", "BEGIN:VEVENT", "UID:" + Date.now() + "@qrforge", "DTSTAMP:" + dateStamp(new Date().toISOString()), "DTSTART:" + start, "DTEND:" + end, "SUMMARY:" + vcardEscape(title)];
        if (value("eventLocation")) lines.push("LOCATION:" + vcardEscape(value("eventLocation")));
        if (value("eventDescription")) lines.push("DESCRIPTION:" + vcardEscape(value("eventDescription")));
        lines.push("END:VEVENT", "END:VCALENDAR");
        return lines.join("\r\n");
      }
      default: throw new Error("Choose a QR code type.");
    }
  }

  function setStatus(message, mode) {
    const el = $("#scanStatus");
    el.className = "scan-status" + (mode ? " " + mode : "");
    const icon = mode === "good" ? "fa-circle-check" : mode === "bad" ? "fa-circle-exclamation" : "fa-circle";
    el.innerHTML = '<i class="fa-regular ' + icon + '"></i><span></span>';
    $("span", el).textContent = message;
  }
  function luminance(hex) {
    const rgb = hex.match(/[a-f0-9]{2}/gi).map(part => parseInt(part, 16) / 255).map(c => c <= .04045 ? c / 12.92 : Math.pow((c + .055) / 1.055, 2.4));
    return .2126 * rgb[0] + .7152 * rgb[1] + .0722 * rgb[2];
  }
  function contrastRatio(fg, bg) {
    const a = luminance(fg), b = luminance(bg);
    return (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
  }
  function setActions(enabled) {
    $("#downloadPng").disabled = !enabled;
    $("#downloadSvg").disabled = !enabled;
    $("#saveCode").disabled = !enabled;
  }
  function qrSettings() {
    return {
      size: Number($("#qrSize").value),
      fg: $("#fgColor").value,
      bg: $("#bgColor").value,
      level: $("#qrLevel").value,
      margin: 4
    };
  }
  function renderMatrix(payload) {
    if (typeof window.qrcode !== "function") throw new Error("QR engine did not load. Check your internet connection and refresh the page.");
    const settings = qrSettings();
    const qr = window.qrcode(0, settings.level);
    qr.addData(payload, "Byte");
    qr.make();
    const count = qr.getModuleCount();
    const canvas = document.createElement("canvas");
    canvas.width = settings.size;
    canvas.height = settings.size;
    const ctx = canvas.getContext("2d", { alpha: false });
    ctx.fillStyle = settings.bg;
    ctx.fillRect(0, 0, settings.size, settings.size);
    const unit = settings.size / (count + settings.margin * 2);
    ctx.fillStyle = settings.fg;
    for (let row = 0; row < count; row++) {
      for (let col = 0; col < count; col++) {
        if (qr.isDark(row, col)) {
          const x = Math.floor((col + settings.margin) * unit);
          const y = Math.floor((row + settings.margin) * unit);
          const right = Math.ceil((col + settings.margin + 1) * unit);
          const bottom = Math.ceil((row + settings.margin + 1) * unit);
          ctx.fillRect(x, y, right - x, bottom - y);
        }
      }
    }
    return { canvas, qr, settings, count };
  }

  function updateQR() {
    clearTimeout(state.debounce);
    state.debounce = setTimeout(() => {
      try {
        const payload = buildPayload();
        if (payload.length > 2800) throw new Error("This content is too long for this QR Studio version. Shorten it or use a URL.");
        const result = renderMatrix(payload);
        state.payload = payload;
        state.canvas = result.canvas;
        state.matrix = result;
        state.valid = true;
        $("#qrPlaceholder").hidden = true;
        $("#qrRender").hidden = false;
        $("#qrRender").replaceChildren(result.canvas);
        const ratio = contrastRatio(result.settings.fg, result.settings.bg);
        if (ratio < 4.5) setStatus("Low contrast (" + ratio.toFixed(1) + ":1). Choose darker QR colour for reliable scanning.", "warn");
        else setStatus("QR code ready · " + result.count + " × " + result.count + " modules", "good");
        setActions(true);
      } catch (error) {
        state.valid = false;
        state.payload = "";
        state.canvas = null;
        $("#qrPlaceholder").hidden = false;
        $("#qrRender").hidden = true;
        $("#qrPlaceholder strong").textContent = "Ready when you are";
        $("#qrPlaceholder > span").textContent = error.message;
        setStatus(error.message, "bad");
        setActions(false);
      }
    }, 90);
  }
  function scheduleUpdate() { updateQR(); }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function downloadPng() {
    if (!state.valid || !state.canvas) return;
    state.canvas.toBlob(blob => { if (blob) downloadBlob(blob, "qrforge-" + state.type + ".png"); else showToast("Could not create PNG. Please try again."); }, "image/png");
  }
  function downloadSvg() {
    if (!state.valid || !state.matrix) return;
    const { qr, settings, count } = state.matrix;
    const total = count + settings.margin * 2;
    const paths = [];
    for (let row = 0; row < count; row++) {
      for (let col = 0; col < count; col++) {
        if (qr.isDark(row, col)) paths.push("M" + (col + settings.margin) + " " + (row + settings.margin) + "h1v1h-1z");
      }
    }
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + total + ' ' + total + '" width="' + settings.size + '" height="' + settings.size + '" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="' + settings.bg + '"/><path d="' + paths.join("") + '" fill="' + settings.fg + '"/></svg>';
    downloadBlob(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }), "qrforge-" + state.type + ".svg");
  }

  function showToast(message) {
    const wrap = document.createElement("div");
    wrap.className = "toast align-items-center";
    wrap.setAttribute("role", "status");
    wrap.innerHTML = '<div class="d-flex"><div class="toast-body"></div><button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button></div>';
    $(".toast-body", wrap).textContent = message;
    $("#toastArea").appendChild(wrap);
    if (window.bootstrap && window.bootstrap.Toast) {
      const toast = new bootstrap.Toast(wrap, { delay: 2600 });
      toast.show();
      wrap.addEventListener("hidden.bs.toast", () => wrap.remove());
    } else {
      wrap.classList.add("show");
      setTimeout(() => wrap.remove(), 2600);
    }
  }

  function readSaved() {
    try {
      const parsed = JSON.parse(localStorage.getItem(storageKey) || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) { return []; }
  }
  function writeSaved(items) {
    try { localStorage.setItem(storageKey, JSON.stringify(items.slice(0, 30))); return true; }
    catch (_) { showToast("Browser storage is full or unavailable."); return false; }
  }
  function saveCurrent() {
    if (!state.valid) return;
    const items = readSaved();
    const title = (state.payload.length > 42 ? state.payload.slice(0, 39) + "…" : state.payload) || typeNames[state.type];
    const formData = {};
    fields[state.type].forEach(field => {
      const el = $("#" + field.id);
      if (el) formData[field.id] = el.type === "checkbox" ? el.checked : el.value;
    });
    items.unshift({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), type: state.type, title, payload: state.payload, formData, savedAt: new Date().toISOString(), settings: qrSettings() });
    if (writeSaved(items)) { renderSaved(); showToast("QR code saved in this browser."); }
  }
  function loadSaved(item) {
    chooseType(item.type);
    const settings = item.settings || {};
    if (settings.fg) $("#fgColor").value = settings.fg;
    if (settings.bg) $("#bgColor").value = settings.bg;
    if (settings.size) $("#qrSize").value = String(settings.size);
    if (settings.level) $("#qrLevel").value = settings.level;
    $("#fgHex").textContent = $("#fgColor").value.toUpperCase();
    $("#bgHex").textContent = $("#bgColor").value.toUpperCase();
    if (item.formData && typeof item.formData === "object") {
      Object.entries(item.formData).forEach(([id, val]) => {
        const el = $("#" + id);
        if (el) {
          if (el.type === "checkbox") el.checked = Boolean(val);
          else el.value = val;
        }
      });
      updateQR();
    } else {
      try {
        const result = renderMatrix(item.payload);
        state.payload = item.payload;
        state.valid = true;
        state.matrix = result;
        state.canvas = result.canvas;
        $("#qrPlaceholder").hidden = true;
        $("#qrRender").hidden = false;
        $("#qrRender").replaceChildren(result.canvas);
        setStatus("Saved QR code loaded · edit fields to rebuild", "good");
        setActions(true);
      } catch (error) { showToast(error.message); }
    }
    $("#studio").scrollIntoView({ behavior: "smooth", block: "start" });
  }
