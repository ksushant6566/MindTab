"use client"

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'
import { Button } from "~/components/ui/button"
import { Card, CardContent } from "~/components/ui/card"

export default function MobilePlaceholder() {

    const handleTryMindTab = () => {
        console.log('try mindtab')
        toast.info('MindTab is not available on mobile yet, see you on desktop!', {
            position: 'top-center',
        })
    }

    return (
        <main className="min-h-screen w-full bg-black overflow-hidden relative">
            {/* Animated background */}
            <div className="absolute inset-0 overflow-hidden">
                {[...Array(50)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute bg-primary rounded-full"
                        style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            width: `${Math.random() * 6 + 2}px`,
                            height: `${Math.random() * 6 + 2}px`,
                        }}
                        animate={{
                            y: [0, Math.random() * 200 - 100],
                            x: [0, Math.random() * 200 - 100],
                            opacity: [0.2, 0.6, 0.2],
                        }}
                        transition={{
                            duration: Math.random() * 20 + 10,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                    />
                ))}
            </div>

            <div className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-screen p-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center"
                >
                    <h1 className="text-4xl sm:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                        MindTab is Coming to Mobile
                    </h1>
                    <p className="text-xl mb-8 text-muted-foreground">
                        Experience MindTab on your desktop now, mobile launch coming soon!
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="mb-8"
                >
                    <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                        <CardContent className="p-0">
                            <Image
                                src="/mindtab-notes.png"
                                alt="MindTab Desktop Experience"
                                className="rounded-lg shadow-2xl"
                                width={500}
                                height={300}
                            />
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                >
                    <Button variant="outline" size="lg" onClick={handleTryMindTab}>
                        Try MindTab on Desktop
                        <motion.span
                            className="ml-2 inline-flex items-center"
                            whileHover={{ x: 5 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                            <ArrowRight className="h-4 w-4" />
                        </motion.span>
                    </Button>
                </motion.div>
            </div>
        </main>
    )
}