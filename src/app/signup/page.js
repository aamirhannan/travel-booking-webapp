"use client";

import React, { useEffect, useState, useRef } from "react";
import "../signin/signin.scss";
import { Button, CircularProgress, TextField } from "@mui/material";
import { EMAIL_REGEX, NAME_MIN_LENGTH, PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from "@/utils/utilFunction";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/components/context/authContext";
import { useContext } from "react";

export default function SignUp() {

    const router = useRouter();
    const { user, setUser } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user) {
            router.push("/book-tickets");
        }
        setTimeout(() => {
            setIsLoading(false);
        }, 500);
    }, [user]);


    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        nameError: "",
        emailError: "",
        passwordError: ""
    });

    const validateForm = () => {
        const name = formData.name;
        const email = formData.email;
        const password = formData.password;
        if (!name || !email || !password) {
            setFormData({ ...formData, nameError: "Name is required", emailError: "Email is required", passwordError: "Password is required" });
            return false;
        }
        if (name.length < NAME_MIN_LENGTH) {
            setFormData({ ...formData, nameError: "Name must be at least 3 characters" });
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

    const handleSignUp = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }

        const signupStatus = await handleSignupAPICall();
        // debugger;
        if (signupStatus?.status === 201) {
            if (signupStatus.message === "SIGNUP_SUCCESS") {
                setUser(signupStatus.data);
                router.push("/book-tickets");
            } else {
                setFormData({ ...formData, passwordError: "Something went wrong" });
            }
        } else {
            setFormData({ ...formData, passwordError: "Something went wrong, email should be unique" });
        }
    }

    const handleSignupAPICall = async () => {
        const response = await axios.post(`/api/auth/signup`, {
            email: formData.email,
            name: formData.name,
            password: formData.password,
        });

        console.log("response :: ", response);

        return response.data.data;
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
        <form className="signin-form" onSubmit={handleSignUp}>
            <h1>SignUp</h1>
            <div className="signin-form-fields">
                <TextField fullWidth label="Name" id="name" onChange={handleChange} />
                <p className="signin-form-fields-error">{formData.nameError}</p>
            </div>
            <div className="signin-form-fields">
                <TextField fullWidth label="Email" id="email" onChange={handleChange} />
                <p className="signin-form-fields-error">{formData.emailError}</p>
            </div>
            <div className="signin-form-fields">
                <TextField fullWidth label="Password" id="password" onChange={handleChange} />
                <p className="signin-form-fields-error">{formData.passwordError}</p>
            </div>
            <Button variant="contained" type="submit" onClick={handleSignUp}>SignUp</Button>
            <div className="signin-form-fields">
                Already have an account?
                <Link href="/signin">SignIn</Link>
            </div>
        </form>
    </div >
}
