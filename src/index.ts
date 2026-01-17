import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { DynamoDBClient, ListTablesCommand } from '@aws-sdk/client-dynamodb';
import 'dotenv/config';

const app = new Hono();

const client = new DynamoDBClient({ region: process.env.AWS_REGION });

app.get('/', (c) => c.text('Project is ready.'));                                                                                                                       

app.get('/test-db', async (c) => {
  try {
    const command = new ListTablesCommand({});
    const response = await client.send(command);

    return c.json({
      status: 'Success',
      message: 'AWS DynamoDB connection established!',
      tables: response.TableNames
    });
  } catch (error: any) {
    return c.json({
      status: 'Error',
      message: 'Failed to connect to AWS.',
      error: error.message
    }, 500);
  }
});

const port = 3000;
console.log(`Server is running: http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port
});