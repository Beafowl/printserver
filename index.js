const express = require('express');
const path = require('path');
const fileUpload = require('express-fileupload');
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(fileUpload());

// index.html

app.get('/', (req, res) => {

    res.sendFile(path.join(__dirname, '/index.html'));
});

// print document

app.post('/print', (req, res) => {

    // fetch file

    let file = req.files.myfile;

    // move to files folder

    file.mv("./files/" + file.name, (err) => {

        if (err) {
            console.log(err);
            res.status(400).send("Ein Fehler ist aufgetreten");
        } else {

            console.log("A file has been uploaded");

            // print the file

            exec(`lp ${path.join(__dirname, "files", file.name)}`, (err, stdout, stderr) => {

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
        }
    });

});

app.listen(PORT, () => { console.log(`Server started on port ${PORT}`)});