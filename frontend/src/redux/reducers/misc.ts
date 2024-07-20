import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    isNewGroup: false,
    isAddMember: false,
    isNotification: false,
    isMobileMenu: false,
    isSearch: false,
    isFileMenu: false,
    isDeleteMenu: false,
    isUploadingLoader: false,
    selectedDeleteChat: {
        chatId: "",
        isGroupChat: false,
    },
};

const miscSlice = createSlice({
    name: "misc",
    initialState,
    reducers: {
        setIsNewGroup: (state, action) => {
            state.isNewGroup = action.payload;
        },
        setIsAddMember: (state, action) => {
            state.isAddMember = action.payload;
        },
        setIsNotification: (state, action) => {
            state.isNotification = action.payload;
        },
        setIsMobileMenu: (state, action) => {
            state.isMobileMenu = action.payload;
        },
        setIsSearch: (state, action) => {
            state.isSearch = action.payload;
        },
        setIsFileMenu: (state, action) => {
            state.isFileMenu = action.payload;
        },
        setIsDeleteMenu: (state, action) => {
            state.isDeleteMenu = action.payload;
        },
        setIsUploadingLoader: (state, action) => {
            state.isUploadingLoader = action.payload;
        },
        setSelectedDeleteChat: (state, action) => {
            state.selectedDeleteChat = action.payload;
        },
    },
});

export default miscSlice;
export const {
    setIsNewGroup,
    setIsAddMember,
    setIsNotification,
    setIsMobileMenu,
    setIsSearch,
    setIsFileMenu,
    setIsDeleteMenu,
    setIsUploadingLoader,
    setSelectedDeleteChat,
} = miscSlice.actions;