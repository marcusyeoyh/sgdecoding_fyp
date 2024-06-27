import { useLocation } from "react-router-dom";
import { Container } from "semantic-ui-react";

const NotFoundPage = () => {
	
	const { pathname, hash, key, search, state  } = useLocation();

	return (
		<Container textAlign='center'>
			<h1>404</h1>
			<h2>Page Not Found!</h2>

			<div style={{border: '1px solid #eee'}}>
				<code >
					DEBUG: <br/>
					<strong>pathname: </strong> {pathname} <br />
					<strong>hash: </strong> {hash}  <br />
					<strong>key: </strong> {key} <br />
					<strong>search: </strong> {search} <br />
					<strong>state: </strong> {state} <br />
				</code>
			</div>

			<p>&lt; To be done &gt;</p>
		</Container>
	);
};

export default NotFoundPage;