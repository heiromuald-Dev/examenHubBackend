import app from './app';
import { assertRuntimeEnv, env } from './configuration/env';

assertRuntimeEnv();

app.listen(env.port, () => {
  process.stdout.write(`Exam Hub backend running on port ${env.port}\n`);
});
