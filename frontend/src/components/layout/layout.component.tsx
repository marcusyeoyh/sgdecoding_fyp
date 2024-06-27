import React from "react";
import classes from './layout.module.scss';
import LeftNavBar from "./left-nav-bar.component";
import NavBar from "./navbar.component";

interface Props {
	children: any;
}


const Layout: React.FC<Props> = ({ children }) => {

	return (
		<div className={classes.layout}>
			<NavBar />
			<LeftNavBar> 
				{/* TOREFACTOR  */}
				<main id={classes.main}> 
					{children}
				</main>
			</LeftNavBar>
		</div>
	);
};

export default Layout;