import { Component, OnInit } from '@angular/core';

//import COCO-SSD model as cocoSSD
import * as cocoSSD from '@tensorflow-models/coco-ssd';
//import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-cpu';
import axios from 'axios';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'angular-quickstart';
  image!: HTMLImageElement;
  model!: cocoSSD.ObjectDetection;
  definitions: any[] = [];

  async ngOnInit()
  {
    console.log("Loading model");
    this.model = await cocoSSD.load({base: 'lite_mobilenet_v2'});
    console.log('Model loaded');
  }

  onFileChanged(event: any) {
    let file = event.target.files[0];
    console.log("File uploaded!");

    var reader = new FileReader();
    var imgtag: HTMLImageElement = new Image();
    if (imgtag){
      imgtag.title = file.name;
      reader.onload = function(event) {
        if(imgtag && reader.result){
          imgtag.src = <string> reader.result;
        }
      };
      reader.readAsDataURL(file);
    }
    this.image = imgtag;
    this.definitions = [];
    console.log("File converted to image!")
  }

  predict = () => {
    console.log("Finding things in the image...");
    this.model.detect(this.image).then((predictions: any) => {
      console.log("Done, drawing predictions...");
      console.log(predictions);
      this.drawPredictions(predictions);
      this.processPredictions(predictions);
    });
  }

  processPredictions = (predictions: any[]) => {
    let seen: string[] = [];
    predictions.forEach((prediction: {class: string}) => {
      if(!seen.includes(prediction.class)){
        seen.push(prediction.class);
        axios
        .get(`/.netlify/functions/getWordDefinition?word=${prediction.class}`)
        .then((response)=>{
          console.log(response.data);
          this.definitions.push({word: prediction.class, meaning: response.data});
        });
      }
    });
  }

  drawPredictions = (predictions: any[]) => {
    const canvas = <HTMLCanvasElement> document.getElementById("canvas");
    
    const ctx = canvas.getContext("2d");
    
    canvas.width  = this.image.width;
    canvas.height = this.image.height;

    if (ctx) {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      // Font options.
      const font = "16px sans-serif";
      ctx.font = font;
      ctx.textBaseline = "top";
      ctx.drawImage(this.image, 0, 0, this.image.width, this.image.height);

      predictions.forEach((prediction: { bbox: any[]; class: string; }) => {
        const x = prediction.bbox[0];
        const y = prediction.bbox[1];
        const width = prediction.bbox[2];
        const height = prediction.bbox[3];
        // Draw the bounding box.
        ctx.strokeStyle = "#00FFFF";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
        // Draw the label background.
        ctx.fillStyle = "#00FFFF";
        const textWidth = ctx.measureText(prediction.class).width;
        const textHeight = parseInt(font, 10);
        ctx.fillRect(x, y, textWidth + 4, textHeight + 4);
      });

      predictions.forEach((prediction: { bbox: any[]; class: string; }) => {
        const x = prediction.bbox[0];
        const y = prediction.bbox[1];
        ctx.fillStyle = "#000000";
        ctx.fillText(prediction.class, x, y);
      });
    };
  }

}
