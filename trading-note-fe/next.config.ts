import type { NextConfig } from "next";

const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';

const nextConfig: NextConfig = {
    output: 'standalone',
    reactStrictMode: false,
    images: {
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '8080',
                pathname: '/**',
            },
        ],
    },
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: `${backendUrl}/api/:path*`,
            },
            {
                source: '/uploads/:path*',
                destination: `${backendUrl}/uploads/:path*`,
            },
        ];
    },
};

export default nextConfig;
