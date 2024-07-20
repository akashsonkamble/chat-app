import { Error as ErrorIcon } from "@mui/icons-material";
import { Container, Stack, Typography } from "@mui/material";
import { Link } from "react-router-dom";

const Error = () => {
    return (
        <Container maxWidth={"lg"} sx={{ height: "100vh" }}>
            <Stack
                alignItems={"center"}
                justifyContent={"center"}
                height={"100%"}
                spacing={"2rem"}
            >
                <ErrorIcon sx={{ fontSize: "10rem" }} />
                <Typography variant="h1">404</Typography>
                <Typography variant="h3">Page not found</Typography>
                <Link to={"/"}>Back to Home</Link>
            </Stack>
        </Container>
    );
};

export default Error;