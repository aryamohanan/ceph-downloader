import * as express from 'express';
import { Configurations } from './config';
import { Routes } from "./routes";
import { Request, Response } from 'express';
import { getSummary, getContentType, signalIsUp, createMiddleware } from '@promster/express';
import { Consumer } from './lib/services/kafka/consumer';
import { DownloadRequestConsumer } from './lib/services/kafka/downloadRequestConsumer';
import { createConnection, getConnectionManager } from 'typeorm';

const port = Configurations.port;
const uri = `localhost:${port}`;
const appInitialSetup = {
  'environment': process.env.NODE_ENV,
  "port:": Configurations.port,
  hash: process.env.ShortHash
}
console.log(`App Initial Setup: ${JSON.stringify(appInitialSetup)}`);

const app = express();
app.use(express.urlencoded());
app.use(createMiddleware({ app }));
app.use(express.json());
app.use('/metrics', (req: Request, res: Response) => {
  req.statusCode = 200;
  res.setHeader('Content-Type', getContentType());
  res.end(getSummary());
});

app.listen(port, () => {
  console.log(`Server ready at ${uri}`);
  return getDbConnections().then(() => {
    const consumer = new Consumer();
    consumer.do();
    const downloadRequestConsumer = new DownloadRequestConsumer();
    downloadRequestConsumer.do();
    Routes.call(app)
  });

});
async function getDbConnections() {
  let connections = [];
  if (!getConnectionManager().has('default')) {
    await createConnection('default').then(() => {
      console.log('Created defaultDB connection');
    }
    );
  }
  return connections;
}

signalIsUp();