const axios = require("axios");
const FormData = require("form-data");
const { ParseSRT_JSON, setUpdatedFalse } = require("../helpers");
const yauzl = require("yauzl");
const fs = require("fs");
const jwt = require('jsonwebtoken');

async function uploadFile(req, res, next) {

	const form = new FormData();
	const fileDateStr = new Date().toISOString().slice(0, 10) + ".wav";
	form.append("file", req.file.buffer, fileDateStr);
	form.append("lang", req.body.lang);
	form.append("audioType", req.body.audioType);
	form.append("audioTrack", req.body.audioTrack);
	form.append("queue", "normal"); //normal, meadow9
  form.append("webhook", req.body.webhook); //normal, meadow9
  
	console.log(req.headers.authorization);
	await axios
		.post(
			`${process.env.GATEWAY_URL}/speech`,
			form,
			{
				headers: {
					...form.getHeaders(),
					Authorization: `${req.headers.authorization}`,
					"Content-Type": "multipart/form-data",
          "Access-Control-Allow-Origin": "*",
				},
				onUploadProgress: progressEvent => {
          console.log("upload progress");
          console.log(Math.round((progressEvent.loaded * 100) / progressEvent.total));

        }
        
			},
			{ responseType: "json" }
		)
		.then((response) => {
			console.log("submit job success");
			setUpdatedFalse(req.body.userID);
			res.json(response.status);
		})
		.catch((error) => {
      res.json(
        {
          status: error.response.status,
          statusText: error.response.statusText,
        });
		});
}

async function getsTranscriptionJobHistory(req, res, next) {
	await axios
		.get(
			`${process.env.GATEWAY_URL}/speech/history`,
			{ responseType: "json" }
		)
		.then((response) => {
			res.status(response.status).json(response.data);
		})
		.catch((error) => {
			console.log(error.response);
			resStatus = error.response.status || 500;
			resPayload = error.response.data || { message: "Something went terribly wrong!" }
			res.status(resStatus).json(resPayload);
		});
}


async function getTranscriptionResult(req, res, next) {
	//get transcription
  console.log("[DEBUG] received id: " + req.params.id);

	await axios
		.get(
			`${process.env.GATEWAY_URL}/speech/${req.params.id}/result`,
			{
				headers: {
					Authorization: `${req.headers.authorization}`,
          "Access-Control-Allow-Origin": "*",
				},
			},
			{ responseType: "json" }
		)
		.then((response) => {
			res.status(response.status).json(response.data)
		})
		.catch((error) => {
			console.log(error);
			res.status(error.response.status).json(error.response.data)
		});
}


async function getTranscriptionInJson(req, res, next) {

  console.log("[DEBUG] received id: " + req.params.id);
  // Download to temporary folder
  const reqFileStr =
    "_temp/" +
    new Date().toString().replace(":", "_").slice(0, -3);
  var fileWriter = fs.createWriteStream(`${reqFileStr}.zip`);


  await axios
    .get(`${process.env.GATEWAY_URL}/speech/${req.params.id}/result`, {
      headers: { 
        Authorization: `${req.headers.authorization}`,
        "Access-Control-Allow-Origin": "*", 
      },
      responseType: "json",
    })
    .then((getUrlRes) => {
      return axios.get(getUrlRes.data.url, {
        responseType: "stream",
      });
    })
    .then((dlZippedFileRes) => {
      console.log("[DEBUG] Success sending download url, is it downloaded?")
      console.log(dlZippedFileRes);
      dlZippedFileRes.data.pipe(fileWriter);

      // handle error
      fileWriter.on("error", (err) => {
        fileWriter.close();
        res.status(500).json(err);
      });

      var unzippedFileWriter;
      fileWriter.on("close", async () => {
        console.log("[DEBUG] Successfully write file to local temp folder");
        yauzl.open(
          `${reqFileStr}.zip`,
          { lazyEntries: true },
          (err, zipfile) => {
            if (err) throw err;

            zipfile.readEntry();
            let srtFileName = "";
            zipfile.on("entry", (entry) => {
              console.log(`[DEBUG] reading file: ${entry.fileName} `);

              if (entry.fileName.slice(-4) === ".srt") {
                srtFileName = entry.fileName.slice(0, -4);
              }

              if (/\/$/.test(entry.fileName)) {
                // console.log("[DEBUG] if (/\/$/.test(entry.fileName))");
                // Directory file names end with '/'.
                // Note that entires for directories themselves are optional.
                // An entry's fileName implicitly requires its parent directories to exist.
                zipfile.readEntry();
                // } else if (entry.fileName.slice(-4) === '.srt') {
              } else {
                // console.log("[DEBUG] opening read stream!");
                zipfile.openReadStream(entry, (err, readStream) => {
                  if (err) throw err;

                  readStream.on("end", () => {
                    // console.log("[DEBUG] readStream.on(end)");
                    zipfile.readEntry();
                  });

                  readStream.on("error", (err) => {
                    console.log("[DEBUG] Error in readStream");
                    console.log(err);
                  });

                  // TODO refactor reqFileStr and rename to something more meaningful
                  // Make folder and write currently unzipped file to folder
                  console.log(
                    "[DEBUG] Writing " +
                      entry.fileName +
                      " to " +
                      reqFileStr +
                      "/"
                  );
                  if (!fs.existsSync(reqFileStr)) fs.mkdirSync(reqFileStr);
                  unzippedFileWriter = fs.createWriteStream(
                    `${reqFileStr}/${entry.fileName}`
                  );
                  // console.log("[DEBUG] readStream.pipe(fileWriter2)");
                  readStream.pipe(unzippedFileWriter);
                });
              }
            });

            zipfile.on("close", (d) => {
              console.log("[DEBUG] Closing Zip File");
              let testStr = fs
                .readFileSync(`${reqFileStr}/${srtFileName}.srt`)
                .toString();

              let testRes = ParseSRT_JSON.parse(testStr);
              testRes = testRes.filter(
                (value, index, array) =>
                  array.findIndex(
                    (t) =>
                      t.startTime === value.startTime && t.text === value.text
                  ) === index
              );

              fs.rmSync(`${reqFileStr}/`, { recursive: true, force: true });
              fs.rmSync(`${reqFileStr}.zip`, { recursive: true, force: true });

              console.log("[DEBUG] Sending Response OK");
              res.status(200).json({ transcribedText: testRes });
            });
          }
        ); 
      }); 
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ msg: "Something went wrong. See Logsc" });
    });
}

module.exports = {
	uploadFile,
	getsTranscriptionJobHistory,
	getTranscriptionInJson,
	getTranscriptionResult
}