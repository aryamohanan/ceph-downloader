FROM harbor.kore.korewireless.com/docker-base-images/node:16.2.0 AS debug-build
COPY *.crt /usr/local/share/ca-certificates/
RUN update-ca-certificates
ENV NODE_EXTRA_CA_CERTS /etc/ssl/certs/ca-certificates.crt
WORKDIR /app
COPY package*.json ./
RUN npm i
COPY . .
EXPOSE 80
CMD ["npm", "run", "start-k8s"]

FROM harbor.kore.korewireless.com/docker-base-images/node:16.2.0 AS edge
COPY *.crt /usr/local/share/ca-certificates/
RUN update-ca-certificates
ENV NODE_EXTRA_CA_CERTS /etc/ssl/certs/ca-certificates.crt
ENV NODE_OPTIONS=--max-old-space-size=2092
WORKDIR /app
COPY package*.json ./
RUN npm i
COPY . .
EXPOSE 80
CMD ["npm", "run", "start-k8s"]

FROM harbor.kore.korewireless.com/docker-base-images/node:16.2.0 AS staging
COPY *.crt /usr/local/share/ca-certificates/
RUN update-ca-certificates
ENV NODE_EXTRA_CA_CERTS /etc/ssl/certs/ca-certificates.crt
ENV NODE_OPTIONS=--max-old-space-size=2092
WORKDIR /app
COPY package*.json ./
RUN npm i
COPY . .
EXPOSE 80
CMD ["npm", "run", "start-k8s"]

FROM harbor.kore.korewireless.com/docker-base-images/node:16.2.0 AS production
COPY *.crt /usr/local/share/ca-certificates/
RUN update-ca-certificates
ENV NODE_EXTRA_CA_CERTS /etc/ssl/certs/ca-certificates.crt
ENV NODE_OPTIONS=--max-old-space-size=4092
WORKDIR /app
COPY package*.json ./
RUN npm i
COPY . .
EXPOSE 80
CMD ["npm", "run", "start-k8s"]