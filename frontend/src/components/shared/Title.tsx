import { Helmet } from "react-helmet-async";

type TitleProps = {
    title?: string;
    description?: string;
};

const Title: React.FC<TitleProps> = ({
    title = "Chat Fusion",
    description = "Chat with your friends",
}) => {
    return (
        <Helmet>
            <title>{title}</title>
            <meta name="description" content={description} />
        </Helmet>
    );
};
export default Title;