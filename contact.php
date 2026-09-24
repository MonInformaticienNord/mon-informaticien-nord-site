<?php
$success = false;
$error = false;
$isAjax = isset($_POST['ajax']) || (($_SERVER['HTTP_X_REQUESTED_WITH'] ?? '') === 'XMLHttpRequest');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $phone = trim($_POST['phone'] ?? '');
    $company = trim($_POST['company'] ?? '');
    $need = trim($_POST['need'] ?? '');
    $message = trim($_POST['message'] ?? ($_POST['details'] ?? ''));

    if ($name !== '' && filter_var($email, FILTER_VALIDATE_EMAIL) && $message !== '') {
        $to = "support@moninformaticiennord.fr";
        $subject = "Nouveau message depuis le site - $name";
        $bodyLines = ["Nom : $name", "E-mail : $email"];
        if ($phone !== '') $bodyLines[] = "Téléphone : $phone";
        if ($company !== '') $bodyLines[] = "Société : $company";
        if ($need !== '') $bodyLines[] = "Besoin : $need";
        $bodyLines[] = "";
        $bodyLines[] = "Message :";
        $bodyLines[] = $message;
        $body = implode("\n", $bodyLines);
        $headers = "From: no-reply@moninformaticiennord.fr\r\nReply-To: $email";

        if (mail($to, $subject, $body, $headers)) {
            $success = true;
        } else {
            $error = true;
        }
    } else {
        $error = true;
    }

    if ($isAjax) {
        header('Content-Type: application/json');
        echo json_encode(['success' => $success]);
        exit;
    }
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-HKS03S5NMC"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-HKS03S5NMC');
</script>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Contact – Mon Informaticien Nord</title>
<meta name="description" content="Contactez Mon Informaticien Nord pour un dépannage, un devis ou toute question. Intervention dans la métropole lilloise.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/site.css?v=2">
</head>
<body>
<header class="site">
  <div class="wrap row">
    <a class="brand" href="#">
      <img class="brand-logo" src="/images/logo.png" alt="Mon Informaticien Nord">
      <span class="word">Mon Informaticien Nord<small>Métropole lilloise</small></span>
    </a>
    <nav class="main" aria-label="Navigation principale" style="position:relative;">
      <ul id="mainNavList">
        <li><a href="/index.html">Accueil</a></li>
        <li><a href="/index.html#services">Services</a></li>
        <li><a href="/index.html#tarifs">Tarifs</a></li>
        <li><a href="/index.html#zone">Zone d'intervention</a></li>
        <li><a href="/a-propos.html">À propos</a></li>
      </ul>
      <button class="nav-toggle" aria-expanded="false" aria-controls="mainNavList">Menu</button>
    </nav>
    <a class="tel-btn" href="tel:0760266332">07 60 26 63 32</a>
  </div>
</header>

<main>
  <section class="page-hero" style="padding-bottom:56px;">
    <div class="wrap">
      <div class="icon-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg></div>
      <span class="eyebrow">Contact</span>
      <h1 style="margin-top:14px;">Contactez Mon Informaticien Nord</h1>
      <p class="lede">Une question, une panne, un devis à demander&nbsp;? Remplissez le formulaire ci-dessous ou appelez directement.</p>
    </div>
  </section>

  <section style="padding-top:0;">
    <div class="wrap">
      <div class="contact-grid">
        <div class="form-card">
          <?php if ($success): ?>
          <div class="form-message success">Merci, votre message a bien été envoyé. Nous vous répondrons rapidement.</div>
          <?php elseif ($error): ?>
          <div class="form-message error">Une erreur est survenue. Vérifiez vos informations ou contactez-nous directement par téléphone.</div>
          <?php endif; ?>
          <form class="contact-form" method="POST" action="/contact.php">
            <label for="name">Nom complet</label>
            <input type="text" id="name" name="name" required>

            <label for="email">E-mail</label>
            <input type="email" id="email" name="email" required>

            <label for="message">Votre message</label>
            <textarea id="message" name="message" required></textarea>

            <button type="submit" class="btn btn-primary">Envoyer le message</button>
          </form>
        </div>

        <div class="info-card">
          <div class="info-row">
            <div class="f-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-6.6 7-12a7 7 0 1 0-14 0c0 5.4 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/></svg></div>
            <div><strong>Zone d'intervention</strong><span>Métropole lilloise</span></div>
          </div>
          <div class="info-row">
            <div class="f-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg></div>
            <div><strong>Horaires</strong><span>Lundi – Vendredi, 9h – 19h</span></div>
          </div>
          <div class="info-row">
            <div class="f-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L14 13l5 2v4a2 2 0 0 1-2 2C9.5 21 3 14.5 3 6a2 2 0 0 1 1-2z"/></svg></div>
            <div><strong>Téléphone</strong><span><a href="tel:0760266332">07 60 26 63 32</a></span></div>
          </div>
        </div>
      </div>
    </div>
  </section>
</main>

<footer class="site">
  <div class="wrap footer-inner">
    <div class="footer-col">
      <span class="footer-logo-badge"><img src="/images/logo.png" alt="Mon Informaticien Nord" style="height:24px;display:block;"></span>
      <h3>Mon Informaticien Nord</h3>
      <p>Informaticien de proximité dans la métropole lilloise.</p>
    </div>
    <div class="footer-col">
      <h3>Zone d'intervention</h3>
      <p>Lille, Roubaix, Tourcoing, Villeneuve-d'Ascq, Marcq-en-Barœul, Wattrelos et alentours.</p>
      <p><a href="/index.html#zone">Voir la zone d'intervention →</a></p>
    </div>
    <div class="footer-col">
      <h3>Contact</h3>
      <p><a href="tel:0760266332">07 60 26 63 32</a></p>
      <p><a href="/contact.php">Formulaire de contact</a></p>
    </div>
    <div class="footer-col">
      <h3>Horaires</h3>
      <ul class="hours-list">
        <li><span>Lundi – Vendredi</span><span>9h – 19h</span></li>
        <li><span>Samedi</span><span>Fermé</span></li>
        <li><span>Dimanche</span><span>Fermé</span></li>
      </ul>
    </div>
  </div>
  <div class="footer-bottom">&copy; 2026 Mon Informaticien Nord — Hem (59) — 07 60 26 63 32</div>
</footer>

<script>
  var toggle = document.querySelector('.dropdown-toggle');
  var dropdownParent = document.querySelector('.has-dropdown');
  if(toggle){
    toggle.addEventListener('click', function(e){
      e.stopPropagation();
      var open = dropdownParent.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('click', function(e){
      if(!dropdownParent.contains(e.target)){
        dropdownParent.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape'){
        dropdownParent.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }
  var navToggle = document.querySelector('.nav-toggle');
  var navList = document.getElementById('mainNavList');
  if(navToggle && navList){
    navToggle.addEventListener('click', function(){
      var open = navList.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }
</script>
</body>
</html>
