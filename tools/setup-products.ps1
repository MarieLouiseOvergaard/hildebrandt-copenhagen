$ErrorActionPreference = "Stop"

$prefix = "../../"

$csv = @'
category|slug|name|title|image|alt|description|price|size|use|good|effect|ingredient
startpakker|startpakke-1|Startpakke 1||img/produktbilleder/MIXLY-Low-Refresh-Shampoo-1000.png|Startpakke 1|Den komplette Mixly-rutine til dig, der vil arbejde med både fugt, pleje og styling.|1.194 kr.|8 produkter||||
startpakker|startpakke-2|Startpakke 2||img/produktbilleder/MIXLY-Rich-Deep-Drink-Conditioner-200.png|Startpakke 2|En blød og enkel rutine til dig, der ønsker fugt, pleje og let støtte til krøllerne.|856 kr.|8 produkter||||
startpakker|startpakke-3|Startpakke 3||img/produktbilleder/MIXLY-Curl-Gel.png|Startpakke 3|Til dig, der ønsker mere definition, styling og hold i dine krøller og bølger.|865 kr.|8 produkter||||
saet|rich-low-intensive-care-for-curly-ends|Rich + Low Intensive Care for Curly Ends||img/produktbilleder/Rich-Intensive-Care-1.png|Rich + Low Intensive Care for Curly Ends|Intensiv pleje til spidserne med fugt, beskyttelse og mere modstandsdygtighed.|218 kr.|30 ml + 50 ml||||
saet|rich-low-curly-conditioner-bars-orange-sensitive|Rich + Low Curly Conditioner Bars Orange Sensitive||img/produktbilleder/Rich-Curly-Conditioner-Bar-Orange-1.png|Rich + Low Curly Conditioner Bars Orange Sensitive|Conditioner bars, der hjælper krøller med fugt, styrke og naturlig glans.|198 kr|2 X 75 g||||
saet|rich-morning-low-sea-mist-barrier|Rich Morning + Low Sea Mist Barrier||img/produktbilleder/Rich-Curly-Morning-Mist-Barrier-1.png|Rich Morning + Low Sea Mist Barrier|Mists til opfriskning, fylde og beskyttelse af krøller og bølger i hverdagen.|438 kr.|2 x 150 ml||||
saet|low-rich-curly-shampoo-bar-sensitive|Low + Rich Curly Shampoo Bar Sensitive||img/produktbilleder/Low-Curly-Shampoo-Bar-Sensitive-1.png|Low + Rich Curly Shampoo Bar Sensitive|Shampoo bars, der hjælper krøller med fugt, blødhed og mindre frizz.|198 kr.|2 X 85 g||||
saet|low-rich-shampoo|Low + Rich Shampoo||img/produktbilleder/Low-Shampoo-1.png|Low + Rich Shampoo|Parfumefri shampoos, der hjælper krøller med balance, fugt og beskyttelse.|298 kr.|2 x 250 ml||||
saet|rich-low-shampoo|Rich + Low Shampoo||img/produktbilleder/MIXLY-Rich-Repair-Shampoo-100.png|Rich + Low Shampoo|Shampooer, der hjælper hovedbund og krøller med balance, fugt og mindre frizz.|220 kr / 758 kr|2 X 100 ml / 2 x 1000 ml||||
saet|low-rich-conditioner|Low + Rich Conditioner||img/produktbilleder/Low-Conditioner-1.png|Low + Rich Conditioner|Conditioners, der hjælper krøller med fugt, lethed og naturlig bevægelse.|318 kr / 798 kr|2 X 100 ml / 2 x 1000 ml||||
shampoo|rich-repair-cleansing-shampoo|Rich Repair Cleansing Shampoo||img/produktbilleder/MIXLY-Rich-Repair-Shampoo-100.png|Rich Repair Cleansing Shampoo|Giver mere næring og ro til krøller, der føles tørre, frizzede eller medtagne.|Fra 110 kr.|3 størrelser|Fordel i vådt hår, massér og skyl grundigt.|Tørre, krusede eller medtagne krøller.|Mere næring, styrke og mindre frizz.||
shampoo|low-refresh-cleansing-shampoo|Low Refresh Cleansing Shampoo||img/produktbilleder/MIXLY-Low-Refresh-Shampoo-100.png|Low Refresh Cleansing Shampoo|Renser skånsomt og hjælper krøller med at bevare fugt, lethed og spændstighed.|Fra 110 kr.|2 størrelser|Massér i vådt hår og skyl grundigt.|Fint hår, bølger og krøller der let tynges.|Renser let og bevarer bevægelse.||
shampoo|low-shampoo|Low Shampoo||img/produktbilleder/Low-Shampoo-1.png|Low Shampoo|Skånsom shampoo til fint bølget eller krøllet hår med en sensitiv hovedbund.|149,00 kr.|250ml||||
shampoo|curly-charcoal-calm-shampoo|Curly Charcoal Calm Shampoo||img/produktbilleder/Mixly-Curly-Charcoal-Calm-200-ml.-2.png|Curly Charcoal Calm Shampoo|Rensende shampoo med aktivt kul, som hjælper med at fjerne produktrester.|Fra 89 kr.|2 størrelser||||
shampoo|rich-curly-shampoo-bar-sensitive|Rich Curly Shampoo Bar Sensitive||img/produktbilleder/Rich-Curly-Shampoo-Bar-Sensitive-1.png|Rich Curly Shampoo Bar Sensitive|Plejende shampoo bar, der giver tørre krøller mere blødhed og næring.|99 kr.|85g||||
shampoo|low-curly-shampoo-bar-sensitive|Low Curly Shampoo Bar Sensitive||img/produktbilleder/Low-Curly-Shampoo-Bar-Sensitive-1.png|Low Curly Shampoo Bar Sensitive|Skånsom shampoo bar, der hjælper sensitiv hovedbund med fugt og balance.|99 kr.|85g||||
conditioner|rich-deep-drink-conditioner|Rich Deep Drink Conditioner||img/produktbilleder/MIXLY-Rich-Deep-Drink-Conditioner-200.png|Rich Deep Drink Conditioner|Conditioner med intens fugt, der hjælper tørre krøller med mere blødhed og ro.|Fra 159 kr.|2 størrelser|Fordel i længderne efter shampoo og skyl.|Tørre krøller der mangler fugt og ro.|Blødhed, glans og mindre frizz.||
conditioner|mixly-low-conditioner|Low Conditioner|Mixly Low Conditioner|img/produktbilleder/Low-Conditioner-1.png|Low Conditioner|Let conditioner, der hjælper krøller med styrke og bevægelse uden at tynge.|Fra 159 kr.|2 størrelser|Fordel i nyvasket, vådt hår og skyl grundigt.|Fine krøller, bølger eller hår der let bliver tynget.|Fugt, styrke og naturlig lethed.|img/ingredienser/Ingrediens-MIXLY-Low-Conditioner-1000.png
conditioner|low-curly-conditioner-bar-sensitive|Low Curly Conditioner Bar Sensitive||img/produktbilleder/Low-Curly-Conditioner-Bar-Sensitive-1.png|Low Curly Conditioner Bar Sensitive|Let conditioner bar, der hjælper fine krøller med fugt og balance uden at fedte.|99 kr.|75 g||||
conditioner|rich-curly-conditioner-bar-orange|Rich Curly Conditioner Bar Orange||img/produktbilleder/Rich-Curly-Conditioner-Bar-Orange-1.png|Rich Curly Conditioner Bar Orange|Plejende conditioner bar, der hjælper tørre krøller med glans og fugtbalance.|99 kr.|75 g||||
conditioner|low-leave-in-conditioner|Low Leave-In Conditioner||img/produktbilleder/Low-Leave-In-Conditioner (1).png|Low Leave-In Conditioner|Let leave-in conditioner, der giver fugt og beskyttelse uden at tynge krøllerne.|169 kr.|150 ml||||
conditioner|rich-leave-in-conditioner|Rich Leave-In Conditioner||img/produktbilleder/Mixly-Rich-Leave-In-Conditioner (1).png|Rich Leave-In Conditioner|Leave-in conditioner, der hjælper tørre krøller med fugt, ro og mindre frizz.|169 kr.|150 ml||||
haarmasker|rich-intensive-care-for-curly-ends|Rich Intensive Care for Curly Ends||img/produktbilleder/Rich-Intensive-Care-1.png|Rich Intensive Care for Curly Ends|Intensiv pleje til tørre spidser, der hjælper krøller med mere beskyttelse og blødhed.|89 kr.|50 ml||||
haarmasker|low-intensive-care-for-curly-ends|Low Intensive Care for Curly Ends||img/produktbilleder/Low-Intensive-Care-1.png|Low Intensive Care for Curly Ends|Let olie til spidserne, der hjælper krøller med fugt og daglig beskyttelse.|129 kr.|30 ml||||
haarmasker|rich-curly-moisturizing-treatment-mask|Rich Curly Moisturizing Treatment Mask||img/produktbilleder/Mixly-Rich-Curly-Moisturizing-Treatment-Mask-1.png|Rich Curly Moisturizing Treatment Mask|Fugtmaske til tørre krøller, der hjælper med blødhed, ro og mindre frizz.|219 kr.|120 ml||||
haarmasker|low-curly-protein-treatment-tea|Low Curly Protein Treatment Tea||img/produktbilleder/Low-Curly-Protein-Treatment-Tea-1.png|Low Curly Protein Treatment Tea|Proteinpleje, der hjælper trætte krøller med mere styrke og spændstighed|219 kr.|30 g||||
styling|rich-curl-cream|Rich Curl Cream||img/produktbilleder/Mixly-Curl-Cream.png|Rich Curl Cream|Curl cream, der hjælper krøller med mere definition, blødhed og mindre frizz.|169 kr.|150 ml||||
styling|low-refiner-curl-gel|Low Refiner Curl Gel||img/produktbilleder/MIXLY-Curl-Gel.png|Low Refiner Curl Gel|Let curl gel, der hjælper krøller med hold og definition uden stivhed.|169 kr.|150 ml||||
styling|low-curly-sea-mist-barrier|Low Curly Sea Mist Barrier||img/produktbilleder/Low-Curly-Sea-Mist-Barrier-1.png|Low Curly Sea Mist Barrier|Sea mist, der hjælper fine krøller med mere fylde, struktur og let hold.|219 kr.|150 ml||||
styling|rich-curly-morning-mist-barrier|Rich Curly Morning Mist Barrier||img/produktbilleder/Rich-Curly-Morning-Mist-Barrier-1.png|Rich Curly Morning Mist Barrier|Opfriskende mist, der hjælper krøller med mere ro, definition og mindre frizz.|219 kr.|150 ml||||
styling|rich-curly-rice-infusion-oil|Rich Curly Rice Infusion Oil||img/produktbilleder/mixly-Rich-Curly-Rice-Infusion-Oil-30-ml-2.png|Rich Curly Rice Infusion Oil|Giver mere næring og ro til krøller, der føles tørre, frizzede eller medtagne.|159 kr.|30 ml||||
'@

$products = $csv | ConvertFrom-Csv -Delimiter "|"

function Encode-Html([string] $value) {
  if ($null -eq $value) { return "" }
  $value.Replace("&", "&amp;").Replace("<", "&lt;").Replace(">", "&gt;").Replace('"', "&quot;")
}

function Get-ProductPath($product) {
  "products/$($product.category)/$($product.slug).html"
}

function Get-SizeOptions($product) {
  switch ($product.slug) {
    "rich-repair-cleansing-shampoo" { @(@{label="100 ml"; price="110 kr."}, @{label="250 ml"; price="299 kr."}, @{label="1000 ml"; price="379 kr."}) }
    "low-refresh-cleansing-shampoo" { @(@{label="100 ml"; price="110 kr."}, @{label="1000 ml"; price="379 kr."}) }
    "mixly-low-conditioner" { @(@{label="250 ml"; price="159 kr."}, @{label="1000 ml"; price="399 kr."}) }
    "rich-deep-drink-conditioner" { @(@{label="200 ml"; price="159 kr."}, @{label="1000 ml"; price="399 kr."}) }
    default { @() }
  }
}

function New-SizeMarkup($product) {
  $sizes = @(Get-SizeOptions $product)

  if ($sizes.Count -gt 1) {
    $buttons = ($sizes | ForEach-Object {
      "            <button class=""produkt-skabelon-size"" type=""button"" data-product-price=""$(Encode-Html $_.price)"">$(Encode-Html $_.label)</button>"
    }) -join "`n"

    return @"
        <fieldset class="produkt-skabelon-size-group">
          <legend class="produkt-skabelon-visually-hidden">Vælg størrelse</legend>
          <div class="produkt-skabelon-size-options">
$buttons
          </div>
        </fieldset>
"@
  }

  if ($product.size -match "størrelser") {
    return "        <!-- TODO: Eksisterende ml-valg mangler for dette produkt, selvom produktkortet angiver flere størrelser. -->"
  }

  return ""
}

function New-TagsMarkup($product) {
  if ($product.slug -notin @("rich-repair-cleansing-shampoo", "low-refresh-cleansing-shampoo", "mixly-low-conditioner", "rich-deep-drink-conditioner")) {
    return "        <!-- TODO: Eksisterende produkt-tags mangler for dette produkt. -->"
  }

@"
        <ul class="produkt-skabelon-tags" aria-label="Produkt-tags">
          <li>Økologisk</li>
          <li>Vegansk</li>
          <li>Parfumefri</li>
          <li>Unisex</li>
        </ul>
"@
}

function New-AccordionMarkup($product) {
  $items = @()
  $items += @{title="Sådan bruges produktet"; text=$(if ($product.use) { $product.use } else { "xx" })}
  $items += @{title="Effekt"; text=$(if ($product.effect) { $product.effect } else { "xx" })}
  $items += @{title="Ingredienser & produktinfo"; text=$(if ($product.ingredient) { "Vegansk, parfumefri og udviklet til krøller og bølger, der har brug for let pleje." } else { "xx" })}

  $details = ($items | ForEach-Object {
@"
          <details class="produkt-skabelon-accordion">
            <summary class="produkt-skabelon-accordion-button">
              <span>$(Encode-Html $_.title)</span>
              <span aria-hidden="true">⌄</span>
            </summary>
            <div class="produkt-skabelon-accordion-panel">
              <p>$(Encode-Html $_.text)</p>
            </div>
          </details>
"@
  }) -join "`n"

@"
        <div class="produkt-skabelon-accordions">
$details
        </div>
"@
}

function New-RelatedMarkup($currentProduct) {
  $related = @($products | Where-Object { $_.slug -ne $currentProduct.slug } | Select-Object -First 5)
  $cards = ($related | ForEach-Object {
    $href = "$prefix$(Get-ProductPath $_)"
@"
        <article class="produkt-skabelon-related-card">
          <a href="$href" aria-label="$(Encode-Html $_.name)">
            <div class="produkt-skabelon-related-image">
              <img src="$prefix$($_.image)" alt="$(Encode-Html $_.alt)">
            </div>
            <h3>$(Encode-Html $_.name)</h3>
            <p>$(Encode-Html $_.price)</p>
          </a>
        </article>
"@
  }) -join "`n"

@"
    <section class="produkt-skabelon-related" aria-labelledby="produkt-skabelon-related-title">
      <h2 id="produkt-skabelon-related-title">Måske kan du også lide</h2>
      <div class="produkt-skabelon-related-grid">
$cards
      </div>
    </section>
"@
}

function New-ProductPage($product) {
  $displayTitle = if ($product.title) { $product.title } else { $product.name }
  $image = "$prefix$($product.image)"
  $sizeMarkup = New-SizeMarkup $product
  $tagsMarkup = New-TagsMarkup $product
  $accordionMarkup = New-AccordionMarkup $product
  $relatedMarkup = New-RelatedMarkup $product
  $ingredientMarkup = if ($product.ingredient) {
@"
      <div class="produkt-skabelon-image produkt-skabelon-image-secondary" aria-label="Ingredienssektion">
        <img class="produkt-skabelon-ingredient-image" src="$prefix$($product.ingredient)" alt="Ingredienser i $(Encode-Html $displayTitle)">
      </div>
"@
  } else {
@"
      <div class="produkt-skabelon-image produkt-skabelon-image-secondary produkt-skabelon-image-secondary-placeholder" aria-label="Ingredienssektion">
        <span class="produkt-skabelon-image-label">IMG</span>
      </div>
"@
  }
  $useText = if ($product.use) { $product.use } else { "xx" }
  $goodText = if ($product.good) { $product.good } else { "xx" }
  $effectText = if ($product.effect) { $product.effect } else { "xx" }
  $useMarkup = "        <div class=""produkt-skabelon-spec-row""><dt>Anvendelse</dt><dd>$(Encode-Html $useText)</dd></div>"
  $goodMarkup = "        <div class=""produkt-skabelon-spec-row""><dt>God til</dt><dd>$(Encode-Html $goodText)</dd></div>"
  $effectMarkup = "        <div class=""produkt-skabelon-spec-row""><dt>Effekt</dt><dd>$(Encode-Html $effectText)</dd></div>"

@"
<!DOCTYPE html>
<html lang="da">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>$(Encode-Html $displayTitle) - Hildebrandt Copenhagen</title>
  <link rel="stylesheet" href="${prefix}styles/global.css">
  <link rel="stylesheet" href="${prefix}styles/header.css">
  <link rel="stylesheet" href="${prefix}styles/footer.css">
  <link rel="stylesheet" href="${prefix}styles/produkt-skabelon.css">
</head>
<body class="produkt-skabelon-page">
  <header class="header">
    <div class="top-menu">
      <a class="book-knap" href="${prefix}kontakt.html" aria-label="Book tid">Book tid</a>
      <a class="menu-logo-link top-menu-logo" href="${prefix}index.html" aria-label="Gå til forsiden">
        <img class="menu-logo top-menu-logo-image" src="${prefix}img/logo/monogramLysgraa.svg" alt="Hildebrandt Copenhagen monogram">
      </a>

      <nav class="top-nav" aria-label="Hjælpenavigation">
        <ul class="top-nav-list">
          <li class="top-nav-item">
            <a class="top-nav-link top-nav-link-cart" href="#" aria-label="Kurv"><img class="top-nav-icon top-nav-icon-cart" src="${prefix}img/ikoner/kurv.svg" alt=""></a>
          </li>
          <li class="top-nav-item top-nav-item-menu">
            <button class="top-nav-link menu-toggle" type="button" aria-label="Menu" aria-expanded="false" aria-controls="mobile-menu"></button>
          </li>
        </ul>
      </nav>
    </div>

    <nav class="menu" aria-label="Hovednavigation">
      <ul class="menu-list">
        <li class="menu-item menu-item-dropdown">
          <a class="menu-link menu-link-dropdown menu-link-active" href="${prefix}produkter.html" aria-haspopup="true" aria-current="page">
            Produkter
            <span class="menu-link-arrow" aria-hidden="true">⌄</span>
          </a>
          <div class="menu-dropdown" aria-label="Produktmenu">
            <div class="menu-dropdown-inner">
              <nav class="menu-dropdown-column" aria-label="Produktoversigt">
                <ul class="menu-dropdown-list">
                  <li class="menu-dropdown-item"><a class="menu-dropdown-link" href="${prefix}produkter.html">Startpakke</a></li>
                  <li class="menu-dropdown-item"><a class="menu-dropdown-link" href="${prefix}produkter.html">Sæt</a></li>
                  <li class="menu-dropdown-item"><a class="menu-dropdown-link" href="${prefix}produkter.html">Alle produkter</a></li>
                </ul>
              </nav>
              <nav class="menu-dropdown-column" aria-label="Produkttyper">
                <ul class="menu-dropdown-list">
                  <li class="menu-dropdown-item"><a class="menu-dropdown-link" href="${prefix}produkter.html">Shampoo</a></li>
                  <li class="menu-dropdown-item"><a class="menu-dropdown-link" href="${prefix}produkter.html">Conditioner</a></li>
                  <li class="menu-dropdown-item"><a class="menu-dropdown-link" href="${prefix}produkter.html">Hårmaske</a></li>
                  <li class="menu-dropdown-item"><a class="menu-dropdown-link" href="${prefix}produkter.html">Styling</a></li>
                </ul>
              </nav>
              <div class="menu-dropdown-products">
                <a class="menu-dropdown-product" href="${prefix}produkter.html">
                  <span class="menu-dropdown-product-image">165 x 195</span>
                  <span class="menu-dropdown-product-title">Klar til at komme i gang?</span>
                </a>
                <a class="menu-dropdown-product" href="${prefix}produkter.html">
                  <span class="menu-dropdown-product-image">165 x 195</span>
                  <span class="menu-dropdown-product-title">Lær produkterne at kende</span>
                </a>
              </div>
            </div>
          </div>
        </li>
        <li class="menu-item">
          <a class="menu-link" href="${prefix}behandlinger.html">Behandlinger</a>
        </li>
        <li class="menu-item menu-item-dropdown">
          <a class="menu-link menu-link-dropdown" href="${prefix}kroelleunivers.html" aria-haspopup="true">
            Krølleunivers
            <span class="menu-link-arrow" aria-hidden="true">⌄</span>
          </a>
          <div class="menu-dropdown" aria-label="Krølleuniversmenu">
            <div class="menu-dropdown-inner">
              <nav class="menu-dropdown-column" aria-label="Krølleunivers">
                <ul class="menu-dropdown-list">
                  <li class="menu-dropdown-item"><a class="menu-dropdown-link" href="${prefix}kroelleunivers.html">Krøllefilosofi</a></li>
                  <li class="menu-dropdown-item"><a class="menu-dropdown-link" href="${prefix}guides.html">Guides</a></li>
                  <li class="menu-dropdown-item"><a class="menu-dropdown-link" href="#">Blog</a></li>
                </ul>
              </nav>
              <div class="menu-dropdown-column" aria-hidden="true"></div>
              <div class="menu-dropdown-products">
                <a class="menu-dropdown-product" href="${prefix}kroelleunivers.html">
                  <span class="menu-dropdown-product-image">165 x 195</span>
                  <span class="menu-dropdown-product-title">Lær dine krøller at kende</span>
                </a>
                <a class="menu-dropdown-product" href="${prefix}guides.html">
                  <span class="menu-dropdown-product-image">165 x 195</span>
                  <span class="menu-dropdown-product-title">Udforsk guides</span>
                </a>
              </div>
            </div>
          </div>
        </li>
        <li class="menu-item">
          <a class="menu-link" href="${prefix}omos.html">Din Krøllefrisør</a>
        </li>
        <li class="menu-item">
          <a class="menu-link" href="${prefix}kontakt.html">Kontakt</a>
        </li>
      </ul>
    </nav>
  </header>

  <div id="mobile-menu" class="mobile-menu" aria-hidden="true">
    <div class="mobile-menu-panel mobile-menu-panel-main" data-mobile-panel="main">
      <div class="mobile-menu-header">
        <p class="mobile-menu-title">Menu</p>
        <button class="mobile-menu-close" type="button" aria-label="Luk menu">×</button>
      </div>

      <nav class="mobile-menu-nav" aria-label="Mobilnavigation">
        <ul class="mobile-menu-list">
          <li class="mobile-menu-item">
            <button class="mobile-menu-link mobile-menu-link-products" type="button">
              Produkter
              <span class="mobile-menu-arrow" aria-hidden="true">›</span>
            </button>
          </li>
          <li class="mobile-menu-item"><a class="mobile-menu-link" href="${prefix}behandlinger.html">Behandlinger</a></li>
          <li class="mobile-menu-item"><a class="mobile-menu-link" href="${prefix}kroelleunivers.html">Krølleunivers</a></li>
          <li class="mobile-menu-item"><a class="mobile-menu-link" href="${prefix}guides.html">Guides</a></li>
          <li class="mobile-menu-item"><a class="mobile-menu-link" href="${prefix}omos.html">Din krøllefrisør</a></li>
          <li class="mobile-menu-item"><a class="mobile-menu-link" href="${prefix}kontakt.html">Kontakt</a></li>
        </ul>
      </nav>
    </div>

    <div class="mobile-menu-panel mobile-menu-panel-products" data-mobile-panel="products">
      <div class="mobile-menu-header">
        <button class="mobile-menu-back" type="button" aria-label="Tilbage til menu">‹</button>
        <p class="mobile-menu-title">Produkter</p>
      </div>

      <div class="mobile-menu-scroll">
        <nav class="mobile-menu-nav" aria-label="Produktnavigation">
          <ul class="mobile-menu-list mobile-menu-product-list">
            <li class="mobile-menu-item"><a class="mobile-menu-link" href="${prefix}produkter.html">Startpakke</a></li>
            <li class="mobile-menu-item"><a class="mobile-menu-link" href="${prefix}produkter.html">Sæt</a></li>
            <li class="mobile-menu-item"><a class="mobile-menu-link" href="${prefix}produkter.html">Shampoo</a></li>
            <li class="mobile-menu-item"><a class="mobile-menu-link" href="${prefix}produkter.html">Conditioner</a></li>
            <li class="mobile-menu-item"><a class="mobile-menu-link" href="${prefix}produkter.html">Hårmaske</a></li>
            <li class="mobile-menu-item"><a class="mobile-menu-link" href="${prefix}produkter.html">Styling</a></li>
            <li class="mobile-menu-item"><a class="mobile-menu-link" href="${prefix}produkter.html">Alle produkter</a></li>
            <li class="mobile-menu-item mobile-menu-feature-item"><a class="mobile-menu-link mobile-menu-feature-link" href="${prefix}produkter.html">Lær produkterne at kende</a></li>
          </ul>
        </nav>

        <div class="mobile-menu-feature">
          <div class="mobile-menu-feature-image" aria-hidden="true"></div>
        </div>
      </div>
    </div>
  </div>

  <main id="produkt-skabelon" class="produkt-skabelon-main">
    <section class="produkt-skabelon-hero" aria-labelledby="produkt-skabelon-title">
      <div class="produkt-skabelon-image produkt-skabelon-image-hero" aria-label="Produktbillede">
        <img src="$image" alt="$(Encode-Html $product.alt)">
      </div>
      <div class="produkt-skabelon-summary">
        <h1 id="produkt-skabelon-title">$(Encode-Html $displayTitle)</h1>
        <p class="produkt-skabelon-price" data-product-page-price>$(Encode-Html $product.price)</p>
$sizeMarkup
        <button class="button button-secondary produkt-skabelon-buy" type="button">Tilføj til kurv</button>
$tagsMarkup
        <p class="produkt-skabelon-description">$(Encode-Html $product.description)</p>
$accordionMarkup
        <!-- TODO: Eksisterende produktdetaljer ud over produktkort-data mangler for dette produkt, hvis de ikke er udfyldt nedenfor. -->
      </div>
    </section>

    <section class="produkt-skabelon-details" aria-labelledby="produkt-skabelon-details-title">
      <h2 id="produkt-skabelon-details-title" class="produkt-skabelon-visually-hidden">Produktdetaljer</h2>
$ingredientMarkup
      <dl class="produkt-skabelon-specs">
        <div class="produkt-skabelon-spec-row"><dt>Størrelse</dt><dd>$(Encode-Html $product.size)</dd></div>
$useMarkup
$goodMarkup
$effectMarkup
      </dl>
    </section>

    <section class="produkt-skabelon-low-rich" aria-labelledby="produkt-skabelon-low-rich-title">
      <p class="eyebrow produkt-skabelon-section-label">Forstå forskellen</p>
      <h2 id="produkt-skabelon-low-rich-title">Low & Rich</h2>
      <div class="produkt-skabelon-low-rich-placeholder">
        <div class="produkt-skabelon-low-rich-visual" aria-hidden="true">
          <div class="produkt-skabelon-low-rich-row produkt-skabelon-low-rich-row-low"><div class="produkt-skabelon-low-rich-product produkt-skabelon-low-rich-product-low"></div><div><span>Mere low</span><p>Til tunge, flade eller overplejede krøller</p></div></div>
          <div class="produkt-skabelon-low-rich-balance"><span>Balance</span><i></i><p>Til hverdag og stabil rutine</p></div>
          <div class="produkt-skabelon-low-rich-row produkt-skabelon-low-rich-row-rich"><div><span>Mere rich</span><p>Til tørre, krusede eller trætte krøller</p></div><div class="produkt-skabelon-low-rich-product produkt-skabelon-low-rich-product-rich"></div></div>
        </div>
      </div>
      <div class="produkt-skabelon-low-rich-actions"><a class="button button-secondary produkt-skabelon-low-rich-cta" href="${prefix}kroelleunivers.html">Læs om metoden</a></div>
    </section>

$relatedMarkup
  </main>

  <footer class="footer">
    <section class="footer-kontakt" aria-labelledby="footer-kontakt-titel">
      <h2 id="footer-kontakt-titel" class="footer-kontakt-titel">Kontakt</h2>
      <address class="footer-kontakt-adresse">Hildebrandt Copenhagen x Mixly<br>+45 30 74 34 30<br>Nørre Fasanvej 163<br>2000 Frederiksberg<br>hej@hildebrandtcopenhagen.dk</address>
      <a class="book-knap footer-booking" href="${prefix}kontakt.html">Book tid</a>
    </section>
    <section class="footer-tider" aria-labelledby="footer-tider-titel"><h2 id="footer-tider-titel" class="footer-tider-titel">Åbningstider</h2><dl class="footer-tider-liste"><dt>Mandag</dt><dd>8:30-14:00</dd><dt>Tirsdag</dt><dd>10:00-17:30</dd><dt>Onsdag</dt><dd>Lukket</dd><dt>Torsdag</dt><dd>10:00-17:30</dd><dt>Fredag</dt><dd>10:00-16:00</dd></dl></section>
    <nav class="footer-menu" aria-labelledby="footer-menu-titel"><h2 id="footer-menu-titel" class="footer-menu-titel">Udforsk</h2><ul class="footer-menu-liste"><li class="footer-menu-item"><a class="footer-menu-link" href="${prefix}kontakt.html">Book tid</a></li><li class="footer-menu-item"><a class="footer-menu-link" href="${prefix}produkter.html">Produkter</a></li><li class="footer-menu-item"><a class="footer-menu-link" href="${prefix}guides.html">Krølleguide</a></li><li class="footer-menu-item"><a class="footer-menu-link" href="${prefix}omos.html">Din krøllefrisør</a></li></ul></nav>
  </footer>
  <script src="${prefix}script.js"></script>
</body>
</html>
"@
}

foreach ($product in $products) {
  $dir = Join-Path (Get-Location) "products/$($product.category)"
  New-Item -ItemType Directory -Force -Path $dir | Out-Null
  Set-Content -Path (Join-Path $dir "$($product.slug).html") -Value (New-ProductPage $product) -Encoding UTF8
}

$htmlPath = Join-Path (Get-Location) "produkter.html"
$html = [System.IO.File]::ReadAllText($htmlPath, [System.Text.Encoding]::UTF8)
foreach ($product in $products) {
  $href = Get-ProductPath $product
  $namePattern = [regex]::Escape($product.name)
  $html = [regex]::Replace($html, "<h4>$namePattern</h4>", "<h4><a href=""$href"">$($product.name)</a></h4>")
}
$html = $html.Replace('href="mixly-low-conditioner-250ml.html"', 'href="products/conditioner/mixly-low-conditioner.html"')
$html = $html.Replace('aria-label="Se Mixly Low Conditioner 250 ml"', 'aria-label="Se Mixly Low Conditioner"')
[System.IO.File]::WriteAllText($htmlPath, $html, [System.Text.UTF8Encoding]::new($false))

$products | ForEach-Object { Get-ProductPath $_ }
