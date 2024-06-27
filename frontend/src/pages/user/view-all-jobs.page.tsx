import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { Link, useSearchParams } from "react-router-dom";
import { bindActionCreators } from "redux";
import { Button, Container, Dropdown, DropdownProps, Form, Grid, Header, Icon, InputOnChangeData, List, Loader, Pagination, PaginationProps, Popup } from "semantic-ui-react";
import DownloadTranscriptButton from "../../components/audio/download-transcript-btn";
import { BatchTranscriptionHistory, LiveTranscriptionHistory } from "../../models/transcribe-history-response.model";
import { actionCreators } from "../../state";
import { RootState } from "../../state/reducers";
import styles from './view-all-jobs.module.scss';

const ITEMS_PER_PAGE = 9;

interface TranscriptionHistoryFilter {
	type: string,
	lang: string[],
	duration: string,
	startDate: string,
	endDate: string,
	searchStr: string
}

const ViewAllJobs: React.FC = () => {
	const navigate = useNavigate();
	const { history, totalHistory } = useSelector((state: RootState) => state.transcriptionHistoryReducer);
	const dispatch = useDispatch();
	const { getLoggedInUserTranscriptionHistory, setSelectedTranscriptionHistory } = bindActionCreators(actionCreators, dispatch);
	const [isLoading, setIsLoading] = useState(false);

	const [noOfPages, setNoOfPages] = useState(0);
	const [itemsToDisplay, setItemsToDisplay] = useState<Array<LiveTranscriptionHistory | BatchTranscriptionHistory>>([]);
	const [filteredHistory, setFilteredHistory] = useState<Array<LiveTranscriptionHistory | BatchTranscriptionHistory>>([]);
	const [defDateVals, setDefDateVals] = useState<{ startDate: string, endDate: string }>(); // workaround, can't get setValue to work
	const [displayWelcomeMsg, setDisplayWelcomeMsg] = useState(false);

	const [filters, setFilters] = useState<TranscriptionHistoryFilter>({
		type: '',
		lang: [],
		duration: '',
		startDate: '',
		endDate: '',
		searchStr: ''
	});

	const [searchParams, setSearchParams] = useSearchParams();
	const [currentPage, setCurrentPage] = useState(1);

	const typeFilterOptions = [
		{ key: 'none', text: 'Both', value: '' },
		{ key: 'live', text: "Live", value: 'live' },
		{ key: 'batch', text: "Offline", value: 'batch' }
	];

	const langFilterOptions = [
		{ key: 'english', text: 'English', value: 'english' },
		{ key: 'malay', text: 'Malay', value: 'malay' },
		{ key: 'mandarin', text: 'Mandarin', value: 'mandarin' },
		{ key: 'english-malay', text: 'English-Malay', value: 'english-malay' },
		{ key: 'english-mandarin', text: 'English-Mandarin', value: 'english-mandarin' }
	];

	const {
		register,
		setValue,
		// watch,
		getValues,
		trigger,
		formState: { errors }
	} = useForm({ mode: 'onChange' });

	const lengthFilterOptions = [
		{ key: 'all', text: 'All', value: '' },
		{ key: 'short', text: '< 3 mins', value: 'short' },
		{ key: 'medium', text: '3 - 10mins', value: 'medium' },
		{ key: 'long', text: '> 10mins', value: 'long' }
	];

	const usePrevious = (value: any) => {
		const ref = useRef();
		useEffect(() => {
			ref.current = value;
		});
		return ref.current;
	};
	const previousSearchParam = usePrevious(searchParams);

	const addSearchParam = (key: string, value: any) => {
		const newParams = searchParams;
		if (newParams.has(key)) {
			if (value !== null) {
				newParams.set(key, value);
			} else {
				newParams.delete(key);
			}
		} else {
			newParams.append(key, value);
		}
		// console.log("param string");
		// console.log(newParams.toString());
		setSearchParams(newParams);
	};

	const handleTypeFilterChange = (e: React.SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => {
		console.log(data);
		setFilters({ ...filters, type: data.value as string });
		addSearchParam("type", data.value as string);
	};

	const handleLangFilterChange = (e: React.SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => {
		console.log(data);
		// if(data.value !== '')
		setFilters({ ...filters, lang: data.value as [] });
		console.log(filters);
		addSearchParam("lang", data.value?.toString());
	};

	const handleLengthFilterChange = (e: React.SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => {
		console.log(data);
		setFilters({ ...filters, duration: data.value as string });
		addSearchParam("duration", data.value as string);
	};

	const checkLangExists = (input: string) => {
		var found = false;
		for (const langOption of langFilterOptions) {
			if (input === langOption.value) {
				found = true;
			}
		}
		return found;
	};
	const checkTypeExists = (input: string) => {
		var found = false;
		for (const typeOption of typeFilterOptions) {
			if (input === typeOption.value) {
				found = true;
			}
		}
		return found;
	};

	const checkLengthExists = (input: string) => {
		var found = false;
		for (const lengthOption of lengthFilterOptions) {
			if (input === lengthOption.value) {
				found = true;
			}
		}
		return found;
	};

	const handlePageChange = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, { activePage }: PaginationProps) => {
		// console.log("Selected page: " + activePage);
		// if (filters.duration === '' && filters.lang[0] === '' && filters.type === '') {
		activePage = activePage as number;
		let startIdx = (ITEMS_PER_PAGE * (activePage - 1));
		let endIdx = ((activePage * ITEMS_PER_PAGE));
		setItemsToDisplay(filteredHistory.slice(startIdx, endIdx));
		// }
		addSearchParam("page", activePage);
		setCurrentPage(activePage);
	};

	const handlePopupOpen = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
		console.log("[DEBUG] Form values when popup triggered");
		console.log(getValues("startDate"));
		console.log(getValues("endDate"));

		if (history != null) {
			if (filters.startDate === '' && filters.endDate === '') {
				let startDate = history[history.length - 1].createdAt.slice(0, 10);
				let endDate = history[0].createdAt.slice(0, 10);
				setFilters({ ...filters, startDate, endDate });

				// Set the default start date and end date in filters
				setDefDateVals({ startDate, endDate });
				setValue("startDate", startDate);
				setValue("endDate", endDate);
			}
		}
	};

	const handleViewBtnClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, id: string) => {
		console.log(e);
		console.log(id);
		if (history != null) {
			let clickedTranscriptHistory = history.find(h => h._id === id);

			if (clickedTranscriptHistory) {
				setSelectedTranscriptionHistory(clickedTranscriptHistory);
				navigate(`/viewonetranscript?id=${id}`);
			}

			//TODO show a toast error
		}

	};

	const onDateInputChange = (e: React.ChangeEvent<HTMLInputElement>, { name, value }: InputOnChangeData) => {
		setValue(name, value);
		trigger(['startDate', 'endDate']);
		setFilters({ ...filters, startDate: getValues("startDate"), endDate: getValues("endDate") });
		// because form is re-created when popup is opened again
		setDefDateVals({ startDate: getValues("startDate"), endDate: getValues("endDate") });
		addSearchParam("startdate", getValues("startDate"));
		addSearchParam("enddate", getValues("endDate"));
	};

	const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
		console.log(data);
		const { value } = data;
		setFilters({ ...filters, searchStr: value });
		addSearchParam("search", value);
	};

	useEffect(() => {
		setIsLoading(true);
		getLoggedInUserTranscriptionHistory();

		register("startDate", {
			// valueAsDate: true,
			validate: sD => sD <= getValues("endDate") || 'Start Date must be before or same as End Date'
		});

		register("endDate", {
			// valueAsDate: true,
			validate: eD => eD >= getValues("startDate") || 'End Date must be after or same as Start Date'
		});

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [register, getValues]);

	/**
	 * Set the paginator and display the first transcription history
	 */
	useEffect(() => {
		console.log("[DEBUG] Total Transcription History count: " + totalHistory);
		console.log(history);
		if (history != null) {
			setIsLoading(false);
			if (history.length > 0) {
				setDisplayWelcomeMsg(false);
				setNoOfPages(Math.ceil(history.length / ITEMS_PER_PAGE));
				let startIdx = (ITEMS_PER_PAGE * (currentPage - 1));
				let endIdx = ((currentPage * ITEMS_PER_PAGE));
				setItemsToDisplay(history.slice(startIdx, endIdx));
			} else {
				setDisplayWelcomeMsg(true);
			}
		}
	}, [history, totalHistory, currentPage]); // history, totalHistory

	/**
	 * Change the displayed transcription history as user changed the filters
	 */
	useEffect(() => {
		console.log("[DEBUG] Filtering ... ...");
		// console.log(history);
		if (history != null) {
			let searchStrLC = filters.searchStr.toLowerCase();
			let filteredItems = history.filter((i) => {
				let audioDuration = (i as LiveTranscriptionHistory).liveSessionDuration | i.input[0].file.duration;
				if (filters.duration !== '') {
					if (filters.duration === 'short' && (audioDuration > 180))
						return false;
					else if (filters.duration === 'medium' && (audioDuration < 180 || audioDuration > 600))
						return false;
					else if (filters.duration === 'long' && audioDuration < 600)
						return false;
				}

				if (filters.type !== '' && i.type !== filters.type)
					return false;

				if (filters.lang.length !== 0 && !filters.lang.includes(i.lang))
					return false;

				if (filters.startDate !== '' && filters.endDate !== '') {
					if (i.createdAt.slice(0, 10) < filters.startDate
						|| i.createdAt.slice(0, 10) > filters.endDate)
						return false;
				}

				// console.log(i.title);
				if (searchStrLC !== '') {
					if (!i.title.toLowerCase().includes(searchStrLC)
						&& !i.input[0].file.filename.toLowerCase().includes(searchStrLC)
						&& !i.lang.toLowerCase().includes(searchStrLC)
						&& !i.input[0].file.mimeType.toLowerCase().includes(searchStrLC)
					)
						return false;
				}

				return true;
			});
			console.log(filteredItems);
			console.log("[DEBUG] filtered results length: " + filteredItems.length);
			setFilteredHistory(filteredItems);

			let startIdx = (ITEMS_PER_PAGE * (currentPage - 1));
			let endIdx = ((currentPage * ITEMS_PER_PAGE));
			console.log("filter current page: " + currentPage);
			console.log("filter start index: " + startIdx);
			console.log("filter end index: " + endIdx);
			setItemsToDisplay(filteredItems.slice(startIdx, endIdx));

			//setItemsToDisplay(filteredItems.slice(0, ITEMS_PER_PAGE));
			setNoOfPages(Math.ceil(filteredItems.length / ITEMS_PER_PAGE));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [filters, history, searchParams, currentPage]); // change in history should not trigger this

	useEffect(() => {
		if (searchParams !== previousSearchParam) {
			const currentParams = Object.fromEntries([...searchParams]);
			for (const key in currentParams) {
				if (key === "lang") {
					const langSplit = currentParams[key].split(",");
					langSplit.forEach(langItem => {
						if (!checkLangExists(langItem)) {
							langSplit.splice(langSplit.indexOf(langItem), 1);
						}
					});
					setFilters(filters => ({ ...filters, lang: langSplit as [] }));
				}
				if (key === "type" && checkTypeExists(currentParams[key]))
					setFilters(filters => ({ ...filters, type: currentParams[key] }));

				if (key === "duration" && checkLengthExists(currentParams[key]))
					setFilters(filters => ({ ...filters, duration: currentParams[key] }));

				if (key === "startdate")
					setFilters(filters => ({ ...filters, startDate: currentParams[key] }));

				if (key === "enddate")
					setFilters(filters => ({ ...filters, endDate: currentParams[key] }));
				if (key === "page") {
					const pageNum = Number(currentParams[key]);
					console.log("search param page number:" + pageNum);
					setCurrentPage(pageNum);
					// let startIdx = (ITEMS_PER_PAGE * (pageNum - 1));
					// let endIdx = ((pageNum * ITEMS_PER_PAGE));
					// setItemsToDisplay(filteredHistory.slice(startIdx, endIdx));
				}

				if (key === "search")
					setFilters(filters => ({ ...filters, searchStr: currentParams[key] }));

			}
		} //history, filteredHistory, itemsToDisplay, totalHistory, filters
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [previousSearchParam, searchParams]);

	const renderIcon = (h: (LiveTranscriptionHistory | BatchTranscriptionHistory)) => {
		if (h.type === 'live') {
			return (
				<Icon.Group size='big' className={styles.historyItemIcon}>
					<Icon size='large' name='circle' />
					<Icon name='microphone' />
				</Icon.Group>
			);
		} else { // batch transcribe has 4 statuses: 1. created, 2. decoding, 3. done, 4. error 
			if (h.input[0].status === 'error')
				return (
					<Popup content='Error Processing!'
						trigger={
							<Icon.Group size='big' className={styles.historyItemIcon}>
								<Icon size='large' name='circle' className={styles.historyItemIconError} />
								<Icon name='file audio' />
							</Icon.Group>
						} />
				);
			if (h.status === 'processing')
				return (
					<Popup content='Processing...'
						trigger={
							<Icon.Group size='big' className={styles.historyItemIcon}>
								<Icon size='large' loading name='circle notched' />
								<Icon name='file audio' className={styles.historyItemLoading} />
							</Icon.Group>
						} />
				);
			// let lastProgIdx = h.input[0].progress.length - 1;
			// let progressStatus = h.input[0].progress[lastProgIdx].content.toLowerCase();
			// if (progressStatus === 'done')
			if (h.input[0].status === 'done')
				return (
					<Icon.Group size='big' className={styles.historyItemIcon}>
						<Icon size='large' name='circle' />
						<Icon name='file audio' />
					</Icon.Group>
				);
		}

		return (<p>{h.name}</p>);
	};

	return (
		<div id={styles.viewAllJobsContainer}>

			<div id={styles.headerContainer}>
				<Header as="h2">View Previous Transcription Jobs</Header>

				<Form id={styles.search}>
					<Form.Input
						// label='Search'
						placeholder='Search here'
						onChange={onSearchChange}
						value={filters.searchStr}
					/>
				</Form>
			</div>

			{/* Filters */}
			<Grid columns={4} doubling id={styles.filterContainer}>
				<Grid.Column>
					<Dropdown
						placeholder='Filter Live/Offline'
						fluid
						selection
						value={filters.type}
						options={typeFilterOptions}
						onChange={handleTypeFilterChange}
					/>
				</Grid.Column>
				<Grid.Column>
					<Dropdown
						placeholder='Filter Language'
						fluid
						multiple
						selection
						value={filters.lang}
						options={langFilterOptions}
						key="test"
						onChange={handleLangFilterChange}
					/>
				</Grid.Column>
				<Grid.Column>
					<Dropdown
						placeholder='Filter Length'
						fluid
						selection
						value={filters.duration}
						options={lengthFilterOptions}
						onChange={handleLengthFilterChange}
					/>
				</Grid.Column>
				<Grid.Column>
					<Popup
						id={styles.dateFilterPopup}
						trigger={
							<Button basic fluid>{
								filters.startDate !== ''
									?
									moment(filters.startDate).format("DD MMM YY") + " - " + moment(filters.endDate).format("DD MMM YY")
									:
									"Filter Dates"}
							</Button>
						}
						flowing
						hideOnScroll
						on="click"
						onOpen={handlePopupOpen}
					>
						<Form noValidate>
							<Form.Field >
								<Form.Input
									fluid
									label="Start Date"
									name="startDate"
									type='date'
									defaultValue={defDateVals?.startDate}
									onChange={onDateInputChange}
									error={errors.startDate ? { content: errors.startDate.message } : false}
								/>
							</Form.Field>
							<Form.Field>
								<Form.Input
									fluid
									label="End Date"
									name="endDate"
									type='date'
									defaultValue={defDateVals?.endDate}
									onChange={onDateInputChange}
									error={errors.endDate ? { content: errors.endDate.message } : false}
								/>
							</Form.Field>
						</Form>
					</Popup>
				</Grid.Column>
			</Grid>

			{/* List of Transcription Jobs  */}
			<List divided size="large" verticalAlign="middle" className={styles.historyList}>
				{
					//Still loading
					isLoading &&
					<Container textAlign="center">
						<Loader active indeterminate inline='centered' />
						<strong>Loading ... ...</strong>
					</Container>
				}
				{
					// Display Grid List Items 
					(isLoading === false && itemsToDisplay.length > 0) &&
					// TODO Componentise this!
					itemsToDisplay.map(h => (
						<List.Item key={h._id} className={styles.historyItem}>
							{/* There are different states of the Icons */}
							{
								renderIcon(h)
							}

							{/* Description of List Item */}
							<List.Content className={styles.historyItemContent}>
								<List.Header as='p'>
									{h.title}
								</List.Header>
								<List.Description as='p'>
									{h.lang.charAt(0).toUpperCase() + h.lang.slice(1)}
									{
										h.type === 'live'
											?
											" | " + moment.utc((h as LiveTranscriptionHistory).liveSessionDuration * 1000).format("H:mm:ss")
											:
											" | " + moment.utc(h.input[0].file.duration * 1000).format("H:mm:ss")
									}
									{" | " + h.sampling}
									{" | " + h.input[0].file.mimeType + " | "}
									<span title={h.input[0].file.originalName}>
										{h.input[0].file.originalName.length > 15
											? h.input[0].file.originalName.slice(0, 5) + '...' + h.input[0].file.originalName.slice(-10)
											: h.input[0].file.originalName
										}
									</span>
								</List.Description>
							</List.Content>


							{/* Action Buttons */}
							<List.Content floated='right' className={styles.historyItemBtns}>
								<Button color="blue" onClick={(e) => handleViewBtnClick(e, h._id)}>
									View
								</Button>
								<DownloadTranscriptButton
									isDisabled={h.type === 'live' || h.input[0].status === 'error'}
									transcriptHistory={h}
								/>
								<Button color="red" disabled>Delete</Button>
							</List.Content>
						</List.Item>
					))
				}
				{
					//Not new user, show bad filter
					(!isLoading && itemsToDisplay.length === 0 && !displayWelcomeMsg) &&
					<Container text textAlign="center" id={styles.notFoundContainer}>
						<Icon name="question circle outline" size="huge" />
						<p>Your Filtering/Search yielded no results, please try again!</p>
					</Container>
				}
				{
					//New user, show welcome message					
					(!isLoading && displayWelcomeMsg) &&
					<Container text textAlign="center" id={styles.welcomeNewUserContainer}>
						<Icon name="smile outline" color="grey" size="huge" />
						<p>It seems like you are new to SG Decoding, click on the following to begin transcribing!</p>
						<div id={styles.welcomeBtnContainer}>
							<Button as={Link} to="/livetranscribe" primary id={styles.liveTransBtn}>Live Transcribe</Button>
							<Button as={Link} to="/offlinetranscribe" color="orange">Offline Transcribe</Button>
						</div>
					</Container>
				}
			</List>

			{/* Paginator */}
			<Pagination
				id={styles.listPaginator}
				//defaultActivePage={1}
				onPageChange={handlePageChange}
				ellipsisItem={{ content: <Icon name='ellipsis horizontal' />, icon: true }}
				firstItem={{ content: <Icon name='angle double left' />, icon: true }}
				lastItem={{ content: <Icon name='angle double right' />, icon: true }}
				// prevItem={{ content: <Icon name='angle left' />, icon: true }}
				// nextItem={{ content: <Icon name='angle right' />, icon: true }}
				prevItem={null}
				nextItem={null}
				totalPages={noOfPages}
				activePage={currentPage}
				siblingRange={1}
			/>
		</div>
	);
};

export default ViewAllJobs;