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
		facile-media

dev:
	make network
	docker build -t facile-media .
	docker run \
		--restart=unless-stopped \
		--network=facile \
		--name=media \
		-p 24042:24042 \
		-p 24052:24052 \
		--entrypoint=npm \
		facile-media run dev

build:
	docker build -t lucestudio/facile-media:v$(v) -t lucestudio/facile-media:latest .

push:
	docker push lucestudio/facile-media

docker:
	make build v=$(v) && make push