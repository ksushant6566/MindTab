export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <div className="max-w-screen-lg mx-auto px-6 lg:px-0">
            {children}
        </div>
    )
}