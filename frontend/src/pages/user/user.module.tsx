import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Layout from "../../components/layout/layout.component";
import NotFoundPage from "../not-found.page";
import ChangeNamePage from './change-name.page';
import ChangePasswordPage from "./change-password.page";
import LiveDecodePage from "./live-transcribe.page";
import OfflineTranscribePage from "./offline-transcribe-page";
import OverviewPage from "./overview.page";
import ProfilePage from "./profile.page";
import ViewAllJobs from "./view-all-jobs.page";
import ViewOneTranscript from "./view-one-transcript";
import Notes from "./notes.page";
import OneNote from "./edit-one-note.page";
import RecordPage from "./record.page";
import SharedNotes from "./SharedNotes.page";

const UserModule: React.FC = () => {

	const location = useLocation();

	useEffect(() => {
		document.getElementsByClassName('pushable')[0]?.scrollTo({
			top: 0,
			behavior: 'smooth'
		});
	}, [location]);

	return (
		<Layout>
			<Routes>
				<Route path='/' element={<OverviewPage />}></Route>	
				<Route path='overview' element={<OverviewPage />}></Route>	
				<Route path='livetranscribe' element={<LiveDecodePage />}></Route>	
				<Route path='viewalljobs' element={<ViewAllJobs/>}></Route>
				<Route path='offlinetranscribe' element={<OfflineTranscribePage />}></Route>	
				<Route path='viewonetranscript' element={<ViewOneTranscript />}></Route>	
				<Route path='profile' element={<ProfilePage />}></Route>	
				<Route path='changepassword' element={<ChangePasswordPage />}></Route>
				<Route path='changename' element={<ChangeNamePage />}></Route>
				<Route path='*' element={<NotFoundPage />}></Route>
				<Route path='notes' element={<Notes />}></Route>	
				<Route path='oneNote' element={<OneNote />}></Route>	
				<Route path='record' element={<RecordPage />}></Route>	
				<Route path='sharedNotes' element={<SharedNotes />}></Route>	
			</Routes>
		</Layout>
	);
};

export default UserModule;