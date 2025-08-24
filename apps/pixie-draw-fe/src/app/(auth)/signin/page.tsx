"use client"

import AuthPage from "@/clientComponents/AuthPage";

export function SignIn() {
    return (
    <div>
        <AuthPage isSignIn={true}></AuthPage>
    </div>);
}

export default SignIn;