A implementer — DTOs d'evenements partages entre services

Ce module contiendra les DTOs serialises des Domain Events
partages entre les services backend (ex : TourneeLanceeDTO pour
la communication BC-07 → BC-01).

Pour le MVP initial, les events sont consommes en interne via
Spring ApplicationEventPublisher. Ce module sera utilise quand
un bus d'evenements externe (Kafka) sera introduit en R2.
