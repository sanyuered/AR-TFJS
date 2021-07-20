import * as face from '../utils/faceBusiness.js';
import * as model from '../utils/modelBusiness.js';
const canvasWebGLId = 'canvasWebGL';
// a url of a gltf model 
const modelUrl = '../../assets/sunglass.glb';
const canvasWidth= 375;
const canvasHeight= 450;

var app = new Vue({
  el: '#app',
  data: {
    isShowLoadingToast: false,
    isButtonDisabled: false,
    notice:'',
  },
  methods: {
    async processPhoto(frame) {
      // process
      var result = await face.detect(frame);

      if (result && result.prediction) {
        // set the rotation and position of the 3d model.    
        model.setModel(result.prediction,
          canvasWidth,
          canvasHeight);
        this.notice="detect: "+ result.end+ 'ms.';
      } else {
        var message = 'No results.';
        this.notice=message;
        console.log('detect:', message);
      }
    },
    async takePhoto() {
      if (this.isButtonDisabled) {
        return
      }

      const inputData = document.querySelector('#inputData');
      await this.processPhoto(inputData);
    },
    async load() {
      this.isButtonDisabled = true;

      // load tfjs model
      this.isShowLoadingToast = true;
      await face.loadModel();
      this.isShowLoadingToast = false;

      // load 3d model
      model.initThree(canvasWebGLId,
        modelUrl,
        canvasWidth,
        canvasHeight);

      this.isButtonDisabled = false;
    },
  },
  mounted: function () {
    this.load();
  },
});

document.getElementById("uploaderInput").addEventListener("change", function (e) {
  var files = e.target.files;
  if(files.length == 0){
    return
  }
  var url = window.URL || window.webkitURL;
  var src;
  if (url) {
    src = url.createObjectURL(files[0]);
  } 
  document.getElementById("inputData").setAttribute("src", src);
});

