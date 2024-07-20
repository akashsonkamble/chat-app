export type ProtectedRouteProps = {
	children?: React.ReactNode;
	user: boolean | null;
	redirect?: string;
};

//user
export type UserProps = {
	_id: string;
	username: string;
	email: string;
	fullName: string;
	avatar: AvatarProps;
	createdAt: Date;
};

export type UserItemProps = {
	user: Pick<UserProps, "_id" | "fullName" | "avatar">;
	handler: (id: UserProps["_id"]) => void;
	isAdded?: boolean;
	isLoadingHandler?: boolean;
	// styling?: React.CSSProperties;
	styling?: Record<string, any>;
};

//chat
export type ChatListProps = {
	w?: string;
	chatId: string;
	chats: ChatProps[];
	// onlineUsers: string[];
	onlineUsers: UserProps["_id"][];
	newMessagesAlert: NewMessageAlertProps[];
	chatDeleteHandler: (
		e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
		_id: string,
		isGroupChat: boolean
	) => void;
};

export type ChatProps = {
	_id: string;
	chatName: string;
	avatar: AvatarProps["url"][];
	isGroupChat: boolean;
	members: UserProps["_id"][];
	// members: string[];
};

export type ChatItemProps = {
	_id: string;
	chatName: string;
	avatar: AvatarProps["url"][];
	isGroupChat: boolean;
	isOnline: boolean;
	newMessageAlert?: NewMessageAlertProps;
	sameSender?: boolean;
	chatDeleteHandler: (
		e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
		_id: string,
		isGroupChat: boolean
	) => void;
};

export type NewMessageAlertProps = {
	chatId: string;
	count: number;
};

export type MessageProps = {
	_id: string | number;
	sender: Pick<UserProps, "_id" | "fullName">;
	content: string;
	attachments: AttachmentProps[];
	createdAt: Date;
};

export type NotificationProps = {
	_id: string;
	sender: Pick<UserProps, "_id" | "fullName" | "avatar">;
	content: string;
	chat: ChatProps["_id"];
};

export type AttachmentProps = {
	_id: string;
	public_id: string;
	url: string;
};

// Group
export type GroupListProps = {
	w?: string;
	groups: ChatProps[];
	chatId: string;
};

export type GroupItemProps = {
	group: {
		_id: string;
		chatName: string;
		avatar: AvatarProps["url"][];
	};
	chatId: string;
};

export type AddMemberDialogProps = {
	chatId: string;
};

export type ConfirmDeleteDialogProps = {
	open: boolean;
	closeHandler: () => void;
	deleteHandler: () => void;
};

export type RequestProps = {
	_id: string;
	// accept: boolean;
	status: boolean;
	sender: UserProps["_id"];
	receiver: UserProps["_id"];
};

// Avatar
export type AvatarProps = {
	_id: string;
	public_id: string;
	url: string;
};

export type AvatarCardProps = {
	avatar: AvatarProps["url"][];
	max?: number;
};

export type IconBtnProps = {
	icon: JSX.Element;
	title: string;
	onClick: () => void;
	value?: number;
};
