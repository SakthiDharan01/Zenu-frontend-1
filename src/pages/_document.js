import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
    return (
        <Html lang="en">
            <Head>
                {/* Manifest + PWA setup */}
                <link rel="manifest" href="/manifest.json" />
                <meta name="theme-color" content="#4a90e2" />

                {/* ✅ Custom fonts here */}
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap"
                    rel="stylesheet"
                />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
