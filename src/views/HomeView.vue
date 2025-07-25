<template>
  <div class="container-fluid px-0">

    <!-- 1. Hero Section -->
    <section class="bg-light text-center py-5">
      <h1 class="display-4 fw-bold">Welcome to ElderCare Connect</h1>
      <p class="lead mt-3 mx-auto" style="max-width: 600px;">
        A health and charity platform dedicated to supporting our senior community
        with accessible medical services, community events, and volunteer support.
      </p>
      <div class="mt-4">
        <router-link to="/register" class="btn btn-primary btn-lg me-3">Get Started</router-link>
        <router-link to="/about" class="btn btn-outline-secondary btn-lg">Learn More</router-link>
      </div>
    </section>

    <!-- 2. Features Section -->
    <section class="container py-5">
      <div class="row text-center">
        <div class="col-md-4 mb-4">
          <div class="card h-100 shadow-sm border-0">
            <div class="card-body">
              <h3 class="mb-3">🩺 Medical Equipment</h3>
              <p>Browse and reserve devices like walkers, thermometers, or blood pressure monitors — free and easy.</p>
            </div>
          </div>
        </div>

        <div class="col-md-4 mb-4">
          <div class="card h-100 shadow-sm border-0">
            <div class="card-body">
              <h3 class="mb-3">📅 Community Events</h3>
              <p>Sign up for wellness lectures, exercise classes, and senior social gatherings near you.</p>
            </div>
          </div>
        </div>

        <div class="col-md-4 mb-4">
          <div class="card h-100 shadow-sm border-0">
            <div class="card-body">
              <h3 class="mb-3">🤝 Volunteer Help</h3>
              <p>Connect with kind-hearted volunteers for daily help, companionship, or digital guidance.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 3. Role-Based Entry Section -->
    <section class="bg-light py-5">
      <div class="container text-center">
        <h2 class="mb-4">Who Are You?</h2>
        <div class="row justify-content-center">
          <div class="col-sm-6 col-md-4 mb-3">
            <div class="p-4 border rounded">
              <h4>👵 I'm a Senior</h4>
              <p class="small">Access equipment, view your events, and manage your account.</p>
              <router-link to="/login" class="btn btn-outline-primary btn-sm">Log In</router-link>
            </div>
          </div>
          <div class="col-sm-6 col-md-4 mb-3">
            <div class="p-4 border rounded">
              <h4>🙋 I'm a Volunteer</h4>
              <p class="small">Join events, track service hours, and support the elderly.</p>
              <router-link to="/login" class="btn btn-outline-primary btn-sm">Log In</router-link>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 4. Footer -->
    <footer class="text-center text-muted py-4 small">
      © 2025 ElderCare Connect · All rights reserved · Mengxi He 
    </footer>
  </div>
</template>

<script setup>
</script>
