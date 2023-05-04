const express = require("express");
const fs = require('fs');
const cors = require("cors")
var Clipper = require('image-clipper');
var sizeOf = require('image-size');
var Canvas = require('canvas');
Clipper.configure('canvas', Canvas);
const fileUpload = require("express-fileupload");
const images = []
const app = express();
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
  console.log("sdsds")
  let image = req.query.image
  let cols = req.query.cols
  let rows = req.query.rows
  let count = 0
  clearDir()
  setTimeout(() => {
    const inputDir = __dirname + "/uploads/"
    const outputDir = __dirname + "/output/"
    console.log(image)
    cutImageUp(inputDir + image, cols, rows)
    setTimeout(() => {
      fs.readdir(outputDir, async (err, files) => {
        let resImages = [];
        for (const file of files) {
          const bitmap = await fs.promises.readFile(outputDir + file);
          resImages.push({id:`${count}`,url: bitmap.toString("base64") });
          console.log(`Read ${file}`);
          count++
        }
        res.send(resImages);
        console.log(`${count} files sent`)
        console.log(req.method, req.path,image, cols, rows)
      });
    }, 100);
  }, 200);
});

app.listen(5050, () => console.log(`Start!`))



