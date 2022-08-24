FROM node:alpine as runner
ENV NODE_ENV production
COPY . /test-react
WORKDIR /test-react
RUN npm ci
EXPOSE 3000
CMD npm start
