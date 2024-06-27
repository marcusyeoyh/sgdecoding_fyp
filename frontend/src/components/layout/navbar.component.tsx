import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from 'react-router-dom';
import { bindActionCreators } from "redux";
import { Button, Dropdown, DropdownItemProps, Icon, Image, Menu, MenuItemProps } from "semantic-ui-react";
import { useWindowSize } from "../../helpers/window-resize-hook";
import { actionCreators } from "../../state";
import { RootState } from "../../state/reducers";
import styles from './navbar.module.scss';

const NavBar: React.FC = () => {
	const clientId = "1039595781587-potv30k7s7j34kq4k1lt5afpffh92qhk.apps.googleusercontent.com";


	const { name } = useSelector((state: RootState) => state.authReducer);

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [width, height] = useWindowSize();

	const dispatch = useDispatch();
	const { toggleSidebar, logout } = bindActionCreators(actionCreators, dispatch);
	const navigate = useNavigate();

	const onLogoutClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, data: DropdownItemProps) => {
		logout();
		navigate('/auth/login?logoutMsg=' + "We hope to see you again soon!");
	};

	const onHamburgerClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, data: MenuItemProps) => {
		console.log("[DEBUG] onHamburgerClick");
		toggleSidebar();
	};

	return (
		<Menu id={styles.menuContainer}>
			<Menu.Item aria-label="expand menu" as={Button} style={width < 1200 ? { display:'block' } : { display: 'none' }} id={styles.sidebarBtn} onClick={onHamburgerClick}>
				<Icon name='sidebar' size='large' />
			</Menu.Item>

			<Menu.Item as={Link} to="/" id={styles.logo}>
				<Image src='/images/Main_logo.svg' alt='main logo' width="274" />
			</Menu.Item>

			<Menu.Menu position='right' id={styles.profileDropdown}>
				<Dropdown
					trigger={(<span><Icon name='user' />{name}</span>)}
					inline
					item
					icon='caret down'
					aria-label="profile dropdown"
					>
					<Dropdown.Menu>
						<Dropdown.Item as={Link} to='profile' aria-label="my profile option">Profile</Dropdown.Item>
						{/* <Dropdown.Item as={Link} to='changename'>Change Name</Dropdown.Item>
						<Dropdown.Item as={Link} to='changepassword'>Change Password</Dropdown.Item> */}
						<Dropdown.Item aria-label="log out option" onClick={onLogoutClick}>Log Out</Dropdown.Item>
					</Dropdown.Menu>
				</Dropdown>
			</Menu.Menu>

		</Menu>
	);
};

export default NavBar;