import { isValidUsername } from "6pp";
export const usernameValidator = (username: string) => {
    if (!isValidUsername(username)) {
        return {
            isValid: false,
            errorMessage: "Username is invalid",
        };
    }
};

export const emailValidator = (email: string) => {
    if (!/\S+@\S+\.\S+/.test(email)) {
        return {
            isValid: false,
            errorMessage: "Email is invalid",
        };
    }
};

export const fullNameValidator = (fullName: string) => {
    if (fullName.length < 3) {
        return {
            isValid: false,
            errorMessage: "Full name is invalid",
        };
    }
};