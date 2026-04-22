Mais ça nécessite quand même Maven pour le package...

Récapitulatif complet une fois Maven installé :

Terminal	Commande	URL
1	cd src\backend\svc-tournee && mvn spring-boot:run	API : http://localhost:8081/api/tournees/today
2	cd src\mobile && npm install && set EXPO_PUBLIC_API_URL=http://localhost:8081 && npx expo start --web	UI : http://localhost:8082
Dis-moi si tu veux que j'ajoute le Maven Wrapper officiel (je peux générer les bons fichiers depuis Spring Initializr) ou si tu préfères qu'on configure autre chose.


TAG=$(git rev-parse --short HEAD)
gcloud builds submit \
  --config=cloudbuild.yaml \
  --substitutions=_TAG=${TAG} \
  --project=docupost-recette-prod