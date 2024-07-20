import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Socket } from "socket.io-client";

const useErrors = (
    errors: { isError: boolean; error?: any; fallback?: () => void }[] = []
) => {
    useEffect(() => {
        errors.forEach(({ isError, error, fallback }) => {
            if (isError) {
                if (fallback) fallback();
                else
                    toast.error(
                        error?.response?.data?.message || "Something went wrong"
                    );
            }
        });
    }, [errors]);
};

const useAsyncMutation = (mutationHook: any) => {
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState<null>(null);

    const [mutate] = mutationHook();

    const executeMutation = async (toastMessage: string, args: any) => {
        setIsLoading(true);
        const toastId = toast.loading(toastMessage || "Updating data...");

        try {
            const res = await mutate(args);
            if (res.data) {
                toast.success(res.data.message || "Updated data successfully", {
                    id: toastId,
                });
                setData(res.data);
            } else {
                toast.error(
                    res?.error?.data?.message || "Something went wrong",
                    {
                        id: toastId,
                    }
                );
            }
        } catch (error) {
            toast.error("Something went wrong", { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };

    return [executeMutation, isLoading, data] as const;
};

const useSocketEvents = (
    socket: Socket,
    handlers: { [key: string]: (...args: any) => void }
) => {
    useEffect(() => {
        Object.entries(handlers).forEach(([event, handler]) => {
            socket.on(event, handler);
        });

        return () => {
            Object.entries(handlers).forEach(([event, handler]) => {
                socket.off(event, handler);
            });
        };
    }, [socket, handlers]);
};

export { useErrors, useAsyncMutation, useSocketEvents };