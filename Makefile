.PHONY: build termo up-d up down restart

# Construir las imágenes de los servicios (Backend y Frontend)
build:
	docker-compose build

# Iniciar los servicios en segundo plano (equivalente a: docker compose up -d)
# Nota: Usamos 'up-d' porque 'make up -d' activaría el modo debug (bandera -d) de la herramienta Make.
up-d:
	docker-compose up -d

# Levantar el servidor interactivo (equivalente a: docker compose up)
# Si tuvieras un servicio llamado "web", sería docker compose up web. 
# Aquí levanta todos por defecto o puedes hacer 'make up frontend'.
up:
	docker-compose up

# Bajar los contenedores (equivalente a: docker compose down)
down:
	docker-compose down

# Reiniciar los servicios (equivalente a: docker compose restart)
restart:
	docker-compose restart
