import React from 'react';
import { Route, Routes } from "react-router-dom";
import { Card, Grid, Image } from 'semantic-ui-react';
import ParticlesBackground from '../../components/layout/particles-background.component';
import NotFoundPage from '../not-found.page';
import styles from './authentication.module.scss';
import ForgotPwdPage from './forgot-pwd.page';
import LoginPage from './login.page';
import RegisterPage from './register.page';
import ResetPasswordPage from './reset-password.page';

const AuthenticationModule: React.FC = () => {

	return (
		<div id={styles.authContainer}>
			<ParticlesBackground />
			<Grid centered id={styles.authContainerGrid}>
				<Card id={styles.authCard}>
					<Routes>
						<Route path='login' element={<LoginPage />} />
						<Route path='register' element={<RegisterPage />} />
						<Route path='forgotpassword' element={<ForgotPwdPage />} />
						<Route path='resetpassword' element={<ResetPasswordPage />} />
						<Route path='*' element={<NotFoundPage />}></Route>
					</Routes>
				</Card>
			</Grid>

			<div id={styles.ackContainer}>
				<div id={styles.acknow}>
					<p>A joint-project in collaboration between</p>
					<Image as="a" href="https://www.ntu.edu.sg/" src="/images/logo_col_ntu.svg" alt="" />
					<Image as="a" href="https://www.nus.edu.sg/" src="/images/logo_col_nus.svg" alt="" />
					<Image as="a" href="https://aisingapore.org/" src="/images/logo_col_ai_sg.svg" alt="" />
					<Image as="a" href="https://www.abax.ai/" src="/images/logo_col_abax.svg" alt="" />
				</div>
			</div>

		</div>
	);
};

export default AuthenticationModule;