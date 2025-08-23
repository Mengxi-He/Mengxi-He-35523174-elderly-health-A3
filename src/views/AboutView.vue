<template>
  <div class="container mt-5" style="max-width: 800px;">
    <!-- Skip link for keyboard navigation -->
    <a href="#main-content" class="skip-link">Skip to main content</a>
    
    <main id="main-content">
      <h1 class="mb-4 text-center">About ElderCare Connect</h1>

      <!-- Mission -->
      <section class="mb-5" aria-labelledby="mission-heading">
        <h2 id="mission-heading"><span aria-hidden="true">🌟</span> Our Mission</h2>
        <p>
          ElderCare Connect is dedicated to improving the lives of elderly individuals by providing easy access
          to health resources, equipment, and compassionate community support.
        </p>
      </section>

      <!-- Who We Are -->
      <section class="mb-5" aria-labelledby="who-we-are-heading">
        <h2 id="who-we-are-heading"><span aria-hidden="true">👥</span> Who We Are</h2>
        <p>
          We are a student-led initiative from Southeast University, committed to building a digital platform
          that bridges elderly citizens with healthcare tools, events, and volunteer services.
        </p>
      </section>

      <!-- What We Offer -->
      <section class="mb-5" aria-labelledby="what-we-offer-heading">
        <h2 id="what-we-offer-heading"><span aria-hidden="true">🛠</span> What We Offer</h2>
        <ul role="list">
          <li><span aria-hidden="true">📦</span> Free borrowing of medical equipment like walkers and thermometers</li>
          <li><span aria-hidden="true">📅</span> Access to health seminars and community events</li>
          <li><span aria-hidden="true">🤝</span> Volunteer support for daily companionship and technical help</li>
        </ul>
      </section>

      <!-- Target Users -->
      <section class="mb-5" aria-labelledby="target-users-heading">
        <h2 id="target-users-heading"><span aria-hidden="true">👵</span> Who It's For</h2>
        <p>
          This platform is designed primarily for elderly users, their families, and community volunteers
          who want to engage in meaningful support services.
        </p>
      </section>

      <!-- Team & Contact -->
      <section class="mb-5" aria-labelledby="contact-heading">
        <h2 id="contact-heading"><span aria-hidden="true">📬</span> Contact & Credits</h2>
        <p>
          Built by passionate students from Southeast University.<br />
          Contact us at: <a href="mailto:mhee0033@student.monash.edu" aria-label="Send email to mhee0033@student.monash.edu">mhee0033@student.monash.edu</a>
        </p>
      </section>
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
a:focus {
  outline: 2px solid #0d6efd;
  outline-offset: 2px;
}

/* Ensure sufficient color contrast - WCAG 1.4.3 */
h1, h2 {
  color: #212529;
}

p, li {
  color: #495057;
  line-height: 1.6;
}
</style>
