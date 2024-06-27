import React from "react";
import { useSelector } from 'react-redux';
import { Link } from "react-router-dom";
import { Button, Card } from 'semantic-ui-react';
import { RootState } from '../../state/reducers';

const ProfilePage: React.FC = () => {
	const { name, role, email, type } = useSelector((state: RootState) => state.authReducer);
	return (
		<Card.Group>
			<Card>
				<Card.Content>
					<Card.Header>
						<span>Your Display Name</span>
						{/* <span> */}
							{/* <Link className={styles.editLink} to='/changename'>Edit</Link> */}
						{/* </span> */}
					</Card.Header>
					<Card.Description>
						<p><strong>{name}</strong></p>
						<Button primary as={Link} to='/changename' style={{ width: '100%', marginTop: '16px'}}>Change Your Name</Button>
					</Card.Description>
				</Card.Content>
			</Card>
			<Card>
				<Card.Content>
					<Card.Header>Email Address</Card.Header>
					<Card.Description>
						<strong>{email}</strong>
					</Card.Description>
				</Card.Content>
			</Card>
			<Card>
				<Card.Content>
					<Card.Header>
						<span>Password</span>
					</Card.Header>
					<Card.Description>
						<p>****************</p>
						<Button aria-label='Change Password' primary as={Link} to='/changepassword' style={{ width: '100%', marginTop: '16px'}}>Change Password</Button>
					</Card.Description>
				</Card.Content>
			</Card>
			<Card>
				<Card.Content>
					<Card.Header>Role</Card.Header>
					<Card.Description>
						<strong>{role}</strong>
					</Card.Description>
				</Card.Content>
			</Card>
			<Card>
				<Card.Content>
					<Card.Header>User Type</Card.Header>
					<Card.Description>
						<strong>{type}</strong>
					</Card.Description>
				</Card.Content>
			</Card>
		</Card.Group>

	);
};

export default ProfilePage;