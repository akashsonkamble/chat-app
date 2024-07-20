import { createContext, useContext, useMemo } from "react";
import io from "socket.io-client";
import { server } from "./constants/config";

const SocketContext = createContext({} as any);

const getSocket = () => useContext(SocketContext);

const SocketProvider = ({ children }: { children: JSX.Element }) => {
    const socket = useMemo(
        () =>
            io(server, {
                withCredentials: true,
            }),
        []
    );
    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};

export { SocketProvider, getSocket };