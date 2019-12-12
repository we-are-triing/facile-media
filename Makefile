stop:
	docker stop media

clear:
	make stop
	docker system prune --volumes --force

clear-all:
	make stop
	docker system prune --volumes --force --all

fresh:
	make clear-all
	make dev

network:
	docker network inspect facile >/dev/null || docker network create --driver bridge facile

prod:
	make network
	docker build -t facile-media .
	docker run \
		--restart=unless-stopped \
		--network=facile \
		--name=media \
		-p 24042:24042 \
		--mount type=volume,target=/,source=media,destination=/home/node/media \
		facile-media

dev:
	make network
	docker build -t facile-media .
	docker run -d \
		--rm \
		--network=facile \
		--name=media \
		-p 24042:24042 \
		-p 24052:24052 \
		--entrypoint=npm \
		--mount type=bind,source="$(CURDIR)"/,target=/home/node/cms \
		facile-media run dev

build:
	docker build -t lucestudio/facile-media:v$(v) -t lucestudio/facile-media:latest .

push:
	docker push lucestudio/facile-media

docker:
	make build v=$(v) && make push