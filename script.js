document.addEventListener('DOMContentLoaded', function () {

    // Dropdown Navigation Logic
    const cvMenu = document.getElementById('cvMenu');
    if (cvMenu) {
        cvMenu.addEventListener('change', function () {
            const targetId = this.value;
            if (targetId) {
                if (targetId.startsWith('#')) {
                    // Internal Anchor
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        targetElement.scrollIntoView({
                            behavior: 'smooth'
                        });
                    }
                } else {
                    // External Page
                    window.location.href = targetId;
                }
            }
        });
    }

    // INTERSECTION OBSERVER FOR ANIMATIONS & NAV
    const sections = document.querySelectorAll('.page-section');
    const navLinks = document.querySelectorAll('.nav-link');
    const animatedElements = document.querySelectorAll('.section-title, .bubble-card, .hero-content');

    const observerOption = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // Animation Trigger
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');

                // If it's a section, update Nav
                if (entry.target.classList.contains('page-section')) {
                    const id = entry.target.getAttribute('id');
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === '#' + id) {
                            link.classList.add('active');
                        }
                    });
                    if (cvMenu && document.activeElement !== cvMenu) {
                        // Only update dropdown if user isn't currently interacting with it
                        cvMenu.value = '#' + id;
                    }
                }
            }
        });
    }, observerOption);

    // Observe Sections
    sections.forEach(section => {
        observer.observe(section);
    });

    // Observe Animated Elements (Cards, Titles)
    animatedElements.forEach(el => {
        observer.observe(el);
    });
});


// GESTION DU FLUX RSS GOOGLE ALERTS
async function fetchRSS() {
    const rssContainer = document.getElementById('rss-feed-container');
    if (!rssContainer) return;

    // URL du flux RSS Google Alerts (L'utilisateur devra coller la sienne ici)
    // Pour l'instant, on utilise un mot-clé générique Wi-Fi 7 si non configuré
    const googleAlertsRSS = "https://www.google.fr/alerts/feeds/04241121630723426916/16198618668865047737"; // Exemple
    const apiKey = "00000000000000000000000000000000"; // Pas forcément nécessaire pour de petits volumes

    // Utilisation de rss2json pour transformer le XML en JSON et éviter les erreurs CORS
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(googleAlertsRSS)}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.status === 'ok') {
            let html = '<div style="display: flex; flex-direction: column; gap: 1rem;">';
            if (data.items.length === 0) {
                html = "<p style='color: #666;'>Aucune alerte récente trouvée. Google Alerts enverra des actus dès qu'elles seront publiées.</p>";
            } else {
                data.items.slice(0, 5).forEach(item => {
                    html += `
                        <div style="background: #fff; border: 1px solid #ddd; padding: 1rem; border-radius: 6px; border-left: 4px solid var(--primary-color);">
                            <h5 style="margin: 0 0 0.5rem 0; color: #333;">${item.title}</h5>
                            <p style="font-size: 0.85rem; color: #666; margin-bottom: 0.5rem;">${item.description.replace(/<[^>]*>?/gm, '').substring(0, 150)}...</p>
                            <a href="${item.link}" target="_blank" style="font-size: 0.8rem; color: var(--primary-color); font-weight: bold; text-decoration: none;">Lire l'article →</a>
                        </div>
                    `;
                });
            }
            html += '</div>';
            rssContainer.innerHTML = html;
        } else {
            console.error("Détails API RSS:", data.message);
            rssContainer.innerHTML = `<p style='color: #d93025;'>Erreur : ${data.message || "Le flux est vide ou inaccessible"}.</p><p style='font-size:0.8rem;'>Vérifiez que vous avez bien copié TOUT le lien de l'icône orange.</p>`;
        }
    } catch (error) {
        rssContainer.innerHTML = "<p style='color: #666;'>⚠️ Impossible de charger le flux en direct pour le moment. Vérifiez votre connexion.</p>";
        console.error("Erreur RSS:", error);
    }
}

fetchRSS();
