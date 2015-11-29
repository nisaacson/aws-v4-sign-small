all: clean build

clean:
	rm -rf node_modules

build:
	npm install

test:
	npm run test

lint:
	npm run lint
