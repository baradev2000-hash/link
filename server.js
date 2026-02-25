import { Hono } from 'hono'
import { serve } from '@hono/node-server'

const app = new Hono()

// Route principale: /link/:id
app.get('/link/:id', (c) => {
  const linkId = c.req.param('id')  // Récupère l'ID depuis l'URL
  const userAgent = c.req.header('user-agent') || ''  // Détecte le device
  
  // Détection Android vs iOS
  const isAndroid = /android/i.test(userAgent)
  const isIOS = /iphone|ipad|ipod/i.test(userAgent)
  
  // URLs des stores
  const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.example.gafa_client'
  const appStoreUrl = 'https://apps.apple.com/us/app/gafapay/id1571936690'
  const fallbackUrl = isIOS ? appStoreUrl : playStoreUrl
  
  // Page HTML avec redirection
  return c.html(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Redirection GafaPay...</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          margin: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        .loader {
          border: 4px solid rgba(255,255,255,0.3);
          border-top: 4px solid white;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .message { font-size: 18px; }
        .store-btn {
          display: none;
          margin-top: 30px;
          padding: 15px 30px;
          background: white;
          color: #667eea;
          border: none;
          border-radius: 25px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          text-decoration: none;
        }
      </style>
      <script>
        var fallbackUrl = "${fallbackUrl}";
        var appOpened = false;
        var fallbackTimer;
        
        // Détecter si l'utilisateur quitte la page (= app ouverte)
        document.addEventListener('visibilitychange', function() {
          if (document.hidden) {
            appOpened = true;
            clearTimeout(fallbackTimer);
          }
        });
        
        // Détecter blur (quand l'app s'ouvre)
        window.addEventListener('blur', function() {
          appOpened = true;
          clearTimeout(fallbackTimer);
        });
        
        // Tenter d'ouvrir l'app
        window.location = "gafapay://pay?link_id=${linkId}";
        
        // Fallback : afficher le bouton store après 2.5s SI l'app ne s'est pas ouverte
        fallbackTimer = setTimeout(function() {
          if (!appOpened) {
            document.getElementById('loader').style.display = 'none';
            document.getElementById('message').textContent = "L'app n'est pas installée";
            document.getElementById('storeBtn').style.display = 'block';
          }
        }, 2500);
      </script>
    </head>
    <body>
      <div id="loader" class="loader"></div>
      <p id="message" class="message">Ouverture de GafaPay...</p>
      <a id="storeBtn" class="store-btn" href="${fallbackUrl}">Télécharger l'app</a>
    </body>
    </html>
  `)
})

// Route de santé (pour Render)
app.get('/', (c) => c.text('GafaPay Link Server OK'))

// Démarrer le serveur
const port = parseInt(process.env.PORT || '3000')
serve({ fetch: app.fetch, port })
console.log(`Serveur démarré sur le port ${port}`)
