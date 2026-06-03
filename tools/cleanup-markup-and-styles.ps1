$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot

function Read-Text($Path) {
  return [System.IO.File]::ReadAllText($Path, [System.Text.UTF8Encoding]::new($false))
}

function Write-Text($Path, $Text) {
  [System.IO.File]::WriteAllText($Path, $Text, [System.Text.UTF8Encoding]::new($false))
}

function Clean-Html($Path) {
  $text = Read-Text $Path
  $original = $text

  $text = $text -replace "(?m)^\s*<!-- Filkommentar: .*? -->\r?\n", ""
  $text = $text -replace "<!-- Header med top-menu og hovednavigation -->", "<!-- Header -->"
  $text = $text -replace "<!-- Main: sidens primaere indhold starter her\. -->", "<!-- Main -->"
  $text = $text -replace "<!-- Navigation: links og menupunkter til resten af sitet\. -->\r?\n\s*", ""
  $text = $text -replace "\s+>", ">"
  $text = $text -replace "(?m)^(\s*)<ul([^>]*)><li", "`$1<ul`$2>`r`n`$1  <li"

  if ($text -notmatch "<!-- Footer -->\r?\n\s*<footer") {
    $text = $text -replace "(?m)^(\s*)<footer\b", "`$1<!-- Footer -->`r`n`$1<footer"
  }

  if ($text -ne $original) {
    Write-Text $Path $text
  }
}

function Clean-Css($Path) {
  $text = Read-Text $Path
  $original = $text
  $name = [System.IO.Path]::GetFileName($Path)

  $text = $text -replace "(?m)^/\* Filkommentar: .*? \*/\r?\n\r?\n?", ""
  $text = $text -replace "/\* Globale variabler: farver, fonte og storrelser, der genbruges paa sitet\. \*/", "/* Design tokens */"
  $text = $text -replace "/\* Stylingregel: styrer udseende, spacing eller layout for elementerne nedenfor\. \*/", "/* Reset */"
  $text = $text -replace "/\* Styling for HTML-elementet html\. \*/", "/* Base */"
  $text = $text -replace "/\* Styling for HTML-elementet body\. \*/", ""
  $text = $text -replace "/\* Styling for HTML-elementet img\. \*/", "/* Media defaults */"
  $text = $text -replace "/\* Styling for HTML-elementet figure\. \*/", "/* Margin reset */"
  $text = $text -replace "/\* Styling for HTML-elementet ul\. \*/", "/* Lists */"
  $text = $text -replace "/\* Styling for HTML-elementet a\. \*/", "/* Links */"
  $text = $text -replace "/\* Breakpoint: reglerne her justerer layoutet paa bestemte skaermstoerrelser\. \*/", "/* Responsive */"
  $text = $text -replace "/\* Styling for \.menu-dropdown-product-image\. \*/", "/* Image placeholders */"
  $text = $text -replace "/\* Styling for \.header\. \*/", "/* Header */"
  $text = $text -replace "/\* Styling for \.footer\. \*/", "/* Footer */"
  $text = $text -replace "/\* Styling for \.top-menu\. \*/", "/* Top menu */"
  $text = $text -replace "/\* Styling for \.menu\. \*/", "/* Desktop navigation */"
  $text = $text -replace "/\* Styling for \.mobile-menu\. \*/", "/* Mobile menu */"
  $text = $text -replace "/\* Styling for \.cart-badge\. \*/", "/* Cart badge */"

  $text = $text -replace "\r?\n{3,}", "`r`n`r`n"
  $text = $text.TrimEnd() + "`r`n"

  if ($text -ne $original) {
    Write-Text $Path $text
  }
}

function Clean-Js($Path) {
  $text = Read-Text $Path
  $original = $text

  $sectionComments = [ordered]@{
    "function prepareButtonUnderlines" = "// Button underlines"
    "function setupCommunitySignup" = "// Community signup forms"
    "function setupBlogBreadcrumbs" = "// Blog helpers"
    "function setupContactFormValidation" = "// Contact form validation"
    "function setupFooterNewsletterSignup" = "// Footer newsletter"
    "const checkoutForm" = "// Checkout"
    "function openCartDrawer" = "// Cart drawer"
    "function createQuickAddSheet" = "// Quick add and quick view"
    "const relatedPostsContainer" = "// Related blog posts"
  }

  foreach ($key in $sectionComments.Keys) {
    $comment = [regex]::Escape($sectionComments[$key])
    $pattern = "(?m)(?<!$comment\r?\n)^([^\r\n]*" + [regex]::Escape($key) + ")"
    $text = [regex]::Replace($text, $pattern, $sectionComments[$key] + "`r`n`$1", 1)
  }

  $text = $text -replace "\r?\n{3,}", "`r`n`r`n"
  $text = $text.TrimEnd() + "`r`n"

  if ($text -ne $original) {
    Write-Text $Path $text
  }
}

Get-ChildItem $root -Recurse -File -Include *.html |
  Where-Object { $_.FullName -notmatch "\\.git\\" } |
  ForEach-Object { Clean-Html $_.FullName }

Get-ChildItem (Join-Path $root "styles") -File -Filter *.css |
  ForEach-Object { Clean-Css $_.FullName }

Clean-Js (Join-Path $root "scripts\script.js")
