import axios from "axios";
import { Suspense, lazy, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { BrowserRouter, Route, Routes, useParams } from "react-router-dom";
import { SocketProvider } from "./Socket";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { LayoutLoaders } from "./components/layout/Loaders";
import { server } from "./constants/config";
import { useAppDispatch, useAppSelector } from "./redux/hooks";
import { login, logout } from "./redux/reducers/auth";

const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Chat = lazy(() => import("./pages/Chat"));
const Groups = lazy(() => import("./pages/Groups"));
const Error = lazy(() => import("./pages/Error"));

const App = () => {
	const dispatch = useAppDispatch();
	const { user, loading } = useAppSelector((state) => state.auth) as {
		user: boolean | null;
		loading: boolean;
	};

	const params = useParams();
	const chatId = params.chatId as string;

	useEffect(() => {
		const fetchProfile = async () => {
			try {
				const { data } = (await axios.get(
					`${server}/api/v1/users/profile`,
					{
						headers: {
							"Content-Type": "application/json",
						},
						withCredentials: true,
					}
				)) as { data: { user: boolean | null } };
				dispatch(login(data.user));
			} catch (error: any) {
				toast.error(
					error?.response?.data?.message || "Something went wrong"
				);
				dispatch(logout());
			}
		};

		fetchProfile();
	}, [dispatch]);

	return loading ? (
		<LayoutLoaders />
	) : (
		<BrowserRouter>
			<Suspense fallback={<LayoutLoaders />}>
				<Routes>
					<Route
						element={
							<SocketProvider>
								<ProtectedRoute user={user} />
							</SocketProvider>
						}
					>
						<Route path="/" element={<Home />} />
						<Route
							path="/chat/:chatId"
							element={<Chat chatId={chatId} />}
						/>
						<Route path="/groups" element={<Groups />} />
					</Route>
					<Route
						path="/login"
						element={
							<ProtectedRoute user={!user} redirect="/">
								<Login />
							</ProtectedRoute>
						}
					/>
					<Route path="*" element={<Error />} />
				</Routes>
			</Suspense>
			<Toaster position="bottom-right" />
		</BrowserRouter>
	);
};

export default App;
