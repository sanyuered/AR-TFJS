import * as face from '../utils/faceBusiness.js';
import * as model from '../utils/modelBusiness.js';
const canvasWebGL = 'canvasWebGL';
// a url of a gltf model 
const modelUrl = '../../assets/sunglass.glb';
// it should be more than detect time
const frameSpeed = 40;
const canvasWidth = 375;
const canvasHeight = 375;

var app = new Vue({
    el: '#app',
    data: {
        isShowLoadingToast: false,
        isButtonDisabled: false,
        notice: '',
    },
    methods: {
        async processVideo(frame) {
            // process canvas
            var result = await face.detect(frame);

            if (result && result.prediction) {
                // set the rotation and position of the 3d model.    
                model.setModel(result.prediction,
                    canvasWidth,
                    canvasHeight
                );
                this.notice = "detect: " + result.end + 'ms.';
            } else {
                var message = 'No results.';
                this.notice = message;
                console.log('detect:', message);
            }
        },
        async takePhoto() {
            if (!navigator.mediaDevices) {
                var msg = 'not support of navigator.mediaDevices';
                this.notice = msg;
                console.log('takePhoto', msg);
                return
            }

            if (this.isButtonDisabled) {
                return
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: canvasWidth,
                    height: canvasHeight,
                }
            });
            var inputData = document.getElementById("inputData");
            inputData.srcObject = stream;
            await this.onVideoPlay();

        },
        async onVideoPlay() {
            var inputData = document.getElementById("inputData");
            // check the state of the video player
            if (!inputData.paused && !inputData.ended) {
                await this.processVideo(inputData);
            }

            setTimeout(this.onVideoPlay, frameSpeed);
        },
        async load() {
            this.isButtonDisabled = true;

            // load tfjs model
            this.isShowLoadingToast = true;
            await face.loadModel();
            this.isShowLoadingToast = false;

            // load 3d model
            model.initThree(canvasWebGL,
                modelUrl,
                canvasWidth,
                canvasHeight
            );

            this.isButtonDisabled = false;
        },
    },
    mounted: function () {
        this.load();
    },
});
