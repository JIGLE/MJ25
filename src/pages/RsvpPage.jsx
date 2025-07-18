import React from 'react';
import { useTranslation } from 'react-i18next'; // Import hook
import RsvpForm from '../components/RsvpForm'; // Import the form component

function RsvpPage() {
  const { t } = useTranslation(); // Get translation function

  // TODO: Add 'rsvpInstruction' key to translation files if not present
  return (
    // Remove the outer <main> and flex classes, let App.jsx handle the main layout
    // Removed py-5 padding to test layout
    <div className="rsvp-page-container container text-center">
      <section id="rsvp-section" className="py-5"> {/* Moved padding to section */}
       <h2>{t('rsvp')}</h2>
        <p>{t('rsvpInstruction', 'Please let us know if you can make it by filling out the form below.')}</p>
        <div id="rsvp-form-container" style={{ textAlign: 'left' }}>
          {/* Render the RsvpForm component */}
          <RsvpForm />
        </div>
      </section>
    </div>
  );
}

export default RsvpPage;
