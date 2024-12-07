let fileInputClass1 = document.getElementById("fileInputClass1");
let fileInputClass2 = document.getElementById("fileInputClass2");
let fileInputPredict = document.getElementById("fileInputPredict");
let imageContainerClass1 = document.getElementById("imageContainerClass1");
let imageContainerClass2 = document.getElementById("imageContainerClass2");
let imageContainerPredict = document.getElementById("imageContainerPredict");
let addButtonClass1 = document.getElementById("addButtonClass1");
let addButtonClass2 = document.getElementById("addButtonClass2");
let trainButton = document.getElementById("trainButton");
let predictButton = document.getElementById("predictButton");
let message = document.getElementById("message");
let labelInputClass1 = document.getElementById("labelInputClass1");
let labelInputClass2 = document.getElementById("labelInputClass2");
let logContainer = document.getElementById("logContainer");

let featureExtractor;
let classifier;
let uploadedImagesClass1 = [];
let uploadedImagesClass2 = [];
let uploadedImagesPredict = [];
let lossData = []; // For storing loss values to plot

// Chart.js setup for loss chart
let ctx = document.getElementById('lossChart').getContext('2d');
let lossChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      label: 'Loss over time',
      borderColor: 'rgb(75, 192, 192)',
      fill: false,
      data: []
    }]
  },
  options: {
    responsive: true,
    scales: {
      x: {
        type: 'linear',
        position: 'bottom'
      }
    }
  }
});

// Load images for Class 1
function loadImgFilesClass1(event) {
  imageContainerClass1.innerHTML = "";
  uploadedImagesClass1 = [];
  const files = event.target.files;

  if (files.length === 0) {
    message.innerHTML = "No files selected for Class 1.";
    addButtonClass1.disabled = true;
    return;
  }

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    img.onload = () => URL.revokeObjectURL(img.src);
    imageContainerClass1.appendChild(img);
    uploadedImagesClass1.push(img);
  }

  addButtonClass1.disabled = false;
  checkIfCanTrain();
}

// Load images for Class 2
function loadImgFilesClass2(event) {
  imageContainerClass2.innerHTML = "";
  uploadedImagesClass2 = [];
  const files = event.target.files;

  if (files.length === 0) {
    message.innerHTML = "No files selected for Class 2.";
    addButtonClass2.disabled = true;
    return;
  }

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    img.onload = () => URL.revokeObjectURL(img.src);
    imageContainerClass2.appendChild(img);
    uploadedImagesClass2.push(img);
  }

  addButtonClass2.disabled = false;
  checkIfCanTrain();
}

// Load images for Prediction
function loadImgFilesPredict(event) {
  imageContainerPredict.innerHTML = "";
  uploadedImagesPredict = [];
  const files = event.target.files;

  if (files.length === 0) {
    message.innerHTML = "No files selected for Prediction.";
    return;
  }

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    img.onload = () => URL.revokeObjectURL(img.src);
    imageContainerPredict.appendChild(img);
    uploadedImagesPredict.push(img);
  }
}

// Setup model and classifier
function setupModel() {
  featureExtractor = ml5.featureExtractor("MobileNet", modelLoaded);
  classifier = featureExtractor.classification();
}

// Model loaded, enable buttons
function modelLoaded() {
  message.innerHTML = "Model loaded. You can now add images and train.";
  addButtonClass1.addEventListener("click", addImagesClass1);
  addButtonClass2.addEventListener("click", addImagesClass2);
  trainButton.addEventListener("click", trainModel);
  predictButton.addEventListener("click", predict);
  checkIfCanTrain();
}

// Add images for Class 1
function addImagesClass1() {
  const label = labelInputClass1.value;
  if (label.trim() === "") {
    alert("Please enter a label for Class 1");
    return;
  }
  uploadedImagesClass1.forEach((img) => {
    classifier.addImage(img, label);
  });
  message.innerHTML = `Added ${uploadedImagesClass1.length} image(s) with label: ${label}`;
  checkIfCanTrain();
}

// Add images for Class 2
function addImagesClass2() {
  const label = labelInputClass2.value;
  if (label.trim() === "") {
    alert("Please enter a label for Class 2");
    return;
  }
  uploadedImagesClass2.forEach((img) => {
    classifier.addImage(img, label);
  });
  message.innerHTML = `Added ${uploadedImagesClass2.length} image(s) with label: ${label}`;
  checkIfCanTrain();
}

// Check if both classes have images to train
function checkIfCanTrain() {
  if (uploadedImagesClass1.length > 0 && uploadedImagesClass2.length > 0 && classifier) {
    trainButton.disabled = false;
  } else {
    trainButton.disabled = true;
  }
}

// Train model and plot loss
function trainModel() {
  message.innerHTML = "Training model...";
  classifier.train((lossValue) => {
    if (lossValue) {
      lossData.push(lossValue);
      lossChart.data.labels.push(lossData.length);
      lossChart.data.datasets[0].data = lossData;
      lossChart.update();
      message.innerHTML = `Training... Loss: ${lossValue}`;
    } else {
      message.innerHTML = "Training complete!";
      predictButton.disabled = false;
    }
  });
}

// Predict new image
function predict() {
  message.innerHTML = "Predicting...";

  uploadedImagesPredict.forEach((img) => {
    classifier.classify(img, (err, results) => {
      if (err) {
        console.error(err);
        message.innerHTML = "Error during prediction.";
        return;
      }
      
      // Display the results
      if (results && results.length > 0) {
        const result = results[0];
        const predictionResult = `Prediction: ${result.label} with confidence: ${result.confidence.toFixed(3)}`;
        message.innerHTML = predictionResult;
        logContainer.innerHTML += `<p>${predictionResult}</p>`;
      }
    });
  });
}

// Event listeners for file inputs
fileInputClass1.addEventListener("change", loadImgFilesClass1);
fileInputClass2.addEventListener("change", loadImgFilesClass2);
fileInputPredict.addEventListener("change", loadImgFilesPredict);

setupModel();
