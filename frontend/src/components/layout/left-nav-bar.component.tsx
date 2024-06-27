import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { bindActionCreators } from "redux";
import { Container, Icon, Image, Menu, Ref, Sidebar } from "semantic-ui-react";
import { useWindowSize } from "../../helpers/window-resize-hook";
import { actionCreators } from "../../state";
import { RootState } from "../../state/reducers";
import styles from './left-nav-bar.module.scss';

interface Props {
	children: any;
}

const LeftNavBar: React.FC<Props> = ({ children }) => {
	const { IS_OPEN } = useSelector((state: RootState) => state.navbarReducer);

	const [visible, setVisible] = useState(false);

	const { pathname } = useLocation();

	const dispatch = useDispatch();
	const { toggleSidebar } = bindActionCreators(actionCreators, dispatch);
	const [width, height] = useWindowSize();
	const closeableRef = useRef(null!);

	const onMenuItemClick = () => {
		if(width < 1200){
			setVisible(false);
		}
	};

	/**
	 * Open the sidebar if screen resized to > 1200, else hide the sidebar
	 */
	useEffect(() => {
		console.log("[DEBUG] leftNavBar -> IS_OPEN Changed");
		if ((width < 1200 && IS_OPEN) || (width >= 1200 && !IS_OPEN))
			toggleSidebar();
	// Only want width and height to trigger this
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [width, height]);

	/**
	 * Display/hide the sidebar when toggled
	 */
	useEffect(() => {
		console.log("[DEBUG] Set visible: " + IS_OPEN);
		setVisible(IS_OPEN);
	}, [IS_OPEN]);

	return (
		// TODO Add Hamburger button
		// and make it pushable
		<Sidebar.Pushable id={styles.sidebarContainer}>
			<Sidebar
				as={Menu}
				animation='overlay'
				icon='labeled'
				onHide={() => setVisible(false)}
				vertical
				visible={visible}
				target={closeableRef}
				id={styles.sidebar}
			>
				<Menu.Item
					as={Link}
					to="/"
					active={pathname === '/'}
					onClick={onMenuItemClick}
					className={pathname === '/' ? styles.active : ''}
				>
					<Icon name='home' />
					Overview
				</Menu.Item>

				<Menu.Item
					as={Link}
					to="/viewalljobs"
					onClick={onMenuItemClick}
					active={pathname === '/viewalljobs'}
					className={pathname === '/viewalljobs' ? styles.active : ''}
				>
					<Icon name='list layout' />
					View All Jobs
				</Menu.Item>

				<Menu.Item
					as={Link}
					to="/livetranscribe"
					onClick={onMenuItemClick}
					active={pathname === '/livetranscribe'}
					className={pathname === '/livetranscribe' ? styles.active : ''}
				>
					<Icon name='microphone' />
					Live Transcribe
				</Menu.Item>

				<Menu.Item
					as={Link}
					to="/offlinetranscribe"
					onClick={onMenuItemClick}
					active={pathname === '/offlinetranscribe'}
					className={pathname === '/offlinetranscribe' ? styles.active : ''}
				>
					<Icon name='file audio' />
					Offline Transcribe
				</Menu.Item>

				<Menu.Item
					aria-label='notes page'
					as={Link}
					to="/notes"
					onClick={onMenuItemClick}
					active={pathname === '/notes'}
					className={pathname === '/notes' ? styles.active : ''}
				>
					<Icon name='sticky note' />
					Notes
				</Menu.Item>

				<Menu.Item
					aria-label='share notes page'
					as={Link}
					to="/sharedNotes"
					onClick={onMenuItemClick}
					active={pathname === '/sharedNotes'}
					className={pathname === '/sharedNotes' ? styles.active : ''}
				>
					<Icon name='sticky note' />
					Shared Notes
				</Menu.Item>

				<Menu.Item id={styles.ackCont}>
					<div id={styles.ack}>
						<p>A joint-project in collaboration between</p>
						<Image as="a" href="https://www.ntu.edu.sg/" src="/images/logo_col_ntu.svg" alt="" />
						<Image as="a" href="https://www.nus.edu.sg/" src="/images/logo_col_nus.svg" alt="" />
						<Image as="a" href="https://aisingapore.org/" src="/images/logo_col_ai_sg.svg" alt="" />
						<Image as="a" href="https://www.abax.ai/" src="/images/logo_col_abax.svg" alt="" />
					</div>
				</Menu.Item>
			</Sidebar>

			<Ref innerRef={closeableRef}>
				<div id={styles.closeableArea}></div>
			</Ref>
			<Sidebar.Pusher id={styles.pusherContainer} dimmed={width < 1200 ? visible : undefined}>
				<Container id={styles.mainContentContainer}>
					{children}
				</Container>
			</Sidebar.Pusher>
		</Sidebar.Pushable>

	);
};

export default LeftNavBar;