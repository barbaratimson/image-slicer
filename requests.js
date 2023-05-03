const express = require("express");
const fs = require('fs');
const cors = require("cors")
var Clipper = require('image-clipper');
var sizeOf = require('image-size');
var Canvas = require('canvas');
const bodyParser = require("body-parser")
Clipper.configure('canvas', Canvas);
// The fileUpload npm package for handling
// file upload functionality
const fileUpload = require("express-fileupload");
const images = []
// Creating app
const app = express();
// Passing fileUpload as a middleware 
app.use(fileUpload());
app.use(cors())
app.use(bodyParser())
function download(base64, fileName) {
  console.log(base64)
  var link = document.createElement("a");

  document.body.appendChild(link); // for Firefox

  link.setAttribute("href", base64);
  link.setAttribute("download", fileName);
  link.click();
}

  function cutImageUp(image,cols,rows) {
    console.log(image)
    let numColsToCut = cols
    let numRowsToCut = rows
    let count = 0
    const dimensions = sizeOf(image)
    let pieceX = 0
    let pieceY = 0
    let imageWidth = dimensions.width
    let imageHeight = dimensions.height
    let pieceWidth = imageWidth/numColsToCut
    let pieceHeight = imageHeight/numRowsToCut
    console.log(imageHeight,imageWidth)
    for(var x = 0; x < numColsToCut; ++x) {
        for(var y = 0; y < numRowsToCut; ++y) {
        count++
        let uploadedFile = `image_${count}.png`
        let image1 = __dirname + "/output/" + uploadedFile;
        Clipper(image, function() {
          this.crop(pieceX,pieceY,pieceWidth,pieceHeight)
          // this.crop(pieceX,pieceY,pieceWidth,pieceHeight)
          .quality(100)
          .toFile(image1, function() {
            console.log(`Saved to /output/image_${count}.png`)
            console.log(images)
         });
      })
      images.push({id:`${count}`,image:`image_${count}.png`})
      console.log(pieceX,pieceY)
      pieceY = pieceY + pieceHeight
    }
    pieceY = 0
    pieceX = pieceX + pieceWidth
    }
  
        }


// For handling the upload request
app.post("/upload", function (req, res) {

  // When a file has been uploaded
  if (req.files && Object.keys(req.files).length !== 0) {
    
    // Uploaded path
    const uploadedFile = req.files.uploadFile;
  
    // Logging uploading file
    console.log(uploadedFile);
  
    // Upload path
    const uploadPath = __dirname
        + "/uploads/" + uploadedFile.name;
    // To save the file using mv() function
    console.log(`./uploads/${uploadedFile.name}`)
    uploadedFile.mv(uploadPath, function (err) {
      if (err) {
        console.log(err);
        res.send("Failed !!");
      } else {
      cutImageUp(uploadPath,3,3)};
      res.send(images)
    });
  } else res.send("No file uploaded !!");

});

  
// To handle the download file request
app.get("/download", function (req, res) {
  let image = req.query.image
  console.log(images)
  var bitmap = fs.readFileSync("./output/"+image);
  res.send("data:image/png;base64,"+Buffer(bitmap).toString("base64"))
  
  // fs.readdir("./output/", (err, files) => {
  //   files.forEach(file => {
  //     var bitmap = fs.readFileSync("./output/"+file);
  //     res.send("data:image/png;base64,"+Buffer(bitmap).toString("base64"))
  //   })
  // })
  // // The res.download() talking file path to be downloaded
  // console.log(__dirname + "/output/" + "image_1.png")
  // res.download(__dirname + "/output/" + "image_1.png", function (err) {
  //   if (err) {
  //     console.log(err);
  //   }
  // });
});
  
  
// Makes app listen to port 3000
app.listen(5050, () => console.log(`Start!`))



