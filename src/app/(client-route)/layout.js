"use client";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/components/context/authContext";
import { useContext, useEffect, useState } from "react";
import { CircularProgress } from "@mui/material";
import Link from "next/link";

export default function ClientLayout({ children }) {
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useContext(AuthContext);
    const router = useRouter();


    useEffect(() => {
        if (!user) {
            router.push("/signin");
        }

        setTimeout(() => {
            setIsLoading(false);
        }, 500);
    }, []);


    if (isLoading) {
        return <div><CircularProgress /></div>;
    }

    return (
        <main className="app-container">
            <nav>
                <Link href="/book-tickets">Book Tickets</Link>
                <Link href="/profile">Profile</Link>
            </nav>
            {children}
        </main>
    );
}
