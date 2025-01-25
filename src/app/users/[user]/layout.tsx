export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <div className="max-w-screen-lg mx-auto">
            {children}
        </div>
    )
}