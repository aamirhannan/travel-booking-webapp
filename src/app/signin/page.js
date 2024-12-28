"use client";

import React, { useEffect, useState, useRef } from "react";
import "./signin.scss";
import { Button, CircularProgress, TextField } from "@mui/material";
import { EMAIL_REGEX, PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from "@/utils/utilFunction";
import Link from "next/link";
import axios from "axios";
import { AuthContext } from "@/components/context/authContext";
import { useContext } from "react";
import { useRouter } from "next/navigation";



export default function SignIn() {

    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const { user } = useContext(AuthContext);


    useEffect(() => {
        if (user) {
            router.push("/book-tickets");
        }
        setTimeout(() => {
            setIsLoading(false);
        }, 500);
    }, [user]);


    const [formData, setFormData] = useState({
        email: "",
        password: "",
        emailError: "",
        passwordError: ""
    });

    const validateForm = () => {
        const email = formData.email;
        const password = formData.password;
        if (!email || !password) {
            setFormData({ ...formData, emailError: "Email is required", passwordError: "Password is required" });
            return false;
        }
        if (!EMAIL_REGEX.test(email)) {
            setFormData({ ...formData, emailError: "Invalid email format" });
            return false;
        }
        if (password.length < PASSWORD_MIN_LENGTH || password.length > PASSWORD_MAX_LENGTH) {
            setFormData({ ...formData, passwordError: "Password must be between 8 and 16 characters" });
            return false;
        }
        return true;
    }

    const handleSignIn = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }
        console.log("SignIn");
        const signinStatus = await handleSignInAPICall();
        console.log("signinStatus :: ", signinStatus);
    }

    const handleSignInAPICall = async () => {
        const response = await axios.post(`/api/auth/signin`, {
            email: formData.email,
            password: formData.password,
        });

        console.log("response :: ", response);
    }

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value, [`${id}Error`]: "" });

        if (isLoading) {
            return <div className="signin-container">
                <div className="signin-loading">
                    <CircularProgress />
                </div>
            </div>;
        }
    }

    return <div className="signin-container">
        <form className="signin-form" onSubmit={handleSignIn}>
            <h1>SignIn</h1>
            <div className="signin-form-fields">
                <TextField fullWidth label="Email" id="email" onChange={handleChange} />
                <p className="signin-form-fields-error">{formData.emailError}</p>
            </div>
            <div className="signin-form-fields">
                <TextField fullWidth label="Password" id="password" onChange={handleChange} />
                <p className="signin-form-fields-error">{formData.passwordError}</p>
            </div>
            <Button variant="contained" type="submit" onClick={handleSignIn}>SignIn</Button>
            <div className="signin-form-fields">
                Don't have an account?
                <Link href="/signup">SignUp</Link>
            </div>
        </form>
    </div >
}
