// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCvZqDkc9ry9WwkT0rvK30-ZvWv_-7vmig",
  authDomain: "dwarcrafts-firebase.firebaseapp.com",
  projectId: "dwarcrafts-firebase",
  storageBucket: "dwarcrafts-firebase.appspot.com",
  messagingSenderId: "91776713343",
  appId: "1:91776713343:web:63fab986c65c7a7800f54a"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Login Handling
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("adminEmail").value;
  const password = document.getElementById("adminPassword").value;

  try {
    await auth.signInWithEmailAndPassword(email, password);
    document.getElementById("authSection").style.display = "none";
    document.getElementById("adminPanel").style.display = "block";
    loadOrders();
    loadGallery();
  } catch (error) {
    alert("Login Failed: " + error.message);
  }
});

// Load Orders
function loadOrders() {
  const ordersContainer = document.getElementById("ordersContainer");
  ordersContainer.innerHTML = "Loading...";

  db.collection("orders").orderBy("timestamp", "desc").onSnapshot(snapshot => {
    ordersContainer.innerHTML = "";
    snapshot.forEach(doc => {
      const order = doc.data();
      const div = document.createElement("div");
      div.classList.add("order-details");
      div.innerHTML = `
        <strong>Tracking:</strong> ${order.trackingCode}<br>
        <strong>Name:</strong> ${order.name}<br>
        <strong>Phone:</strong> ${order.phone}<br>
        <strong>Category:</strong> ${order.category} → ${order.space} → ${order.subcategory}<br>
        <strong>Wood Type:</strong> ${order.woodType}<br>
        <strong>Instructions:</strong> ${order.instructions}<br>
        <strong>Prompt:</strong> ${order.prompt}<br>
        <strong>Other:</strong> ${order.otherDetails}<br>
        <strong>Location:</strong> ${order.location}<br>
        ${order.imageURL ? `<img src="${order.imageURL}" class="order-image" alt="Order Image">` : ""}
      `;
      ordersContainer.appendChild(div);
    });
  });
}

// Upload Project to Gallery
document.getElementById("galleryUploadForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const file = document.getElementById("galleryImage").files[0];
  if (!file) return alert("Please select an image.");

  const title = document.getElementById("galleryTitle").value;
  const description = document.getElementById("galleryDescription").value;

  const storageRef = storage.ref(`gallery/${Date.now()}_${file.name}`);
  await storageRef.put(file);
  const url = await storageRef.getDownloadURL();

  await db.collection("gallery").add({
    title,
    description,
    imageURL: url,
    timestamp: Date.now()
  });

  alert("Project uploaded to gallery!");
  document.getElementById("galleryUploadForm").reset();
  loadGallery();
});

// Load Gallery for Admin View
function loadGallery() {
  const galleryList = document.getElementById("galleryList");
  galleryList.innerHTML = "Loading...";

  db.collection("gallery").orderBy("timestamp", "desc").onSnapshot(snapshot => {
    galleryList.innerHTML = "";
    snapshot.forEach(doc => {
      const project = doc.data();
      const div = document.createElement("div");
      div.classList.add("order-details");
      div.innerHTML = `
        <strong>Title:</strong> ${project.title}<br>
        <strong>Description:</strong> ${project.description}<br>
        <img src="${project.imageURL}" class="order-image" alt="Gallery Image">
      `;
      galleryList.appendChild(div);
    });
  });
}