import moment from 'moment';
import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { Button, Card, Header, Icon, Image, Statistic } from 'semantic-ui-react';
import { getStatistics } from '../../api/auth-api';
import { RootState } from '../../state/reducers';
import styles from './overview.page.module.scss';

const OverviewPage: React.FC = () => {

	const { name, sub, lastLogin } = useSelector((state: RootState) => state.authReducer);
	const [userStats, setUserStats] = useState(
		{
			transcriptionCount: 0,
			pendingCount: 0,
			minutesTranscribed: 0,
			monthlyLiveDurationMins: 0,
			monthlyBatchDurationMins: 0,
		}
	);

	const getUserData = useCallback(async () => {
		const statRes = await getStatistics(sub);
		const statData = statRes.data;
		console.log(statData);
		setUserStats(
			{
				transcriptionCount: statData.transcriptionCount,
				pendingCount: statData.pendingCount,
				minutesTranscribed: statData.minutesTranscribed,
				monthlyLiveDurationMins: statData.monthlyLiveDurationMins,
				monthlyBatchDurationMins: statData.monthlyBatchDurationMins,
			}
		);
	}, [sub]);

	useEffect(() => {
		getUserData();
	}, [getUserData]);


	/* For Development */
	const liveUsage = [
		{
			"name": "Total Remaining",
			"value": 60 - userStats.monthlyLiveDurationMins
		},
		{
			"name": "Used This Month",
			"value": userStats.monthlyLiveDurationMins
		}
	];

	const offlineUsage = [
		{
			"name": "Total Remaining",
			"value": 60 - userStats.monthlyBatchDurationMins
		},
		{
			"name": "Used This Month",
			"value": userStats.monthlyBatchDurationMins
		}
	];
	const COLORS_LIVE = [
		"#2DB84B", "#643CC6"
	];
	const COLORS_OFFLINE = [
		"#0CB5AC", "#F0171C"
	];
	/* END: For Development */

	const currentTime: number = Number(moment(new Date().getTime()).format("HH"));
	const lastLoginTime = moment(lastLogin).format("ddd D MMM YYYY, h:mma");

	return (<div>
		<section id={styles.welcomeSection} role="banner" aria-label="WelcomeBanner">
			<Header as="h1">
				{
					currentTime < 12
						?
						"Good Morning, "
						:
						currentTime >= 12 && currentTime < 18
							?
							"Good Afternoon, "
							:
							"Good Evening, "
				}
				<span>{name}</span>
			</Header>

			<Card fluid id={styles.welcomeCard}>
				<Card.Content id={styles.welcomeCardContent}>
					{/* <Grid columns={2} padded>
						<Grid.Column id={styles.welcomeTextWrapper}> */}
					<div id={styles.welcomeTextWrapper}>
						<Card.Header as="h3">
							Welcome Back to SG Decoding!
						</Card.Header>
						<p>You last logged in on {lastLoginTime}. Click on any of the following when you are ready to start transcribing with us.</p>
						<div id={styles.welcomeBtnContainer}>
							<Button as={Link} to="/livetranscribe" primary id={styles.liveTransBtn}>Live Transcribe</Button>
							<Button as={Link} to="/offlinetranscribe" color="orange">Offline Transcribe</Button>
						</div>
					</div>
					{/* </Grid.Column> */}

					{/* <Grid.Column> */}
					{/* <div> */}
					<Image src="/images/HeaderImg_male.svg" alt="header image male" />
					{/* </div> */}
					{/* </Grid.Column> */}
					{/* </Grid> */}
				</Card.Content>
			</Card>
		</section>

		<section id={styles.overviewSection}>
			<Header as="h2" role="heading">Overview</Header>
			<Card.Group id={styles.overviewCardGroup}>
				{/* First Card: */}
				<Card className={styles.overviewCard} style={{"width":"32%"}}>
					<Card.Content className={styles.overviewCardContent}>
						<Icon.Group size='huge' className={styles.purpIcon}>
							<Icon size='big' name='circle' />
							<Icon name='clipboard check' />
						</Icon.Group>
						<Statistic size="tiny">
							<Statistic.Value>{userStats.transcriptionCount}</Statistic.Value>
							<Statistic.Label>Jobs in Total</Statistic.Label>
						</Statistic>
					</Card.Content>
				</Card>
				{/* Second Card:  */}
				<Card className={styles.overviewCard} style={{"width":"32%"}}>
					<Card.Content className={styles.overviewCardContent}>
						<Icon.Group size='huge' className={styles.blueIcon}>
							<Icon size='big' name='circle' />
							<Icon name='hourglass half' />
						</Icon.Group>
						<Statistic size="tiny">
							<Statistic.Value>{userStats.pendingCount}</Statistic.Value>
							<Statistic.Label>Pending Jobs</Statistic.Label>
						</Statistic>
					</Card.Content>
				</Card>
				{/* Third Card:  */}
				<Card className={styles.overviewCard} style={{"width":"32%"}}>
					<Card.Content className={styles.overviewCardContent}>
						<Icon.Group size='huge' className={styles.redIcon}>
							<Icon size='big' name='circle' />
							<Icon name='clock' />
						</Icon.Group>
						<Statistic size="tiny">
							<Statistic.Value>{userStats.minutesTranscribed} mins</Statistic.Value>
							<Statistic.Label>Transcribed</Statistic.Label>
						</Statistic>
					</Card.Content>
				</Card>
			</Card.Group>
		</section>


		<section id={styles.monthlyUsageStats}>
			<Header as="h2">Usage Statistics for {moment(new Date()).format("MMM")} {moment(new Date()).format("YYYY")}</Header>
			<Card.Group itemsPerRow={2} stackable>
				<Card>
					<Card.Content>
						<Card.Header>
							Live Transcribe (in Minutes)
						</Card.Header>
					</Card.Content>
					<Card.Content>
						<ResponsiveContainer width="100%" height={300}>
							<PieChart>
								<Pie data={liveUsage} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#fffaaa" label>
									{
										liveUsage.map((entry, index) => <Cell key={index} fill={COLORS_OFFLINE[index % COLORS_OFFLINE.length]} />)
									}
								</Pie>
								<Legend verticalAlign="top" height={36} />
							</PieChart>
						</ResponsiveContainer>
					</Card.Content>
				</Card>
				{/* Offline Transcribe Card */}
				<Card>
					<Card.Content>
						<Card.Header>
							Offline Transcribe (in Minutes)
						</Card.Header>
					</Card.Content>
					<Card.Content>
						<ResponsiveContainer width="100%" height={300}>
							<PieChart>
								<Pie data={offlineUsage} dataKey="value" nameKey="name" cx="50%" cy="56%" innerRadius={60} outerRadius={80} fill="#8884d8" label>
									{
										offlineUsage.map((entry, index) => <Cell key={index} fill={COLORS_LIVE[index % COLORS_LIVE.length]} />)
									}
								</Pie>
								<Legend verticalAlign="top" height={36} />
							</PieChart>
						</ResponsiveContainer>
					</Card.Content>
				</Card>
			</Card.Group>
		</section>

		{/* <span>Logged In Successfully</span>
		<button onClick={logout}>Logout</button> */}
	</div>);
};

export default OverviewPage;