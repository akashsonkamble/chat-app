import { Box, Typography } from "@mui/material";
import AppLayout from "../components/layout/AppLayout";
import { ultraLightBlue } from "../constants/colors";

const Home: React.FC = () => {
    return (
        <Box bgcolor={ultraLightBlue} height={"100%"}>
            <Typography p={"2rem"} textAlign={"center"} variant={"h5"}>
                Select a friend to chat
            </Typography>
        </Box>
    );
};

export default AppLayout(Home);