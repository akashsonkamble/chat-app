import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { server } from "../../constants/config";
import {
    ChatProps,
    MessageProps,
    NotificationProps,
    RequestProps,
    UserProps,
} from "../../types";

const api = createApi({
    reducerPath: "api",
    baseQuery: fetchBaseQuery({
        baseUrl: `${server}/api/v1/`,
    }),
    tagTypes: ["Chat", "User", "Message"],
    endpoints: (builder) => ({
        myChats: builder.query<{ chats: Partial<ChatProps[]> }, string>({
            query: () => ({
                url: "chats/my-chats",
                credentials: "include",
            }),
            keepUnusedDataFor: 0,
        }),
        searchUser: builder.query<{ users: UserProps[] }, string>({
            query: (name) => ({
                url: `users/search?name=${name}`,
                credentials: "include",
            }),
            providesTags: ["User"],
        }),
        sendFriendRequest: builder.mutation<
            { message: string },
            { userId: UserProps["_id"] }
        >({
            query: (data) => ({
                url: "users/send-request",
                method: "PUT",
                credentials: "include",
                body: data,
            }),
            invalidatesTags: ["User"],
        }),
        getNotifications: builder.query<
            { notifications: NotificationProps[] },
            void
        >({
            query: () => ({
                url: "users/notifications",
                credentials: "include",
            }),
            keepUnusedDataFor: 0,
        }),
        acceptFrientRequest: builder.mutation<
            { success: boolean; message: string },
            { requestId: RequestProps["_id"]; accept: boolean }
        >({
            query: (data) => ({
                url: "users/accept-request",
                method: "PUT",
                credentials: "include",
                body: data,
            }),
            invalidatesTags: ["Chat"],
        }),
        chatDetails: builder.query<
            { chat: ChatProps },
            { chatId: string; populate?: boolean; skip?: boolean }
        >({
            query: ({ chatId, populate = false }) => {
                let url = `chats/${chatId}`;

                if (populate) url += "?populate=true";

                return {
                    url,
                    credentials: "include",
                };
            },
            providesTags: ["Chat"],
        }),
        getMessages: builder.query<
            { messages: MessageProps[]; totalPages: number },
            { chatId: string; page?: number }
        >({
            query: ({ chatId, page }) => ({
                url: `chats/messages/${chatId}?page=${page}`,
                credentials: "include",
            }),
            transformResponse: (response: {
                messages: MessageProps[];
                totalPages: number;
            }) => ({
                messages: response.messages,
                totalPages: response.totalPages,
            }),
            keepUnusedDataFor: 0,
        }),
        sendAttachments: builder.mutation<
            { message: string },
            { chatId: string; attachments: File[] }
        >({
            query: (data) => {
                const formData = new FormData();
                formData.append("chatId", data.chatId);
                data.attachments.forEach((file) => {
                    formData.append(`files`, file);
                });
                return {
                    url: `chats/messages`,
                    method: "POST",
                    credentials: "include",
                    body: formData,
                };
            },
        }),
        getMyGroup: builder.query<{ groups: ChatProps[] }, void>({
            query: () => ({
                url: "chats/my-groups",
                credentials: "include",
            }),
            providesTags: ["Chat"],
        }),
        availableFriends: builder.query<
            { friends: UserProps[] },
            void | ChatProps["_id"]
        >({
            query: (chatId) => {
                let url = `users/friends`;
                if (chatId) url += `?chatId=${chatId}`;

                return {
                    url,
                    credentials: "include",
                };
            },
            providesTags: ["Chat"],
        }),
        newGroup: builder.mutation<
            { success: boolean; message: string },
            { chatName: ChatProps["chatName"]; members: ChatProps["members"] }
        >({
            query: ({ chatName, members }) => ({
                url: "chats/new/group",
                method: "POST",
                credentials: "include",
                body: { chatName, members },
            }),
            invalidatesTags: ["Chat"],
        }),
        renameGroup: builder.mutation<
            { success: boolean; message: string },
            { chatId: ChatProps["_id"]; chatName: ChatProps["chatName"] }
        >({
            query: ({ chatId, chatName }) => ({
                url: `chats/${chatId}`,
                method: "PUT",
                credentials: "include",
                body: { chatName },
            }),
            invalidatesTags: ["Chat"],
        }),
        addGroupMembers: builder.mutation<
            { success: boolean; message: string },
            { chatId: ChatProps["_id"]; members: ChatProps["members"] }
        >({
            query: ({ chatId, members }) => ({
                url: `chats/add-members`,
                method: "PUT",
                credentials: "include",
                body: { chatId, members },
            }),
            invalidatesTags: ["Chat"],
        }),
        removeGroupMember: builder.mutation<
            { success: boolean; message: string },
            { chatId: ChatProps["_id"]; userId: UserProps["_id"] }
        >({
            query: ({ chatId, userId }) => ({
                url: `chats/remove-member`,
                method: "PUT",
                credentials: "include",
                body: { chatId, userId },
            }),
            invalidatesTags: ["Chat"],
        }),
        deleteChat: builder.mutation<
            { success: boolean; message: string },
            ChatProps["_id"]
        >({
            query: (chatId) => ({
                url: `chats/${chatId}`,
                method: "DELETE",
                credentials: "include",
            }),
            invalidatesTags: ["Chat"],
        }),
        leaveGroup: builder.mutation<
            { success: boolean; message: string },
            ChatProps["_id"]
        >({
            query: (chatId) => ({
                url: `chats/leave-group/${chatId}`,
                method: "DELETE",
                credentials: "include",
            }),
            invalidatesTags: ["Chat"],
        }),
    }),
});

export default api;
export const {
    useMyChatsQuery,
    useLazySearchUserQuery,
    useSendFriendRequestMutation,
    useGetNotificationsQuery,
    useAcceptFrientRequestMutation,
    useChatDetailsQuery,
    useGetMessagesQuery,
    useSendAttachmentsMutation,
    useGetMyGroupQuery,
    useAvailableFriendsQuery,
    useNewGroupMutation,
    useRenameGroupMutation,
    useAddGroupMembersMutation,
    useRemoveGroupMemberMutation,
    useDeleteChatMutation,
    useLeaveGroupMutation,
} = api;