FROM docker.io/parseplatform/parse-server:6.1.0-alpha.7
USER root
RUN npm install seedrandom uuid
USER node

COPY cloud/ /parse-server/cloud/
CMD ["--cloud", "/parse-server/cloud/main.js", "--masterKeyIps", "0.0.0.0/0"]
