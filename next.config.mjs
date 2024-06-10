/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "standalone",
    webpack: (config, options) => {
        config.experiments = {
            asyncWebAssembly: true,
            layers: true,
        };
        config.resolve.fallback = {
            fs: false,
            path: false,
            crypto: false
        };

        patchWasmModuleImport(config, options.isServer);

        return config;
    },
};

function patchWasmModuleImport(config, isServer) {
    config.module.rules.push({
        test: /\.wasm$/,
        type: 'asset/resource',
    });

    // TODO: improve this function -> track https://github.com/vercel/next.js/issues/25852
    if (isServer) {
        config.output.webassemblyModuleFilename = './../static/wasm/[modulehash].wasm';
    } else {
        config.output.webassemblyModuleFilename = 'static/wasm/[modulehash].wasm';
    }
}

export default nextConfig;
