// Main application entry point
import { Navbar } from '../components/Navbar';
import { RsvpForm } from '../components/RsvpForm';
import { Timeline } from '../components/Timeline';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize components
    new Navbar().init();
    new RsvpForm().init();
    new Timeline().init();
});
