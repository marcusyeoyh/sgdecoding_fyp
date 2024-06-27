import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Header, Segment, TransitionablePortal } from "semantic-ui-react";


interface Props {
	shouldOpen: boolean
}

const SubscriptionEndPortal: React.FC<Props> = ({ shouldOpen }) => {
	const [showPortal, setShowPortal] = useState(false);

	const togglePortal = () => {
		console.log("[DEBUG] togglePortal()");
		// setShowPortal(false);
	};

	useEffect(() => {
		if(shouldOpen)
			setShowPortal(shouldOpen);
	}, [shouldOpen]);

	return (
		<TransitionablePortal onClose={togglePortal} open={showPortal}>
			<Segment
				style={{ left: '45%', position: 'fixed', top: '50%', zIndex: 10 }}
			>
				<Header>Oh no!</Header>
				<p>Unfortunately, it appears your subscription/free trial period has ended!</p>
				<p>To access these features, you need a valid subscription!</p>
				<p><Link to="/">Please click here to get a new subscription!</Link></p>
			</Segment>
		</TransitionablePortal>
	);
};

export default SubscriptionEndPortal;