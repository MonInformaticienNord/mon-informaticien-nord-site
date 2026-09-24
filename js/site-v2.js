(function () {
  "use strict";

  // Mobile nav toggle
  var menuToggle = document.querySelector(".v2-menu-toggle");
  var nav = document.querySelector(".v2-nav");
  if (menuToggle && nav) {
    menuToggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") nav.classList.remove("open");
    });
  }

  // Services tabs (Entreprises / Particuliers)
  var tabPro = document.getElementById("tab-pro");
  var tabPart = document.getElementById("tab-part");
  var gridPro = document.getElementById("services-pro");
  var gridPart = document.getElementById("services-part");
  function showAudience(which) {
    var isPro = which === "pro";
    if (tabPro) tabPro.classList.toggle("active", isPro);
    if (tabPart) tabPart.classList.toggle("active", !isPro);
    if (gridPro) gridPro.hidden = !isPro;
    if (gridPart) gridPart.hidden = isPro;
  }
  if (tabPro) tabPro.addEventListener("click", function () { showAudience("pro"); });
  if (tabPart) tabPart.addEventListener("click", function () { showAudience("part"); });

  // Deep links (footer, redirected old pages): #entreprises / #particuliers pick the tab
  function applyAudienceHash() {
    var h = window.location.hash;
    if (h !== "#entreprises" && h !== "#particuliers") return;
    showAudience(h === "#particuliers" ? "part" : "pro");
    var section = document.getElementById("services");
    if (section) section.scrollIntoView();
  }
  applyAudienceHash();
  window.addEventListener("hashchange", applyAudienceHash);

  // FAQ accordion
  var faqItems = document.querySelectorAll(".v2-faq-item");
  faqItems.forEach(function (item) {
    var btn = item.querySelector(".v2-faq-q");
    var icon = item.querySelector(".v2-faq-q i");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var isOpen = item.classList.contains("open");
      faqItems.forEach(function (other) {
        other.classList.remove("open");
        var otherIcon = other.querySelector(".v2-faq-q i");
        if (otherIcon) { otherIcon.classList.remove("ph-minus"); otherIcon.classList.add("ph-plus"); }
        other.querySelector(".v2-faq-q").setAttribute("aria-expanded", "false");
      });
      if (!isOpen) {
        item.classList.add("open");
        btn.setAttribute("aria-expanded", "true");
        if (icon) { icon.classList.remove("ph-plus"); icon.classList.add("ph-minus"); }
      }
    });
  });

  // Needs picker (single-select chips)
  var needButtons = document.querySelectorAll(".v2-need-btn");
  var needInput = document.getElementById("v2-need-value");
  needButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      needButtons.forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      if (needInput) needInput.value = btn.textContent.trim();
    });
  });

  // Contact form — real submission to contact.php, AJAX with graceful fallback
  var form = document.getElementById("v2-contact-form");
  if (form) {
    var submitBtn = form.querySelector(".v2-submit");
    var errorBox = document.getElementById("v2-form-error");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (errorBox) errorBox.style.display = "none";
      var formData = new FormData(form);
      var name = (formData.get("name") || "").toString().trim();
      var email = (formData.get("email") || "").toString().trim();
      var details = (formData.get("details") || "").toString().trim();

      if (!name || !email || !details) {
        if (errorBox) { errorBox.textContent = "Merci de renseigner votre nom, votre e-mail et un message."; errorBox.style.display = "block"; }
        return;
      }

      formData.set("ajax", "1");
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Envoi en cours…"; }

      fetch("/contact.php", { method: "POST", body: formData, headers: { "X-Requested-With": "XMLHttpRequest" } })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (data && data.success) {
            showSent();
          } else {
            throw new Error("send-failed");
          }
        })
        .catch(function () {
          // Fallback: plain form submission (bypasses the submit event, so this won't loop)
          form.submit();
        })
        .finally(function () {
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Être rappelé sous 24 h"; }
        });
    });
  }

  // Service cards: jump to the contact form with that service already filled in
  var lastPrefill = "";
  document.querySelectorAll(".v2-svc-card[data-service]").forEach(function (card) {
    card.addEventListener("click", function () {
      var need = card.getAttribute("data-need");
      var service = card.getAttribute("data-service");
      if (need) {
        needButtons.forEach(function (b) { b.classList.toggle("active", b.textContent.trim() === need); });
        if (needInput) needInput.value = need;
      }
      var details = form && form.querySelector('textarea[name="details"]');
      if (details && (!details.value.trim() || details.value === lastPrefill)) {
        lastPrefill = "Je souhaite être rappelé au sujet de : " + service + ".";
        details.value = lastPrefill;
      }
    });
  });

  function showSent() {
    var notSent = document.getElementById("v2-form-notsent");
    var sent = document.getElementById("v2-form-sent");
    if (notSent) notSent.style.display = "none";
    if (sent) sent.style.display = "flex";
  }
})();
