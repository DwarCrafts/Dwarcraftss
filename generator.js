import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";
import spaces from "./spaces.json" assert { type: "json" };

// ✅ Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyCvZqDkc9ry9WwkT0rvK30-ZvWv_-7vmig",
  authDomain: "dwarcrafts-firebase.firebaseapp.com",
  projectId: "dwarcrafts-firebase",
  storageBucket: "dwarcrafts-firebase.appspot.com",
  messagingSenderId: "91776713343",
  appId: "1:91776713343:web:63fab986c65c7a7800f54a"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// 🌟 Elements
const form = document.getElementById("orderForm");
const category = document.getElementById("category");
const space = document.getElementById("space");
const subcategory = document.getElementById("subcategory");
const imageUpload = document.getElementById("imageUpload");
const imagePreview = document.getElementById("imagePreview");
const aiPreview = document.getElementById("aiPreview");
const aiPrompt = document.getElementById("aiPrompt");
const generateAI = document.getElementById("generateAI");
const darkModeToggle = document.getElementById("darkModeToggle");
const otherDetailsField = document.getElementById("otherDetailsField");

// 🌙 Dark Mode
darkModeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});

// 🎯 Dynamic Category -> Space -> Subcategory
category.addEventListener("change", () => {
  space.innerHTML = '<option disabled selected>Select a space</option>';
  subcategory.innerHTML = '<option disabled selected>Select a subcategory</option>';
  if (spaces[category.value]) {
    Object.keys(spaces[category.value]).forEach(spc => {
      const opt = document.createElement("option");
      opt.value = spc;
      opt.textContent = spc;
      space.appendChild(opt);
    });
  }
});

space.addEventListener("change", () => {
  subcategory.innerHTML = '<option disabled selected>Select a subcategory</option>';
  const selected = spaces[category.value][space.value];
  selected.forEach(item => {
    const opt = document.createElement("option");
    opt.value = item;
    opt.textContent = item;
    subcategory.appendChild(opt);
  });
});

subcategory.addEventListener("change", () => {
  otherDetailsField.style.display = subcategory.value === "Other" ? "block" : "none";
});

// 🖼️ Image Preview
imageUpload.addEventListener("change", () => {
  const file = imageUpload.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = e => {
      imagePreview.src = e.target.result;
      imagePreview.style.display = "block";
    };
    reader.readAsDataURL(file);
  }
});

// 🤖 AI Generation (DeepAI)
generateAI.addEventListener("click", async () => {
  const prompt = aiPrompt.value.trim();
  if (!prompt) return alert("Enter a prompt for AI image generation.");
  try {
    const res = await fetch("https://api.deepai.org/api/text2img", {
      method: "POST",
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'api-key': "quickstart-QUdJIGlzIGNvbWluZy4uLi4K"
      },
      body: `text=${encodeURIComponent(prompt)}`
    });
    const data = await res.json();
    if (data.output_url) {
      aiPreview.src = data.output_url;
      aiPreview.style.display = "block";
    }
  } catch (err) {
    console.error(err);
    alert("AI generation failed.");
  }
});

// 📦 Submit Order
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const woodType = document.getElementById("woodType").value.trim();
  const location = document.getElementById("location").value.trim();
  const instructions = document.getElementById("instructions").value.trim();
  const other = document.getElementById("otherDetails").value.trim() || "N/A";
  const prompt = aiPrompt.value.trim();

  const trackingCode = `DC${Date.now().toString().slice(-6)}`;
  let imageURL = "";

  // Upload image or use AI image
  if (imageUpload.files[0]) {
    const file = imageUpload.files[0];
    const storageRef = ref(storage, `orders/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    imageURL = await getDownloadURL(storageRef);
  } else if (aiPreview.src.startsWith("http")) {
    imageURL = aiPreview.src;
  }

  // 📝 Order Data
  const order = {
    name,
    phone,
    category: category.value,
    space: space.value,
    subcategory: subcategory.value,
    woodType,
    location,
    instructions,
    other,
    prompt,
    imageURL,
    trackingCode,
    timestamp: Date.now()
  };

  // ✅ Save to Firebase
  await addDoc(collection(db, "orders"), order);

  // ✅ WhatsApp Notification
  const msg = encodeURIComponent(`
🪵 *New DwarCrafts Order* 🪵
Tracking Code: ${trackingCode}
Name: ${name}
Phone: ${phone}
Category: ${category.value}
Space: ${space.value}
Subcategory: ${subcategory.value}
Wood Type: ${woodType}
Location: ${location}
Instructions: ${instructions}
Other Details: ${other}
Prompt: ${prompt}
Image: ${imageURL}
  `);
  window.open(`https://wa.me/254714129889?text=${msg}`, "_blank");

  alert(`Order submitted! Tracking Code: ${trackingCode}`);
  form.reset();
  imagePreview.src = "";
  aiPreview.src = "";
  imagePreview.style.display = "none";
  aiPreview.style.display = "none";
});