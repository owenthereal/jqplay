'use client'

import { useEffect, useState } from 'react';
import Image from "next/image";
import jq from 'jq-wasm';

export default function Home() {
  const [result, setResult] = useState<string>('');

  useEffect(() => {
    async function loadJq() {
      jq.raw('{ "foo": "bar", "biz": 5 }', ".foo", [])
        .then((result: string) => {
          setResult(result)
        })
        .catch((error: any) => {
          setResult(error.toString());
        });
    }

    loadJq();
  })

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <p>
        {result}
      </p>
    </main>
  );
}
