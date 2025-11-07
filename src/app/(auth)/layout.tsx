export default function AuthLayout({children}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html>
        <body>
        {children}
        </body>
        </html>
    );
}
