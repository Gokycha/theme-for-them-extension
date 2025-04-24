function insertImage() {
  let imageUrl = localStorage.getItem("image");
  if(!imageUrl) {
    imageUrl = chrome.runtime.getURL('assets/imgs/wallpaper.png');
  }
  // theme1(imageUrl);
  theme2(imageUrl);
  console.log("Inserted image into body");
}

insertImage();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.code === "IMAGE") {
    // console.log("Received message from popup:", message.data);
    localStorage.setItem("image", message.data);
    insertImage();
    sendResponse({ status: "Message received!" });
  }
  return true;
});

function theme1(imageUrl) {
  document.body.style.backgroundImage = `url(${imageUrl})`;
  document.body.style.backgroundSize = "cover";
  document.body.style.backgroundRepeat = "no-repeat";
  document.body.style.backgroundPosition = "center center";
  document.body.style.backgroundAttachment = "fixed";
  document.body.style.backgroundColor = "black";
  document.body.style.color = "white";
  document.body.style.fontFamily = "Arial, sans-serif";
  // document.body.style.backgroundBlendMode = "hard-light";
}

function theme2(imageUrl) {
  const background = document.createElement("img");
  background.src = imageUrl;
  background.style.position = "fixed";
  background.style.top = "0";
  background.style.left = "0";
  background.style.width = "100%";
  background.style.height = "100%";
  background.style.zIndex = "-1";
  background.style.objectFit = "cover";
  background.style.objectPosition = "center";
  background.style.opacity = "0.5";
  document.body.style.backgroundColor = "rgba(0, 0, 0, 0)";
  document.body.appendChild(background);
}