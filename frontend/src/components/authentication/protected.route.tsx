
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, RouteProps } from 'react-router-dom';
import { RootState } from '../../state/reducers';

export type ProtectedRouteProps = {
	children: JSX.Element
} & RouteProps;

// export default function ProtectedRoute({isAuthenticated, authenticationPath, ...routeProps}: ProtectedRouteProps) {
export default function ProtectedRoute({ children }: { children: JSX.Element }) {
	const isLoggedIn = useSelector((state: RootState) => state.authReducer.token) !== '';
	const dispatch = useDispatch();
	// const { logout } = bindActionCreators(actionCreators, dispatch);
	// const location = useLocation();

  if(isLoggedIn) {
		// console.info("[DEBUG] ProtectedRoute: User is logged in, navigating to protected route");
		return children;
  }

	let loginPath = '/auth/login';

	console.info("[DEBUG] ProtectedRoute: User is NOT logged in, going to /login");
  return <Navigate to={loginPath} />;
};