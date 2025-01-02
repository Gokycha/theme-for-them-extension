const DATABASE = "database_tft"; // database theme for them
const TABLE_IMAGE = "table_image"; // table image

document.addEventListener('DOMContentLoaded', () => {
  // add event
  document.getElementById('uploadButton').addEventListener('click', () => {
    const fileInput = document.getElementById('fileInput');
    fileInput.click();
  });
  document.getElementById('fileInput').addEventListener('change', (event) => {
    onFileUpload(event);
  });

  //
  showImage();
});

function showImage() {
  const listImage = document.getElementById('list-image');
  listImage.innerHTML = '';
  getAllImages().then((result) => {
    if (result?.length) {
      Promise.all(result.map((item) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve({ id: item.id, image: reader.result });
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(item.image);
      }))).then((images) => images.forEach((item) => {
        const div = document.createElement('div');
        div.classList.add("box");
        const trash = document.createElement('div');
        trash.classList.add("trash");
        trash.innerHTML = '<i class="fa-solid fa-trash"></i>';
        const img = document.createElement('img');
        const imgUrl = item.image;
        img.src = imgUrl;
        img.classList.add("img");
        div.appendChild(img);
        div.appendChild(trash);
        listImage.appendChild(div);
        trash.addEventListener('click', () => {
          deleteImage(item.id).then(() => {
            showImage();
          }).catch((error) => {
            console.error("Error deleting image", error);
          });
        });
        img.addEventListener('click', () => onImgClick(imgUrl));
      }));
    } else {
      const h1 = document.createElement('h1');
      h1.style.color = "cornsilk";
      h1.textContent = 'Chưa có ảnh nào!!!';
      listImage.appendChild(h1);
    }
  });
}

function onImgClick(imageUrl) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0) {
      const activeTabId = tabs[0].id;
      chrome.scripting.executeScript(
        {
          target: { tabId: activeTabId },
          files: ["assets/js/content.js"]
        },
        () => {
          chrome.tabs.sendMessage(activeTabId, { code: "IMAGE", data: imageUrl }, (response) => {
            // console.log("Done", response);
          });
        }
      );
    }
  });
}

function onFileUpload(event) {
  const file = event.target.files[0];
  if (file) {
    saveImage(file).then(() => {
      console.log("Saved image to database");
      showImage();
    }).catch((error) => {
      console.error("Error saving image to database", error);
    });
  }
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE, 1);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(TABLE_IMAGE)) {
        db.createObjectStore(TABLE_IMAGE, { keyPath: "id", autoIncrement: true });
      }
    };
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
}

async function saveImage(imageBlob) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(TABLE_IMAGE, "readwrite");
    const store = transaction.objectStore(TABLE_IMAGE);
    const request = store.add({ image: imageBlob, timestamp: Date.now() });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getAllImages() {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(TABLE_IMAGE, "readonly");
    const store = transaction.objectStore(TABLE_IMAGE);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function deleteImage(id) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(TABLE_IMAGE, "readwrite");
    const store = transaction.objectStore(TABLE_IMAGE);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}