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
      <script>
        // Tenter d'ouvrir l'app
        window.location = "gafapay://pay?link_id=${linkId}";
        
        // Si échec après 2s, ouvrir le store
        setTimeout(function() {
          window.location = "${fallbackUrl}";
        }, 2000);
      </script>
    </head>
    <body>
      <p>Ouverture de GafaPay...</p>
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
