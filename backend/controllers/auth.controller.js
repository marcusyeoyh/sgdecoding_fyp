const axios = require("axios");
const User = require("../models/user.model");
const jwt_decode = require("jwt-decode");
const jwt = require('jsonwebtoken');

axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*';

async function getLoginAndUpdate(userEmail) {
	try {
		const filter = { email: userEmail };
		const update = { last_login: new Date() };
		const user = await User.findOneAndUpdate(filter, update);
		console.log("last login updated");
		return user.last_login; // previous value before update
	}
	catch (err) {
		console.log("last login update failed");
		return err;
	}
}

async function register(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");

	let newUser = req.body;
	await axios
		.post(
			`${process.env.GATEWAY_URL}/auth/register`,
			{ name: newUser.name, email: newUser.email, password: newUser.password, appId : process.env.APP_ID, appSecret : process.env.APP_SECRET },
			{ responseType: "json" }
		)
		.then(async function (gatewayResponse) {
			// console.log("register success");
			// console.log(gatewayResponse);
			// console.log(gatewayResponse.status);
			await User.create({
				_id: gatewayResponse.data.user._id,
				email: gatewayResponse.data.user.email,
				name: gatewayResponse.data.user.name,
				role: gatewayResponse.data.user.role,
				last_login: gatewayResponse.data.user.createdAt,
				created_at: gatewayResponse.data.user.createdAt
			});
			res.status(gatewayResponse.status).json(gatewayResponse.data);
		})
		.catch(function (error) {
			console.log("register failed");
			console.log({ error });
			let errorCode = error.response.data.statusCode || 500;
			let message = error.response.data || "unknown error, please check";
			res.status(errorCode).json(message);
		});
	//res.json(apiResponse.data)
}


async function login(req, res, next) {
	let userCreds = req.body;
	await axios
		.post(
			`${process.env.GATEWAY_URL}/auth/login`,
			{ email: userCreds.email, password: userCreds.password, appId : process.env.APP_ID, appSecret : process.env.APP_SECRET },
			{ responseType: "json" }
		)
		.then(async (response) => {
			console.log("Login Success");
			const token = jwt_decode(response.data.accessToken);
			const foundUser = await User.findById(token.sub);
			if (!foundUser) {
				console.log("Cannot find this user in intermediary db, creating one...");
				await User.create({
					_id: token.sub,
					email: userCreds.email,
					name : token.name,
					type : token.type, //TODO : remove this 
					role: token.role,
					last_login: new Date(), // Not exist in backend yet
					created_at: new Date()
				});
			}

			const userLastLogin = await getLoginAndUpdate(userCreds.email);

			res.status(response.status).json(
				{
					accessToken: response.data.accessToken,
					lastLogin: userLastLogin
				});
		})
		.catch((error) => {
			console.log("Login Failed",error);
			const statusCode = error.response.status || 500;
			const message = error.response.data || { message: "Something went terribly wrong!"};
			res.status(statusCode).json(message);
		});
}


async function changePassword(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	let newPasswordRequest = req.body;

	console.log("Changing Password")
	console.log(req.body);

	await axios
		.post(
			`${process.env.GATEWAY_URL}/auth/change-password`,
			newPasswordRequest,
			{ responseType: "json" }
		)
		.then((response) => {
			console.log("change pw success");
			console.log(response.status);
			res.status(response.status).json(response.data);
		})
		.catch((error) => {
			console.log("change pw failed");
			console.log(error.response.status);
			console.log(error);
			console.log(error.response.data.message);
			res.status(error.response.status).json(error.response.data);
		});
}


async function forgotPassword(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");

	let email = req.body;
	await axios
		.post(`${process.env.GATEWAY_URL}/auth/forgot-password`, email, {
			responseType: "json",
		})
		.then((response) => {
			console.log("forgot pw success");
			console.log(response.status);
			res.status(response.status).json(response.data);
		})
		.catch((error) => {
			console.log("forget pw failed");
			console.log(error.response.status);
			res.status(error.response.status).json(error.response.data);
		});
}


async function resetPassword(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");

	let newPasswordRequest = req.body;
	await axios
		.post(
			`${process.env.GATEWAY_URL}/auth/reset-password`,
			newPasswordRequest,
			{ responseType: "json" }
		)
		.then((response) => {
			console.log("reset pw success");
			console.log(response.status);
			res.status(response.status).json(response.data);
		})
		.catch((error) => {
			console.log("reset pw failed");
			console.log(error.response.status);
			res.status(error.response.status).json(error.response.data);
		});
}



module.exports = {
	login,
	register,
	forgotPassword,
	changePassword,
	resetPassword
}
