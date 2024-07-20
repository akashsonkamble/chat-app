import {
    CalendarMonth as CalendarIcon,
    Face as FaceIcon,
    AlternateEmail as UsernameIcon,
} from "@mui/icons-material";
import { Avatar, Stack, Typography } from "@mui/material";
import moment from "moment";
import { transformImage } from "../../lib/features";
import { UserProps } from "../../types";

type ProfileProps = {
    user: UserProps;
};

const Profile: React.FC<ProfileProps> = ({ user }) => {
    return (
        <Stack spacing={"2rem"} direction={"column"} alignItems={"center"}>
            <Avatar
                src={transformImage(user?.avatar?.url)}
                sx={{
                    width: 200,
                    height: 200,
                    objectFit: "contain",
                    marginBottom: "1rem",
                    border: "5px solid whitesmoke",
                }}
            />
            <ProfileCard
                heading={"Username"}
                text={user?.username}
                Icon={<UsernameIcon />}
            />
            <ProfileCard
                heading={"Full Name"}
                text={user?.fullName}
                Icon={<FaceIcon />}
            />
            <ProfileCard
                heading={"Joined"}
                text={moment(user?.createdAt).fromNow()}
                Icon={<CalendarIcon />}
            />
        </Stack>
    );
};

type ProfileCardProps = {
    text: string;
    heading: string;
    Icon?: JSX.Element;
};

const ProfileCard: React.FC<ProfileCardProps> = ({ text, Icon, heading }) => (
    <Stack
        direction={"row"}
        alignItems={"center"}
        spacing={"1rem"}
        color={"whitesmoke"}
        textAlign={"center"}
    >
        {Icon && Icon}

        {/* <Stack>
        <Typography variant="h4">{heading}</Typography>
        <Typography variant="body1">{text}</Typography>
    </Stack> */}
        <Stack>
            <Typography variant="body1">{text}</Typography>
            <Typography color={"gray"} variant="caption">
                {heading}
            </Typography>
        </Stack>
    </Stack>
);

export default Profile;