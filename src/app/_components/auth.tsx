"use client";

import React from "react";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { ArrowRightIcon, ChevronRight, Chrome } from "lucide-react";
import { env } from "process";

export default function Auth() {
    return (
        <div className="h-screen w-screen flex flex-col items-center justify-center space-y-8">
            <div className="flex flex-col items-center gap-2 mb-6">
                <h1 className="text-4xl sm:text-7xl font-bold z-20 bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-500">
                    Welcome to MindTab
                </h1>
                <p className="text-xl max-w-xl text-center bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-500">
                    Turn every new tab into a productivity dashboard <br />
                    Track goals, take notes and build habits.
                </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <Link
                    href="https://chromewebstore.google.com/detail/mindtab/ndnegdefonikfckhbgmejdodebnbhjll"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <Button
                        variant={"secondary"}
                        className="[&>span>svg:first-child]:hover:hidden [&>span>svg:nth-child(even)]:hover:inline-block [&>span>svg:nth-child(even)]:hover:translate-x-1.5"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 48 48"
                            height="24"
                            width="24"
                            className="mr-2 -ml-1"
                        >
                            <defs>
                                <linearGradient
                                    id="a"
                                    x1="3.2173"
                                    y1="15"
                                    x2="44.7812"
                                    y2="15"
                                    gradientUnits="userSpaceOnUse"
                                >
                                    <stop offset="0" stop-color="#d93025" />
                                    <stop offset="1" stop-color="#ea4335" />
                                </linearGradient>
                                <linearGradient
                                    id="b"
                                    x1="20.7219"
                                    y1="47.6791"
                                    x2="41.5039"
                                    y2="11.6837"
                                    gradientUnits="userSpaceOnUse"
                                >
                                    <stop offset="0" stop-color="#fcc934" />
                                    <stop offset="1" stop-color="#fbbc04" />
                                </linearGradient>
                                <linearGradient
                                    id="c"
                                    x1="26.5981"
                                    y1="46.5015"
                                    x2="5.8161"
                                    y2="10.506"
                                    gradientUnits="userSpaceOnUse"
                                >
                                    <stop offset="0" stop-color="#1e8e3e" />
                                    <stop offset="1" stop-color="#34a853" />
                                </linearGradient>
                            </defs>
                            <circle
                                cx="24"
                                cy="23.9947"
                                r="12"
                                style={{ fill: "#fff" }}
                            />
                            <path
                                d="M3.2154,36A24,24,0,1,0,12,3.2154,24,24,0,0,0,3.2154,36ZM34.3923,18A12,12,0,1,1,18,13.6077,12,12,0,0,1,34.3923,18Z"
                                style={{ fill: "none" }}
                            />
                            <path
                                d="M24,12H44.7812a23.9939,23.9939,0,0,0-41.5639.0029L13.6079,30l.0093-.0024A11.9852,11.9852,0,0,1,24,12Z"
                                style={{ fill: "url(#a)" }}
                            />
                            <circle
                                cx="24"
                                cy="24"
                                r="9.5"
                                style={{ fill: "#1a73e8" }}
                            />
                            <path
                                d="M34.3913,30.0029,24.0007,48A23.994,23.994,0,0,0,44.78,12.0031H23.9989l-.0025.0093A11.985,11.985,0,0,1,34.3913,30.0029Z"
                                style={{ fill: "url(#b)" }}
                            />
                            <path
                                d="M13.6086,30.0031,3.218,12.006A23.994,23.994,0,0,0,24.0025,48L34.3931,30.0029l-.0067-.0068a11.9852,11.9852,0,0,1-20.7778.007Z"
                                style={{ fill: "url(#c)" }}
                            />
                        </svg>
                        Get Chrome Extension
                        <span>
                            <ChevronRight
                                className="ml-2 transition-all"
                                size={"14"}
                            />
                            <ArrowRightIcon
                                className="ml-2 transition-all duration-500 hidden mb-0.5"
                                width={"14"}
                                height={"14"}
                            />
                        </span>
                    </Button>
                </Link>
                <Link
                    href="https://github.com/ksushant6566/MindTab"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <Button
                        variant={"secondary"}
                        className="[&>span>svg:first-child]:hover:hidden [&>span>svg:nth-child(even)]:hover:inline-block [&>span>svg:nth-child(even)]:hover:translate-x-1.5"
                    >
                        🌟 Star MindTab on{" "}
                        <svg
                            className="ml-2"
                            width="20"
                            height="20"
                            viewBox="0 0 15 15"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M7.49933 0.25C3.49635 0.25 0.25 3.49593 0.25 7.50024C0.25 10.703 2.32715 13.4206 5.2081 14.3797C5.57084 14.446 5.70302 14.2222 5.70302 14.0299C5.70302 13.8576 5.69679 13.4019 5.69323 12.797C3.67661 13.235 3.25112 11.825 3.25112 11.825C2.92132 10.9874 2.44599 10.7644 2.44599 10.7644C1.78773 10.3149 2.49584 10.3238 2.49584 10.3238C3.22353 10.375 3.60629 11.0711 3.60629 11.0711C4.25298 12.1788 5.30335 11.8588 5.71638 11.6732C5.78225 11.205 5.96962 10.8854 6.17658 10.7043C4.56675 10.5209 2.87415 9.89918 2.87415 7.12104C2.87415 6.32925 3.15677 5.68257 3.62053 5.17563C3.54576 4.99226 3.29697 4.25521 3.69174 3.25691C3.69174 3.25691 4.30015 3.06196 5.68522 3.99973C6.26337 3.83906 6.8838 3.75895 7.50022 3.75583C8.1162 3.75895 8.73619 3.83906 9.31523 3.99973C10.6994 3.06196 11.3069 3.25691 11.3069 3.25691C11.7026 4.25521 11.4538 4.99226 11.3795 5.17563C11.8441 5.68257 12.1245 6.32925 12.1245 7.12104C12.1245 9.9063 10.4292 10.5192 8.81452 10.6985C9.07444 10.9224 9.30633 11.3648 9.30633 12.0413C9.30633 13.0102 9.29742 13.7922 9.29742 14.0299C9.29742 14.2239 9.42828 14.4496 9.79591 14.3788C12.6746 13.4179 14.75 10.7025 14.75 7.50024C14.75 3.49593 11.5036 0.25 7.49933 0.25Z"
                                fill="currentColor"
                                fill-rule="evenodd"
                                clip-rule="evenodd"
                            ></path>
                        </svg>
                        <span>
                            <ChevronRight
                                className="ml-2 transition-all"
                                size={"14"}
                            />
                            <ArrowRightIcon
                                className="ml-2 transition-all duration-500 hidden mb-0.5"
                                width={"14"}
                                height={"14"}
                            />
                        </span>
                    </Button>
                </Link>
            </div>
            <div className="flex items-center">
                <a href={`${env.NEXTAUTH_URL}/auto-signin`} target="_blank">
                    <Button size={"lg"}>
                        <svg
                            className="mr-2"
                            width="22px"
                            height="22px"
                            viewBox="-3 0 262 262"
                            xmlns="http://www.w3.org/2000/svg"
                            preserveAspectRatio="xMidYMid"
                        >
                            <path
                                d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
                                fill="#4285F4"
                            />
                            <path
                                d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
                                fill="#34A853"
                            />
                            <path
                                d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"
                                fill="#FBBC05"
                            />
                            <path
                                d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
                                fill="#EB4335"
                            />
                        </svg>
                        Continue with Google
                    </Button>
                </a>
            </div>
        </div>
    );
}
