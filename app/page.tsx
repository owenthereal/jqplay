'use client'

import { useEffect, useState, useRef, useCallback } from 'react';

export default function Home() {
  const [result, setResult] = useState<string>('');

  const handleRun = useCallback(async () => {
    setResult('Running...');
    try {
      const result = await runJQ(
        '{"dependencies":{"capnp":{"version":"0.1.4","dependencies":{"es6-promise":{"version":"1.0.0","dependencies":{"es6-promise":{"version":"1.0.0"}}}}}}}',
        '.dependencies | recurse(to_entries | map(.values.dependencies))',
        [],
        5000)
      setResult(result);
    } catch (err: any) {
      setResult(err.toString());
    }
  }, [])

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <button onClick={handleRun}>Run JQ</button>
      <p>
        {result}
      </p>
    </main>
  );
}

function runJQ(json: string, query: string, flags: string[], timeout: number): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const worker = new Worker(new URL('../workers/worker.ts', import.meta.url))

    const timeoutId = setTimeout(() => {
      worker.terminate();
      reject(new Error('jq timed out'));
    }, timeout);

    worker.onmessage = function (event) {
      clearTimeout(timeoutId);
      resolve(event.data.result);
      worker.terminate();
    };

    worker.onerror = function (error) {
      clearTimeout(timeoutId);
      reject(new Error(`Worker error: ${error.message}`));
      worker.terminate();
    };

    worker.postMessage({ json: json, query: query, flags: flags });
  });
}
