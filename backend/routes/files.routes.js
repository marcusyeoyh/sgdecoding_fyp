const router = require('express').Router();
const axios = require("axios").default;

router.get('/:id/download', async(req, res) => {
  const { id } = req.params;
  await axios
    .get(
      `${process.env.GATEWAY_URL}/files/${id}/download`,
      {
        headers: {
          Authorization: `${req.headers.authorization}`,
        },
      },
      { responseType: "json" }
    )
    .then((response) => {
      res.status(200).json(response.data);
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ msg: "Something went wrong with your request!" });
    });
});

module.exports = router;