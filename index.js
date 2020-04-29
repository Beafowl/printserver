const express = require('express');
const path = require('path');
const fileUpload = require('express-fileupload');
const converter = require('docx-pdf');
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 80;

app.use(fileUpload());

// index.html

app.get('/', (req, res) => {

    res.sendFile(path.join(__dirname, '/index.html'));
});

// print document

app.post('/print', (req, res) => {

    // fetch file

    let file = req.files.myfile;

    // replace space with underscore

    file.name = file.name.replace(/ /g, "_");

    // move to files folder

    file.mv("./files/" + file.name, (err) => {

        if (err) {
            console.log(err);
            res.status(400).send("Ein Fehler ist aufgetreten");
        } else {

            console.log("A file has been uploaded");

            // check for word documents and convert them to pdf

            if (file.name.search('*.docx') != -1) {

                file.name = 'converted.pdf';

                converter(`./files/${file.name}`, './files/converted.pdf', (err, result) => {

                    if (err) {
                        console.log(err);
                    }
                    console.log('Converted docx-file to pdf');
                });
            }

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
