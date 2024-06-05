'use client'

import { useState, useRef, useEffect } from 'react';
import { useSystemDarkMode } from '../hooks/useSystemDarkMode';
import Header from '../components/Header';
import JSONEditor from '../components/JSONEditor';
import QueryEditor from '../components/QueryEditor';
import FlagsSelector from '../components/FlagsSelector';
import OutputEditor from '../components/OutputEditor';

class RunError extends Error {
  runId: number;

  constructor(runID: number, message: string) {
    super(message);
    this.runId = runID;
  }
}

class RunResult {
  runId: number;
  result: string;

  constructor(runID: number, result: string) {
    this.runId = runID;
    this.result = result;
  }
}

export default function Home() {
  const systemDarkMode = useSystemDarkMode();
  const [darkMode, setDarkMode] = useState<boolean>(systemDarkMode);

  const [result, setResult] = useState<string>('');
  const [flags, setFlags] = useState<string[]>([]);

  const jsonRef = useRef<string>('');
  const queryRef = useRef<string>('');
  const flagsRef = useRef<string[]>([]);

  const workerRef = useRef<Worker | null>(null);
  const runIdRef = useRef<number | null>(null);
  const runTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const terminateWorker = () => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
  };

  const clearRunTimeout = () => {
    if (runTimeoutRef.current) {
      clearTimeout(runTimeoutRef.current);
      runTimeoutRef.current = null;
    }
    if (runIdRef.current) {
      runIdRef.current = null;
    }
  };

  useEffect(() => {
    setDarkMode(systemDarkMode);
  }, [systemDarkMode]);

  useEffect(() => {
    return () => {
      clearRunTimeout();
      terminateWorker();
    };
  }, []);

  const handleJQRun = (json: string, query: string, flags: string[]) => {
    clearRunTimeout();
    terminateWorker();
    setResult('');

    if (json === '' || query === '') {
      return;
    }

    setResult('Running...');

    const runId = Math.floor(new Date().getTime() / 1000);
    runIdRef.current = runId

    runTimeoutRef.current = setTimeout(() => {
      runJQ(runId, json, query, flags, 30000)
        .then((result) => {
          if (runIdRef.current === result.runId) {
            setResult(result.result);
          }
        })
        .catch((error: RunError) => {
          if (runIdRef.current === error.runId) {
            setResult(`Error: ${error.message}`);
          }
        });
    }, 500);
  };

  const runJQ = (runId: number, json: string, query: string, flags: string[], timeout: number): Promise<RunResult> => {
    terminateWorker();

    return new Promise<RunResult>((resolve, reject) => {
      const worker = new Worker(new URL('../workers/worker.ts', import.meta.url));
      workerRef.current = worker;

      const timeoutId = setTimeout(() => {
        worker.terminate();
        workerRef.current = null;
        reject(new RunError(runId, 'jq timed out'));
      }, timeout);

      worker.onmessage = function (event) {
        clearTimeout(timeoutId);

        if (event.data.error) {
          reject(new RunError(runId, event.data.error));
        } else {
          resolve(new RunResult(runId, event.data.result));
        }

        worker.terminate();
        workerRef.current = null;
      };

      worker.onerror = function (error) {
        clearTimeout(timeoutId);
        reject(new RunError(runId, `Worker error: ${error.message}`));
        worker.terminate();
        workerRef.current = null;
      };

      worker.postMessage({ json, query, flags });
    });
  };

  const handleQueryEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      queryRef.current = value;
      handleJQRun(jsonRef.current, queryRef.current, flagsRef.current);
    }
  };

  const handleJSONEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      jsonRef.current = value;
      handleJQRun(jsonRef.current, queryRef.current, flagsRef.current);
    }
  };

  const handleFlagsChange = (flags: string[]) => {
    setFlags(flags);
    flagsRef.current = flags;
    handleJQRun(jsonRef.current, queryRef.current, flagsRef.current);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/?json=${encodeURIComponent(jsonRef.current)}&query=${encodeURIComponent(queryRef.current)}&flags=${encodeURIComponent(flagsRef.current.join(','))}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert('Share link copied to clipboard');
    });
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="flex flex-col min-h-screen p-6 bg-gray-900 text-gray-100 dark:bg-gray-900 dark:text-gray-100 bg-white text-black">
        <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} onShare={handleShare} />
        <div className="flex-grow flex flex-col md:flex-row md:space-x-6 w-full mx-auto mb-6">
          <JSONEditor darkMode={darkMode} handleChange={handleJSONEditorChange} />
          <QueryEditor darkMode={darkMode} handleChange={handleQueryEditorChange} />
        </div>
        <div className="flex-grow flex flex-col md:flex-row md:space-x-6 w-full mx-auto mb-6">
          <FlagsSelector darkMode={darkMode} flags={flags} setFlags={handleFlagsChange} />
        </div>
        <div className="flex-grow flex flex-col md:flex-row md:space-x-6 w-full mx-auto">
          <OutputEditor darkMode={darkMode} result={result} />
        </div>
      </div>
    </div >
  );
}
