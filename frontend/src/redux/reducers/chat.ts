import { createSlice } from "@reduxjs/toolkit";
import { NEW_MESSAGE_ALERT } from "../../constants/event";
import { getOrSaveFromLocalStorage } from "../../lib/features";
import { NewMessageAlertProps } from "../../types";

const initialState = {
    notifications: 0,
    newMessagesAlert: getOrSaveFromLocalStorage({
        key: NEW_MESSAGE_ALERT,
        value: [{ chatId: "", count: 0 }],
        get: true,
    }) || [
        {
            chatId: "",
            count: 0,
        },
    ],
};

const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        incrementNotification: (state) => {
            state.notifications = state.notifications + 1;
        },
        resetNotification: (state) => {
            state.notifications = 0;
        },
        setNewMessagesAlert: (state, action) => {
            const chatId = action.payload.chatId;

            const index = state.newMessagesAlert.findIndex(
                (alert: NewMessageAlertProps) => alert.chatId === chatId
            );

            if (index !== -1) {
                state.newMessagesAlert[index].count += 1;
            } else {
                state.newMessagesAlert.push({
                    chatId,
                    count: 1,
                });
            }
        },
        resetNewMessagesAlert: (state, action) => {
            state.newMessagesAlert = state.newMessagesAlert.filter(
                (alert: NewMessageAlertProps) => alert.chatId !== action.payload
            );
        },
    },
});

export default chatSlice;
export const {
    incrementNotification,
    resetNotification,
    setNewMessagesAlert,
    resetNewMessagesAlert,
} = chatSlice.actions;