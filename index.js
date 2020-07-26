const express = require("express");
const path = require("path");
const fileUpload = require("express-fileupload");
const { secret } = require("./config");
const convertapi = require("convertapi")(secret);
const fs = require("fs");
const { exec } = require("child_process");

const app = express();
const PORT = process.env.PORT || 80;

app.use(fileUpload());

// index.html

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/index.html"));
});

// print document

app.post("/print", (req, res) => {
  // check if files folder exists

  const dirToCreate = path.join(__dirname, "files");

  if (!fs.existsSync(dirToCreate)) {
    fs.mkdirSync(dirToCreate);
  }

  // fetch file

	console.log(req.files);
	if (req.files == null) {

		console.log("Ein Fehler ist aufgetreten.");

	}

  let file = req.files.myfile;

  // replace space with underscore

  file.name = file.name.replace(/ /g, "_");

  // move to files folder

  file.mv("./files/" + file.name, (err) => {
    if (err) {
      console.log(err);
      res.status(400).send("Ein Fehler ist aufgetreten");
    } else {

      convertapi
        .convert("pdf", { File: path.join(__dirname, "files", file.name) })
        .then((result) => {
          return result.file.save(path.join(__dirname, "files/output.pdf"));
        })
        .then((file) => {
          // print the file

          exec(`lp ${file}`, (err, stdout, stderr) => {
            if (err) {
              console.log(`error: ${err.message}`);
              return;
            }
            if (stderr) {
              console.log(`stderr: ${stderr}`);
              return;
            }
            console.log(`stdout: ${stdout}`);
          });

          res.status(200).send("Wird gedruckt...");
        })
        .catch((e) => {
          console.error(e.toString());
          res.status(400).send("Ein Fehler ist aufgetreten");
        });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
