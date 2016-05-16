FROM golang:1.6

RUN apt-get update && apt-get install -y --no-install-recommends \
		nodejs \
		npm \
	&& npm install --global grunt-cli bower \
	&& rm -rf /vr/lib/apt/lists/* \
	&& ln -s "$(which nodejs)" /usr/bin/node

RUN mkdir -p /go/src/app
WORKDIR /go/src/app

COPY package.json /go/src/app
RUN npm install

COPY bower.json /go/src/app
RUN bower --allow-root install \
  && rm -rf public/bower_components/ace-builds/demo/kitchen-sink/docs

COPY . /go/src/app

RUN go-wrapper download
RUN go-wrapper install

RUN grunt build

EXPOSE 3000

CMD ["go-wrapper", "run"]
