FROM node:alpine as runner
ENV NODE_ENV production
COPY . /loadtest-api
WORKDIR /loadtest-api
RUN npm ci
EXPOSE 3001
CMD node api
