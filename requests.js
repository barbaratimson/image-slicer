const express = require("express");
const fs = require('fs');
const cors = require("cors")
var Clipper = require('image-clipper');
var sizeOf = require('image-size');
var Canvas = require('canvas');
Clipper.configure('canvas', Canvas);
// The fileUpload npm package for handling
// file upload functionality
const fileUpload = require("express-fileupload");
const { clear } = require("console");
const images = []
// Creating app
const app = express();
// Passing fileUpload as a middleware 
app.use(fileUpload());
app.use(cors())

const clearDir = () => {
fs.readdir("./output/", (err,files) => {
  if (err){
    console.log(err)
  }else {
  if (files){
  files.forEach(file1 => {
    fs.rm("./output/"+file1,(err) => {
      if (err){
        console.log(err)
      }
      console.log(`File ${"./output/"+file1} removed`)
    })
  })
}
}
});
}
  function cutImageUp(image,cols,rows) {
    console.log(image)
    let numColsToCut = cols
    let numRowsToCut = rows
    let count1 = 0
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
        let uploadedFile = `image_${count1}.png`
        let image1 = __dirname + "/output/" + uploadedFile;
        Clipper(image, function() {
          this.crop(pieceX,pieceY,pieceWidth,pieceHeight)
          .resize(200,200)
          // this.crop(pieceX,pieceY,pieceWidth,pieceHeight)
          .quality(100)
          .toFile(image1, function() {
            console.log(`Saved to /output/` + uploadedFile)
         });
         count1++
      })
      images.push({id:`${count1}`,image:uploadedFile})
      console.log(pieceX,pieceY)
      pieceY = pieceY + pieceHeight
    }
    pieceY = 0
    pieceX = pieceX + pieceWidth
    }
  
        }


// For handling the upload request
// app.post("/upload", function (req, res) {
//   let file = req.query.file
//   clearDir()
//   setTimeout(()=>{
//   cutImageUp(__dirname + "/uploads/" + file,3,3)
//   res.send(images)
// },1000)
// });

  
// To handle the download file request
app.get("/download", function (req, res) {
  let resImages = []
  let count = 0
  fs.readdir("./output/", (err, files) => {
    files.forEach(file => {
      var bitmap = fs.readFileSync("./output/"+file);
      resImages.push({id:`${count}`,url:bitmap.toString("base64")})
      count++
    })
    console.log(resImages)
    res.send(resImages)
  })
});
  
app.get("/", function (req, res) {
  let files = []
  let count = 0
  fs.readdir("./uploads/", (err, file) => {
    file.forEach(file => {
      files.push({id:count,file:file})
      count++
    })
 res.send(files)
});
})

app.get("/getImage", function (req, res) {
  let image = req.query.image
  let cols = req.query.cols
  let rows = req.query.rows
    clearDir()
  setTimeout(()=>{
    let resImages = []
    let count = 0
    const inputDir = __dirname + "/uploads/"
    const outputDir = __dirname + "/output/"
    console.log(image)
    cutImageUp(inputDir + image,cols,rows)
    setTimeout(()=>{
      fs.readdir(outputDir, (err, files) => {
        files.forEach(file => {
          console.log(count)
          var bitmap = fs.readFileSync(outputDir+file);
          resImages.push({id:`${count}`,url:bitmap.toString("base64")})
          count++
        })
        console.log(resImages)
      res.send(resImages)
    },100)
     
  })
    },200)
});

app.listen(5050, () => console.log(`Start!`))



