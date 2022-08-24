FROM node:alpine as runner
ENV NODE_ENV production
COPY . /consumer
WORKDIR /consumer
RUN npm ci
CMD node consumer
