import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
    return (
        <Html lang="en">
            <Head>
                {/* Link to manifest */}
                <link rel="manifest" href="/manifest.json" />
                {/* Theme color for status bar */}
                <meta name="theme-color" content="#4a90e2" />
                {/* App icons */}
                <link rel="icon" href="/icons/icon-192.png" />
                <link rel="apple-touch-icon" href="/icons/icon-512.png" />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
