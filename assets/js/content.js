function insertImage() {
  let imageUrl = localStorage.getItem("image");
  if(!imageUrl) {
    imageUrl = chrome.runtime.getURL('assets/imgs/wallpaper.png');
  }
  document.body.style.backgroundImage = `url(${imageUrl})`;
  document.body.style.backgroundSize = "cover";
  document.body.style.backgroundRepeat = "no-repeat";
  document.body.style.backgroundPosition = "center center";
  document.body.style.backgroundAttachment = "fixed";
  document.body.style.backgroundColor = "black";
  document.body.style.color = "white";
  document.body.style.fontFamily = "Arial, sans-serif";
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