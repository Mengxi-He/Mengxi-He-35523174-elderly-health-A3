<template>
  <div class="container mt-5">
    <!-- Skip link for keyboard navigation -->
    <a href="#main-content" class="skip-link">Skip to main content</a>
    
    <main id="main-content">
      <h1><span aria-hidden="true">💊</span> Free Help</h1>
      <p class="lead">Explore free assistance options and community resources available to you.</p>
      
      <section aria-labelledby="help-options-heading">
        <h2 id="help-options-heading" class="visually-hidden">Available Help Options</h2>
        
        <div class="row mt-4">
          <div class="col-md-6 mb-4">
            <div class="card h-100">
              <div class="card-body">
                <h3 class="card-title"><span aria-hidden="true">🩺</span> Medical Equipment</h3>
                <p class="card-text">Borrow medical equipment like walkers, blood pressure monitors, and thermometers at no cost.</p>
                <router-link to="/equipment" class="btn btn-primary" aria-label="Browse available medical equipment">
                  Browse Equipment
                </router-link>
              </div>
            </div>
          </div>
          
          <div class="col-md-6 mb-4">
            <div class="card h-100">
              <div class="card-body">
                <h3 class="card-title"><span aria-hidden="true">🤝</span> Volunteer Support</h3>
                <p class="card-text">Connect with volunteers for companionship, daily assistance, and technical support.</p>
                <router-link to="/volunteer-area" class="btn btn-primary" aria-label="Find volunteer support">
                  Find Volunteers
                </router-link>
              </div>
            </div>
          </div>
        </div>
        
        <div class="row">
          <div class="col-md-6 mb-4">
            <div class="card h-100">
              <div class="card-body">
                <h3 class="card-title"><span aria-hidden="true">📅</span> Community Events</h3>
                <p class="card-text">Join health seminars, exercise classes, and social gatherings in your community.</p>
                <router-link to="/recent-activities" class="btn btn-primary" aria-label="View community events">
                  View Events
                </router-link>
              </div>
            </div>
          </div>
          
          <div class="col-md-6 mb-4">
            <div class="card h-100">
              <div class="card-body">
                <h3 class="card-title"><span aria-hidden="true">📍</span> Local Resources</h3>
                <p class="card-text">Find nearby healthcare facilities, pharmacies, and community centers on our interactive map.</p>
                <router-link to="/interactive-map" class="btn btn-primary" aria-label="Explore local resources on map">
                  Explore Map
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup></script>

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

/* Card hover effects */
.card {
  transition: all 0.2s ease-in-out;
}

.card:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  transform: translateY(-2px);
}

.card:focus-within {
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
</style>
