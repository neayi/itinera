.PHONY: help build up down restart logs clean install dev prod

help: ## Affiche cette aide
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

build: ## Construit les images Docker
	docker-compose build

up: ## Démarre les conteneurs
	docker-compose up -d

down: ## Arrête les conteneurs
	docker-compose down

restart: ## Redémarre les conteneurs
	docker-compose restart

logs: ## Affiche les logs
	docker-compose logs -f

logs-next: ## Affiche les logs Next.js
	docker-compose logs -f nextjs

logs-mysql: ## Affiche les logs MySQL
	docker-compose logs -f mysql

clean: ## Supprime les conteneurs et volumes
	docker-compose down -v
	rm -rf .next node_modules

install: ## Installe les dépendances npm
	npm install

dev: ## Lance le serveur de développement local
	npm run dev

prod: build up ## Build et lance en production

shell-next: ## Ouvre un shell dans le conteneur Next.js
	docker exec -it itinera-nextjs sh

shell-mysql: ## Ouvre un shell MySQL
	docker exec -it itinera-mysql mysql -u itinera_user -p

ps: ## Liste les conteneurs actifs
	docker-compose ps

health: ## Vérifie la santé des services
	@echo "Checking services..."
	@curl -s http://localhost:3000/api/health | jq . || echo "Next.js not responding"
	@docker exec itinera-mysql mysqladmin ping -h localhost -u root -proot_password && echo "MySQL is healthy" || echo "MySQL is not responding"
