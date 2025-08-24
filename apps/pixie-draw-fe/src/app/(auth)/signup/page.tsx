"use client"

import AuthPage from "@/clientComponents/AuthPage";

export function Signup() {
    return (
    <div>
        <AuthPage isSignIn={false}></AuthPage>
    </div>);
}

export default Signup;