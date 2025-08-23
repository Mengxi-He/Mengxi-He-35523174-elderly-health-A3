<template>
  <div class="container-fluid px-0">
    <!-- Skip link for keyboard navigation -->
    <a href="#main-content" class="skip-link">Skip to main content</a>

    <main id="main-content">
      <!-- 1. Hero Section -->
      <section class="bg-light text-center py-5" aria-labelledby="hero-heading">
        <h1 id="hero-heading" class="display-4 fw-bold">Welcome to ElderCare Connect</h1>
        <p class="lead mt-3 mx-auto" style="max-width: 600px;">
          A health and charity platform dedicated to supporting our senior community
          with accessible medical services, community events, and volunteer support.
        </p>
        <nav class="mt-4" aria-label="Main actions">
          <router-link 
            to="/register" 
            class="btn btn-primary btn-lg me-3"
            aria-label="Get started with ElderCare Connect"
          >
            Get Started
          </router-link>
          <router-link 
            to="/about" 
            class="btn btn-outline-secondary btn-lg"
            aria-label="Learn more about ElderCare Connect"
          >
            Learn More
          </router-link>
        </nav>
      </section>

      <!-- 2. Features Section -->
      <section class="container py-5" aria-labelledby="features-heading">
        <h2 id="features-heading" class="visually-hidden">Platform Features</h2>
        <div class="row text-center">
          <div class="col-md-4 mb-4">
            <article class="card h-100 shadow-sm border-0" role="region" aria-labelledby="medical-equipment-heading">
              <div class="card-body">
                <h3 id="medical-equipment-heading" class="mb-3">
                  <span aria-hidden="true">🩺</span> Medical Equipment
                </h3>
                <p>Browse and reserve devices like walkers, thermometers, or blood pressure monitors — free and easy.</p>
              </div>
            </article>
          </div>

          <div class="col-md-4 mb-4">
            <article class="card h-100 shadow-sm border-0" role="region" aria-labelledby="community-events-heading">
              <div class="card-body">
                <h3 id="community-events-heading" class="mb-3">
                  <span aria-hidden="true">📅</span> Community Events
                </h3>
                <p>Sign up for wellness lectures, exercise classes, and senior social gatherings near you.</p>
              </div>
            </article>
          </div>

          <div class="col-md-4 mb-4">
            <article class="card h-100 shadow-sm border-0" role="region" aria-labelledby="volunteer-help-heading">
              <div class="card-body">
                <h3 id="volunteer-help-heading" class="mb-3">
                  <span aria-hidden="true">🤝</span> Volunteer Help
                </h3>
                <p>Connect with kind-hearted volunteers for daily help, companionship, or digital guidance.</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <!-- 3. Role-Based Entry Section -->
      <section class="bg-light py-5" aria-labelledby="role-selection-heading">
        <div class="container text-center">
          <h2 id="role-selection-heading" class="mb-4">Who Are You?</h2>
          <div class="row justify-content-center">
            <div class="col-sm-6 col-md-4 mb-3">
              <article class="p-4 border rounded role-card" role="region" aria-labelledby="senior-role-heading">
                <h3 id="senior-role-heading"><span aria-hidden="true">👵</span> I'm a Senior</h3>
                <p class="small">Access equipment, view your events, and manage your account.</p>
                <router-link 
                  to="/login" 
                  class="btn btn-outline-primary btn-sm"
                  aria-label="Log in as a senior citizen"
                >
                  Log In
                </router-link>
              </article>
            </div>
            <div class="col-sm-6 col-md-4 mb-3">
              <article class="p-4 border rounded role-card" role="region" aria-labelledby="volunteer-role-heading">
                <h3 id="volunteer-role-heading"><span aria-hidden="true">🙋</span> I'm a Volunteer</h3>
                <p class="small">Join events, track service hours, and support the elderly.</p>
                <router-link 
                  to="/login" 
                  class="btn btn-outline-primary btn-sm"
                  aria-label="Log in as a volunteer"
                >
                  Log In
                </router-link>
              </article>
            </div>
          </div>
        </div>
      </section>

      <!-- 4. Footer -->
      <footer class="text-center text-muted py-4 small" role="contentinfo">
        <p>© 2025 ElderCare Connect · All rights reserved · Mengxi He</p>
      </footer>
    </main>
  </div>
</template>

<script setup>
</script>

<style scoped>
/* Skip link for keyboard navigation - WCAG 2.4.1 */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: #000;
  color: #fff;
  padding: 8px;
  text-decoration: none;
  z-index: 1000;
  border-radius: 4px;
}

.skip-link:focus {
  top: 6px;
}

/* Improve focus visibility - WCAG 2.4.7 */
a:focus, .btn:focus {
  outline: 2px solid #0d6efd;
  outline-offset: 2px;
}

/* Role card hover and focus states */
.role-card {
  transition: all 0.2s ease-in-out;
}

.role-card:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  transform: translateY(-2px);
}

.role-card:focus-within {
  box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.25);
}

/* Ensure sufficient color contrast - WCAG 1.4.3 */
h1, h2, h3 {
  color: #212529;
}

p {
  color: #495057;
  line-height: 1.6;
}

/* Improve card accessibility */
.card {
  transition: all 0.2s ease-in-out;
}

.card:hover {
  box-shadow: 0 6px 12px rgba(0,0,0,0.15);
}

.card:focus-within {
  box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.25);
}
</style>
