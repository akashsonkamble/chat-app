import { useFileHandler, useInputValidation } from "6pp";
import { CameraAlt as CameraAltIcon } from "@mui/icons-material";
import {
    Avatar,
    Button,
    Container,
    IconButton,
    Paper,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { VisuallyHiddenInput } from "../components/styles/StyledComponents";
import { bgGradient } from "../constants/colors";
import { server } from "../constants/config";
import { useAppDispatch } from "../redux/hooks";
import { login } from "../redux/reducers/auth";
import {
    emailValidator,
    fullNameValidator,
    usernameValidator,
} from "../utils/validator";

const Login: React.FC = () => {
    const dispatch = useAppDispatch();

    const [isLogin, setIsLogin] = useState<boolean>(true);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const toggleLogin = (): void => {
        setIsLogin((prev) => !prev);
    };

    const username = useInputValidation<string>("", usernameValidator);
    const email = useInputValidation<string>("", emailValidator);
    const fullName = useInputValidation<string>("", fullNameValidator);
    const password = useInputValidation("");
    const avatar = useFileHandler("single");

    const signinHandler = async (
        e: React.FormEvent<HTMLFormElement>
    ): Promise<void> => {
        e.preventDefault();

        const toastId = toast.loading("Logging In...");

        setIsLoading(true);

        const config = {
            headers: {
                "Content-Type": "application/json",
            },
            withCredentials: true,
        };

        try {
            const { data } = await axios.post(
                `${server}/api/v1/users/login`,
                {
                    username: username.value,
                    password: password.value,
                },
                config
            );

            dispatch(login(data.user));

            toast.success(data.message, {
                id: toastId,
            });
        } catch (error: any) {
            toast.error(
                error?.response?.data?.message || "Something Went Wrong",
                {
                    id: toastId,
                }
            );
        } finally {
            setIsLoading(false);
        }
    };

    const signupHandler = async (
        e: React.FormEvent<HTMLFormElement>
    ): Promise<void> => {
        e.preventDefault();

        const toastId = toast.loading("Signing Up...");

        setIsLoading(true);

        const formData = new FormData();

        if (avatar.file) {
            formData.append("avatar", avatar.file);
        }
        formData.append("fullName", fullName.value);
        formData.append("username", username.value);
        formData.append("email", email.value);
        formData.append("password", password.value);

        const config = {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            withCredentials: true,
        };

        try {
            const { data } = await axios.post(
                `${server}/api/v1/users/signup`,
                formData,
                config
            );

            dispatch(login(data.user));

            toast.success(data.message, {
                id: toastId,
            });
        } catch (error: any) {
            toast.error(
                error?.response?.data?.message || "Something Went Wrong",
                {
                    id: toastId,
                }
            );
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <div
            style={{
                // backgroundImage: "url(https://wallpaperaccess.com/full/1145553.jpg)",
                backgroundImage: bgGradient,
            }}
        >
            <Container
                component={"main"}
                maxWidth="xs"
                sx={{
                    height: "100vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <Paper
                    elevation={3}
                    sx={{
                        padding: 4,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                    }}
                >
                    {isLogin ? (
                        <>
                            <Typography variant="h5">Sign In</Typography>
                            <form
                                style={{ width: "100%", marginTop: "1rem" }}
                                onSubmit={signinHandler}
                            >
                                <TextField
                                    required
                                    fullWidth
                                    size="small"
                                    label="Username"
                                    margin="normal"
                                    variant="outlined"
                                    value={username.value}
                                    onChange={username.changeHandler}
                                />
                                {username.error && (
                                    <Typography color="error" variant="caption">
                                        {username.error}
                                    </Typography>
                                )}
                                <TextField
                                    required
                                    fullWidth
                                    size="small"
                                    label="Password"
                                    margin="normal"
                                    variant="outlined"
                                    type="password"
                                    value={password.value}
                                    onChange={password.changeHandler}
                                />
                                {password.error && (
                                    <Typography color="error" variant="caption">
                                        {password.error}
                                    </Typography>
                                )}
                                <Button
                                    fullWidth
                                    sx={{ marginTop: "1rem" }}
                                    variant="contained"
                                    color="primary"
                                    type="submit"
                                    disabled={isLoading}
                                >
                                    Sign In
                                </Button>
                                <Typography textAlign={"center"} m={"1rem"}>
                                    OR
                                </Typography>
                                <Typography textAlign={"center"}>
                                    Don't have an account?
                                    <Button
                                        variant="text"
                                        onClick={toggleLogin}
                                        disabled={isLoading}
                                    >
                                        Sign up
                                    </Button>
                                </Typography>
                            </form>
                        </>
                    ) : (
                        <>
                            <Typography variant="h5">Sign Up</Typography>
                            <form
                                style={{ width: "100%", marginTop: "1rem" }}
                                onSubmit={signupHandler}
                            >
                                <Stack
                                    position={"relative"}
                                    width={"5rem"}
                                    margin={"auto"}
                                >
                                    <Avatar
                                        sx={{
                                            width: "5rem",
                                            height: "5rem",
                                            objectFit: "contain",
                                        }}
                                        src={
                                            avatar.preview
                                                ? avatar.preview
                                                : undefined
                                        }
                                    />

                                    <IconButton
                                        sx={{
                                            position: "absolute",
                                            bottom: "0",
                                            right: "0",
                                            color: "whitesmoke",
                                            bgcolor: "rgba(0, 0, 0, 0.5)",
                                            ":hover": {
                                                bgColor: "rgba(0,0,0,0.7)",
                                            },
                                        }}
                                        component="label"
                                    >
                                        <>
                                            <CameraAltIcon fontSize="small" />
                                            <VisuallyHiddenInput
                                                type="file"
                                                accept="image/*"
                                                onChange={avatar.changeHandler}
                                            />
                                        </>
                                    </IconButton>
                                </Stack>
                                {avatar.error && (
                                    <Typography
                                        m={"1rem auto"}
                                        width={"fit-content"}
                                        display="block"
                                        color="error"
                                        variant="caption"
                                    >
                                        {avatar.error}
                                    </Typography>
                                )}
                                <TextField
                                    required
                                    fullWidth
                                    size="small"
                                    label="Full Name"
                                    margin="normal"
                                    variant="outlined"
                                    value={fullName.value}
                                    onChange={fullName.changeHandler}
                                />
                                {fullName.error && (
                                    <Typography color="error" variant="caption">
                                        {fullName.error}
                                    </Typography>
                                )}
                                <TextField
                                    required
                                    fullWidth
                                    size="small"
                                    label="Username"
                                    margin="normal"
                                    variant="outlined"
                                    value={username.value}
                                    onChange={username.changeHandler}
                                />
                                {username.error && (
                                    <Typography color="error" variant="caption">
                                        {username.error}
                                    </Typography>
                                )}
                                <TextField
                                    required
                                    fullWidth
                                    size="small"
                                    label="Email"
                                    margin="normal"
                                    variant="outlined"
                                    value={email.value}
                                    onChange={email.changeHandler}
                                />
                                {email.error && (
                                    <Typography color="error" variant="caption">
                                        {email.error}
                                    </Typography>
                                )}
                                <TextField
                                    required
                                    fullWidth
                                    size="small"
                                    label="Password"
                                    margin="normal"
                                    variant="outlined"
                                    type="password"
                                    value={password.value}
                                    onChange={password.changeHandler}
                                />
                                {password.error && (
                                    <Typography color="error" variant="caption">
                                        {password.error}
                                    </Typography>
                                )}
                                <Button
                                    fullWidth
                                    sx={{ marginTop: "1rem" }}
                                    variant="contained"
                                    color="primary"
                                    type="submit"
                                    disabled={isLoading}
                                >
                                    Sign Up
                                </Button>
                                <Typography textAlign={"center"} m={"1rem"}>
                                    OR
                                </Typography>
                                <Typography textAlign={"center"}>
                                    Already have an account?
                                    <Button
                                        variant="text"
                                        onClick={toggleLogin}
                                        disabled={isLoading}
                                    >
                                        Login
                                    </Button>
                                </Typography>
                            </form>
                        </>
                    )}
                </Paper>
            </Container>
        </div>
    );
};

export default Login;