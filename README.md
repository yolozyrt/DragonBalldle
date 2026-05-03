# DBDle

MVP classique jouable localement avec HTML, CSS et JavaScript vanilla.

## Lancement

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Arborescence

- `index.html` : mode Classic principal
- `modes/classic.html` : page Classic alternative
- `modes/infinity.html` : mode Infinity avec relance illimitée
- `modes/quote.html` : futur mode
- `modes/silhouette.html` : futur mode
- `assets/css/` : styles globaux et composants
- `src/` : logique, accès données, rendu et composants UI
- `supabase/schema.sql` : schéma SQL pour migrer les persos dans Supabase
- `supabase/contact.sql` : table et policies SQL pour les messages du bouton Nous contacter

## Fonctionnement

- Le personnage du jour est déterminé en UTC à partir de la date du jour.
- Les essais sont sauvegardés dans `localStorage` avec les clés `dbdle:classic:YYYY-MM-DD` et `dbdle:stats` pour le mode classique.
- Le mode Infinity utilise `dbdle:infinity:current` et `dbdle:infinity:stats` pour garder la partie en cours et les statistiques séparément.
- Les alias sont pris en compte dans l'autocomplete et la sélection d'un personnage.

## Supabase

Si tu veux stocker la liste des persos dans Supabase, exécute le SQL fourni dans [supabase/schema.sql](supabase/schema.sql), puis ajoute un fichier [.env](.env) local avec :

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

Ces variables sont obligatoires pour charger les persos depuis la table `characters` de Supabase.