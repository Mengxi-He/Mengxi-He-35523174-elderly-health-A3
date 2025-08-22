import 'bootstrap/dist/css/bootstrap.min.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

//For the map function: Here, introduce the CSS of Leaflet
import "leaflet/dist/leaflet.css";

import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'


const app = createApp(App)
app.use(PrimeVue, { theme: { preset: Aura } })
app.use(router)


app.mount('#app')

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBjWY5VZjJiO2CCYhQmF9Dg4K96oh9o45E",
  authDomain: "mengxi-he-5032-a3.firebaseapp.com",
  projectId: "mengxi-he-5032-a3",
  storageBucket: "mengxi-he-5032-a3.firebasestorage.app",
  messagingSenderId: "429108840885",
  appId: "1:429108840885:web:5d89823ef38b6a310731fc"
};

// Initialize Firebase
initializeApp(firebaseConfig);