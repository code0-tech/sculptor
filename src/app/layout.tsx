"use client";

import {DFullScreen} from "@code0-tech/pictor";

export default function RootLayout({children}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html>
        <body>
        <DFullScreen>
            {children}
        </DFullScreen>
        </body>
        </html>
    );
}
