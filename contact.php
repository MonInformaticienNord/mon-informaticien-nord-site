<?php
$success = false;
$error = false;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $message = trim($_POST['message'] ?? '');

    if ($name !== '' && filter_var($email, FILTER_VALIDATE_EMAIL) && $message !== '') {
        $to = "support@moninformaticiennord.fr";
        $subject = "Nouveau message depuis le site - $name";
        $body = "Nom : $name\nE-mail : $email\n\nMessage :\n$message";
        $headers = "From: no-reply@moninformaticiennord.fr\r\nReply-To: $email";

        if (mail($to, $subject, $body, $headers)) {
            $success = true;
        } else {
            $error = true;
        }
    } else {
        $error = true;
    }
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Contact – Mon Informaticien Nord</title>
<meta name="description" content="Contactez Mon Informaticien Nord pour un dépannage, un devis ou toute question. Intervention dans la métropole lilloise.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Sora:wght@600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/style.css">
</head>
<body>
<header class="site-header">
  <div class="container header-inner">
    <a href="/index.html" class="logo">
      <img src="/images/logo.png" alt="Mon Informaticien Nord">
    </a>
    <button class="nav-toggle" id="navToggle" aria-label="Ouvrir le menu">
      <span></span><span></span><span></span>
    </button>
    <nav class="main-nav" id="mainNav">
      <ul>
        <li><a href="/index.html">Accueil</a></li>
        <li class="has-dropdown">
          <a href="#" class="dropdown-toggle">Services</a>
          <ul class="dropdown-menu">
            <li><a href="/depannage-particuliers.html">Dépannage particuliers</a></li>
            <li><a href="/depannage-professionnels.html">Dépannage professionnels</a></li>
            <li><a href="/audit-parc-informatique.html">Audit de parc informatique</a></li>
            <li><a href="/creation-site-internet.html">Création de sites internet</a></li>
            <li><a href="/materiel-informatique.html">Vente de matériel</a></li>
            <li><a href="/assistance-ia.html">Assistance IA <span class="badge">bientôt</span></a></li>
            <li><a href="/formation-informatique.html">Formation informatique</a></li>
            <li><a href="/sauvegarde-cloud.html">Sauvegarde cloud</a></li>
          </ul>
        </li>
        <li><a href="/zone-intervention.html">Zone d'intervention</a></li>
        <li><a href="/a-propos.html">À propos</a></li>
        <li><a href="/contact.php" class="nav-cta">Contact</a></li>
      </ul>
    </nav>
  </div>
</header>
<main>

<div class="page-content">
  <h1 class="min-reveal">Contactez Mon Informaticien Nord</h1>
  <p class="min-reveal">Une question, une panne, un devis à demander ? Remplissez le formulaire ci-dessous ou appelez-nous directement.</p>

  <?php if ($success): ?>
    <div class="form-message success">Merci, votre message a bien été envoyé. Nous vous répondrons rapidement.</div>
  <?php elseif ($error): ?>
    <div class="form-message error">Une erreur est survenue. Vérifiez vos informations ou contactez-nous directement par téléphone.</div>
  <?php endif; ?>

  <form class="contact-form min-reveal" method="POST" action="/contact.php">
    <label for="name">Nom complet</label>
    <input type="text" id="name" name="name" required>

    <label for="email">E-mail</label>
    <input type="email" id="email" name="email" required>

    <label for="message">Votre message</label>
    <textarea id="message" name="message" required></textarea>

    <button type="submit" class="btn-primary">Envoyer</button>
  </form>

  <div class="contact-info min-reveal">
    <div><strong>Zone d'intervention</strong>Métropole lilloise</div>
    <div><strong>Horaires</strong>Lundi - Vendredi, 9h - 19h</div>
    <div><strong>Téléphone</strong>07 60 26 63 32</div>
  </div>
</div>

</main>
<footer class="site-footer">
  <div class="container footer-inner">
    <div class="footer-col">
      <img src="/images/logo.png" alt="Mon Informaticien Nord" class="footer-logo">
      <p>Informaticien de proximité dans la métropole lilloise.</p>
    </div>
    <div class="footer-col">
      <h3>Zone d'intervention</h3>
      <p>Métropole lilloise</p>
    </div>
    <div class="footer-col">
      <h3>Contact</h3>
      <p>Téléphone : 07 60 26 63 32<br>Horaires : Lundi - Vendredi, 9h - 19h</p>
    </div>
  </div>
  <div class="footer-bottom">
    <div class="container">&copy; 2026 Mon Informaticien Nord. Tous droits réservés.</div>
  </div>
</footer>
<script src="/js/script.js"></script>
</body>
</html>
